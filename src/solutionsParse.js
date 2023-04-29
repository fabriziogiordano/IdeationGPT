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
		let features = solution[1].split("<br>").map((feature) => feature.replaceAll(/\d.*?\. /g, "").trim());
		features = JSON.stringify(features, null, 0);
		const query = {
			solution: solution[0],
			features: features,
			competitors: solution[2],
			differentiator: solution[3],

			problem_id: solutions.problem_id,
			audience: solutions.audience,
			pain_point_short: solutions.pain_point_short,
			pain_point_description: solutions.pain_point_description,
		};
		
		await sqlite.insertRow("solutions", query);
	}
}

await sqlite.close();
