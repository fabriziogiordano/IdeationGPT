import { log, bold, blue } from "./utils/log.js";

import fs from "fs";
import slugify from "slugify";
import { openAI } from "./utils/openai.js";
import { parseTable } from "./utils/parseTable.js";
import { saveToSpreadSheet } from "./utils/googleSheetsService.js";
import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

// import { audience_list } from "./audience_list.js";

log(blue("Starting\n"));

try {
	const data = getProblems();
	const count_total = data.length;
	const s = new Sema(10, { capacity: count_total });
	await Promise.all(
		data.map(async ({problem, need}) => {
			await s.acquire();
			await generageIdeas({ problem, need, waiting: s.nrWaiting() });
			s.release();
		}),
	);
} catch (e) {
	console.log(e);
}

log(blue("\nDone"));

async function generageIdeas({ problem, need, waiting }) {
	await lim();

	log(`${waiting} - ${bold("Problem:")} ${problem} → ${bold("details:")} ${need}`);
	const message = `Users with ${problem} problem and want ${need}`;
	const message_slug = slugify(message, { replacement: "_", lower: true, trim: true });
	
	const result = await openAI(message);
	
	fs.writeFileSync(`../results/${message_slug}.json`, JSON.stringify(result, null, 2));

	await saveToSpreadSheet(message_slug, result);
}

function getProblems() {
	const problems = JSON.parse(fs.readFileSync("../problems/problems.json")).content;
	const dataTable = parseTable(problems).slice(2); // remove the first 2 rows
	const data = [];
	for (const problem of dataTable) {
		for (const details of problem[1]) {
			data.push({
				problem: problem[0],
				need: details,
			});
		}
	}
	return data;
}
