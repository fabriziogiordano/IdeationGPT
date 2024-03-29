import { log, bold, blue } from "./utils/log.js";

import fs from "fs";

import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

import * as sqlite from "./db/index.js";
const DB_FILE = "../astro/src/db/DB.db";

import { PAIN_POINT_SOLUTION_STATUS, SOLUTIONS_STATUS } from "./utils/index.js";

import { openAI } from "./utils/openai.js";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

const system_prompt = `
CONTEXT:
You are IdeationGPT, a professional customer researcher who helps entrepreneurs find the right solutions for an AUDIENCE with PAIN POINT.
You are a world-class expert in finding overlooked solutions that Entrepreneurs can easily monetize.

GOAL:
Return 10 solutions for the target audience segment. These solution need to be built as profitable one-person business.

SOLUTIONS CRITERIA:
- Prioritize critical solutions that are valid and recurring
- Prioritize solutions that can't be ignored or otherwise, the person will face severe negative consequences
- 70% of the solutions shouldn't be mainstream. Give me hidden gems that only a world-class IdeationGPT would know

RESPONSE FORMAT:
Generate a markdown table with 7 columns where each row is a solution.
In column 1: title - title of the solution using at least 10 words
In column 2: description - description of the solution using at least 100 words
In column 3: features - top 5 features of the solution separated by comma
In column 4: pros - top 5 pros of the solution separated by comma
In column 5: cons - top 5 const of the solution separated by comma
In column 6: competitors - top 5 competitors names separated by comma
In column 7: differentiator - description of key differentiators from the competitors

Be specific and concise to make this table easy-to-understand and actionable for the entrepreneur.
`;


try {
	log(blue("Starting"));
	await sqlite.open(DB_FILE);
	const painPoints = await getPainPoints();
	// console.log(painPoints); process.exit();

	const count_total = painPoints.length;
	const s = new Sema(10, { capacity: count_total });
	await Promise.all(
		painPoints.map(async (painPoint) => {
			await s.acquire();
			await generateSolutions({ painPoint, waiting: s.nrWaiting() });
			s.release();
		}),
	);

	await sqlite.close();
	log(blue("Done"));
} catch (e) {
	console.log(e);
}


async function generateSolutions({ painPoint, waiting }) {
	await lim();

	log(`${waiting} - ${bold("Audience:")} ${painPoint.audience_title} → ${bold("Details:")} ${painPoint.title}`);

	await sqlite.runEscape("UPDATE pain_points SET status = ? WHERE id = ?", [PAIN_POINT_SOLUTION_STATUS.INPROGRESS, painPoint.id]);

	const user_prompt = `AUDIENCE: ${painPoint.audience_title}\nPAIN POINT: ${painPoint.title} - ${painPoint.description}`;
	const solutions = await openAI(system_prompt, user_prompt);

	solutions.pain_point_id = painPoint.id;
	solutions.pain_point_title = painPoint.title;
	solutions.pain_point_description = painPoint.description;
	solutions.pain_point_slug = painPoint.slug;
	solutions.audience_id = painPoint.audience_id;
	solutions.audience_title = painPoint.audience_title;
	solutions.audience_slug = painPoint.audience_slug;
	solutions.status = SOLUTIONS_STATUS.NEW;

	const slug = `${painPoint.audience_slug}__${painPoint.slug}`;
	fs.writeFileSync(`./solutions/${slug}.json`, JSON.stringify(solutions, null, 2));

	await sqlite.runEscape("UPDATE pain_points SET status = ? WHERE id = ?", [PAIN_POINT_SOLUTION_STATUS.COMPLETED, painPoint.id]);

}

async function getPainPoints() {
	const painPoints = await sqlite.all(`
		SELECT
			p.id as id,
			p.title as title,
			p.slug as slug,
			p.description as description,
			a.id as audience_id,
			a.title as audience_title,
			a.slug as audience_slug
		FROM
			pain_points p
		LEFT JOIN
			audiences a ON p.audience_id = a.id
		WHERE p.status = ${PAIN_POINT_SOLUTION_STATUS.EMPTY}
	`);
	return painPoints;
}
