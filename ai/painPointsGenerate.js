import { log, bold, blue } from "./utils/log.js";
import fs from "fs";

import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

import { openAI } from "./utils/openai.js";

import { AUDIENCE_STATUS, PAIN_POINT_STATUS } from "./utils/index.js";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

const system_prompt = `
CONTEXT:
You are IdeationGPT, a professional customer researcher who helps entrepreneurs find AUDIENCE pain points. You are a world-class expert in finding overlooked problems that Entrepreneurs can easily monetize.

GOAL:
Return 10 possible pain points for the target audience segment. These solution need to be built as profitable one-person business.

PAIN POINTS CRITERIA:
- Prioritize critical pain points that are valid and recurring
- Prioritize pain points that can't be ignored or otherwise, the person will face severe negative consequences
- 50% of the pain points shouldn't be mainstream. Give me hidden gems that only a world-class IdeationGPT would know
- Be specific and concise to make this table easy-to-understand

You can use these criteria to help guide the pain points but feel free to use other based on relevance:
- Lack of time
- Lack of expertise
- Limited access to resources
- Limited budget
- Health concerns
- Environmental concerns
- Convenience
- Need for personalization
- Need for remote access or virtual options
- Need for education or guidance

RESPONSE FORMAT:
Generate a markdown table with 2 columns:
- short: short description of the pain point
- long: long description of the pain point
`;

try {
	log(blue("Starting"));
	await sqlite.open(DB_FILE);
	const audiences = await getAudiences();
	//console.log(audiences); process.exit();

	const s = new Sema(10, { capacity: audiences.length });
	await Promise.all(
		audiences.map(async (audience) => {
			await s.acquire();
			await generageIdeas(audience);
			s.release();
		}),
	);
	await sqlite.close();
	log(blue("Done"));
} catch (e) {
	console.log(e);
}

async function getAudiences() {
	const audiences = await sqlite.all(`SELECT id, title, slug FROM audiences WHERE status = ${AUDIENCE_STATUS.EMPTY}`);
	return audiences;
}

async function generageIdeas(audience) {
	await lim();

	await sqlite.runEscape("UPDATE audiences SET status = ? WHERE id = ?", [AUDIENCE_STATUS.INPROGRESS, audience.id]);

	log(`${bold("Audience:")} ${audience.title}`);
	const user_prompt = `AUDIENCE: ${audience.title}`;
	const data = await openAI(system_prompt, user_prompt);
	data.status = PAIN_POINT_STATUS.NEW;
	data.audience_title = audience.title;
	data.audience_slug = audience.slug;
	data.audience_id = audience.id;
	await fs.promises.writeFile(`./pain_points/${audience.slug}.json`, JSON.stringify(data, null, 2));

	await sqlite.runEscape("UPDATE audiences SET status = ? WHERE id = ?", [AUDIENCE_STATUS.COMPLETED, audience.id]);
}
