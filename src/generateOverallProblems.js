import { log, bold, blue } from "./utils/log.js";
import fs from "fs";
import slugify from "slugify";

import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

import { openAISimple } from "./utils/openai.js";
import { parseTable } from "./utils/parseTable.js";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

log(blue("Starting"));

const prompt = `
CONTEXT:
You are an entrepreneur

GOAL:
You want to brainstorm possible customer pain points.
Define the top 10 customer problems in {PROBLEM}?

RESPONSE FORMAT:
Generate a table with 2 columns:
- one with a short description of the pain point
- one with a longer description of the pain point
`;

function getPrompts() {
	const data = [];
	data.push({ problem: "the online education space" });
	data.push({ problem: "the scuba diving space" });
	return data;
}

log(blue("\nDone"));

try {
	const data = getPrompts();
	const s = new Sema(10, { capacity: data.length });
	await Promise.all(
		data.map(async ({ problem }) => {
			await s.acquire();
			await generageIdeas({ problem, waiting: s.nrWaiting() });
			s.release();
		}),
	);
} catch (e) {
	console.log(e);
}

async function generageIdeas({ problem, waiting }) {
	await lim();

	log(`${bold("Problem:")} ${problem}`);
	const data = await openAISimple(prompt.replace("{PROBLEM}", problem));
	const slug = slugify(problem, { replacement: "_", lower: true, trim: true });
	fs.writeFileSync(`../problems/overall.${slug}.json`, JSON.stringify(data, null, 2));
}
