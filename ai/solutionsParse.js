import { log, bold, blue } from "./utils/log.js";

import fs from "fs";
import slugify from "slugify";

import * as sqlite from "./db/index.js";
const DB_FILE = "../astro/src/db/DB.db";

import { SOLUTIONS_STATUS } from "./utils/index.js";

import { parseTableSolutions } from "./utils/parseTable.js";

try {
	log(blue("Starting"));

	await sqlite.open(DB_FILE);

	const SOLUTIONS_PATH = "./solutions";
	const solutionsFiles = await fs.promises.readdir(SOLUTIONS_PATH);

	for (const file of solutionsFiles) {
		// if(file !=="scuba_diving_difficulty_finding_spectacular_dive_locations.json") continue;
		log(`FILE: ${blue(file)}`);
		const SOLUTIONS_PATH_FILE = `${SOLUTIONS_PATH}/${file}`;
		const data = JSON.parse(await fs.promises.readFile(SOLUTIONS_PATH_FILE, "utf8"));

		// Skip if not new
		if (data.status !== SOLUTIONS_STATUS.NEW) continue;

		data.content = parseTableSolutions(data.content);

		// If result is a table with right structure then save it
		if (data.content[0][0].toLowerCase().replaceAll('*', '') === "title") {
			data.content = data.content.slice(2); // remove title and separator

			for (const solution of data.content) {
				solution[0] = solution[0]?.replaceAll(/\d.*?\. /g, "").trim();
				solution[2] = solution[2]?.replaceAll(/\d.*?\. /g, "").replaceAll("- ", "").trim();
				solution[3] = solution[3]?.replaceAll(/\d.*?\. /g, "").replaceAll("<br>-", "").trim();

				let title = solution[0].toLowerCase()
				title = title.charAt(0).toUpperCase() + title.slice(1);

				const query = {
					title,
					slug: slugify(solution[0], { remove: ":", lower: true, trim: true }),
					description: solution[1],
					features: solution[2],
					competitors: solution[3],
					differentiator: solution[4],

					pain_point_id: data.pain_point_id,
					audience_id: data.audience_id,
				};
				//console.log(query);
				await sqlite.insertRow("solutions", query);
			}
		}
		else {
			console.log(`${file} is not a table`);
		}

		data.status = SOLUTIONS_STATUS.PARSED;
		await fs.promises.writeFile(SOLUTIONS_PATH_FILE, JSON.stringify(data, null, 2));
	}

	await sqlite.close();
	log(blue("Done"));
} catch (e) {
	console.log(e);
}
