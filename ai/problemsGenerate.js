import { log, bold, blue } from "./utils/log.js";
import fs from "fs";
import slugify from "slugify";

import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

import { openAI } from "./utils/openai.js";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

log(blue("Starting"));

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
Generate a table with 2 columns:
- short: one with a short description of the pain point
- long: one with a longer description of the pain point
`;

try {
	const data = getPrompts();
	const s = new Sema(10, { capacity: data.length });
	await Promise.all(
		data.map(async ({ audience }) => {
			await s.acquire();
			await generageIdeas({ audience });
			s.release();
		}),
	);
} catch (e) {
	console.log(e);
}

log(blue("Done"));

function getPrompts() {
	const data = [];
	data.push({ audience: "online education" });
	data.push({ audience: "scuba diving" });
	return data;
}

async function generageIdeas({ audience }) {
	await lim();
	log(`${bold("Audience:")} ${audience}`);
	const user_prompt = `AUDIENCE: ${audience}`;
	const data = await openAI(system_prompt, user_prompt);
	const slug = slugify(audience, { replacement: "_", remove: ":", lower: true, trim: true });
	data.audience = audience;
	fs.writeFileSync(`../problems/overall.${slug}.json`, JSON.stringify(data, null, 2));
}
