import { log, bold, blue } from "./utils/log.js";

import fs from "fs";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { parseTable } from "./utils/parseTable.js";

log(blue("Starting"));

await sqlite.open(DB_FILE);

const solutionsFiles = fs.readdirSync("../solutions");

for (const file of solutionsFiles) {
	// if(file !=="scuba_diving_difficulty_finding_spectacular_dive_locations.json") continue;
	log(`FILE: ${blue(file)}`);
	let solutions = fs.readFileSync(`../solutions/${file}`, "utf8");
	solutions = JSON.parse(solutions);
	solutions.content = parseTable(solutions.content);

	console.log(solutions.content);


	for (const solution of solutions.content) {
		solution[0] = solution[0]?.replaceAll(/\d.*?\. /g, "").trim();
		solution[2] = solution[2]?.replaceAll(/\d.*?\. /g, "").replaceAll("- ", "").trim();
		solution[3] = solution[3]?.replaceAll(/\d.*?\. /g, "").replaceAll("<br>-", "").trim();
		const query = {
			title: solution[0].toLowerCase(),
			title_slug: slugify(solution[0], { remove: ":", lower: true, trim: true }),
			description: solution[1],
			features: solution[2],
			competitors: solution[3],
			differentiator: solution[4],

			problem_id: solutions.problem_id,
			// audience: solutions.audience,
			// pain_point_short: solutions.pain_point_short,
			// pain_point_description: solutions.pain_point_description,
		};
		
		await sqlite.insertRow("solutions", query);
	}
}

await sqlite.close();
