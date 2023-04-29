import { log, bold, blue } from "./utils/log.js";

import fs from "fs";
import slugify from "slugify";
import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { openAI } from "./utils/openai.js";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

const system_prompt = `
CONTEXT:
You are IdeationGPT, a professional customer researcher who helps entrepreneurs find the right solutions for an AUDIENCE with PAIN POINT.
You are a world-class expert in finding overlooked solutions that Entrepreneurs can easily monetize.

GOAL:
Return 5 solutions for the target audience segment. These solution need to be built as profitable one-person business.

SOLUTIONS CRITERIA:
- Prioritize critical solutions that are valid and recurring
- Prioritize solutions that can't be ignored or otherwise, the person will face severe negative consequences
- 70% of the solutions shouldn't be mainstream. Give me hidden gems that only a world-class IdeationGPT would know

RESPONSE FORMAT:
Generate a table with 5 columns:
1. solution title: title of the solution using at least 10 words
2. solution description: description of the solution using at least 100 words
3. features: top 5 features of the solution separated by comma
4. competitors: top 5 competitors names separated by comma
5. differentiator: description of key differentiators from the competitors

Be specific and concise to make this table easy-to-understand and actionable for the entrepreneur.
`;

log(blue("Starting"));

try {
	await sqlite.open(DB_FILE);
	const problems = await getProblems();
	// console.log(data); process.exit();

	const count_total = problems.length;
	const s = new Sema(10, { capacity: count_total });
	await Promise.all(
		problems.map(async ({ id, audience, pain_point_short, pain_point_description }) => {
			await s.acquire();
			await generageIdeas({ id, audience, pain_point_short, pain_point_description, waiting: s.nrWaiting() });
			s.release();
		}),
	);

	await sqlite.close();
} catch (e) {
	console.log(e);
}

log(blue("Done"));

async function generageIdeas({ id, audience, pain_point_short, pain_point_description, waiting }) {
	await lim();

	log(`${bold("Audience:")} ${audience} → ${bold("Details:")} ${pain_point_short}`);
	// const message = `Users with ${problem} problem and want ${need}`;
	// const message_slug = slugify(message, { replacement: "_", lower: true, trim: true });

	const user_prompt = `
AUDIENCE: ${audience}
PAIN POINT: ${pain_point_short} - ${pain_point_description}
	`;
	const solutions = await openAI(system_prompt, user_prompt);

	solutions.problem_id = id;
	solutions.audience = audience;
	solutions.pain_point_short = pain_point_short;
	solutions.pain_point_description = pain_point_description;

	const slug = slugify(`${audience} ${pain_point_short}`, { replacement: "_", remove: ":", lower: true, trim: true });
	fs.writeFileSync(`../solutions/${slug}.json`, JSON.stringify(solutions, null, 2));
}

async function getProblems() {
	const problems = await sqlite.all(`
		SELECT
			id,
			audience,
			pain_point_short,
			pain_point_description
		FROM
			problems
	`);
	return problems;
}
