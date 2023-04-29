import { log, bold, blue } from "./utils/log.js";
import fs from "fs";
import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { parseTable } from "./utils/parseTable.js";

log(blue("Starting"));

await sqlite.open(DB_FILE);

const problemsFiles = fs.readdirSync("../problems");

for (const file of problemsFiles) {
	let problem = fs.readFileSync(`../problems/${file}`, "utf8");
	problem = JSON.parse(problem);
	const dataTable = parseTable(problem.content);

	for (const results of dataTable) {
		const query = {
			audience: problem.audience,
			pain_point_short: results[0].toLowerCase(),
			pain_point_description: results[1].toLowerCase(),
		};
		console.log(`${blue(query.audience)}\n${query.pain_point_short}\n${bold(query.pain_point_description)}`);
		await sqlite.insertRow("problems", query);
	}
}

await sqlite.close();