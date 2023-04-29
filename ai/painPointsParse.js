import { log, bold, blue } from "./utils/log.js";

import fs from "fs";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { parseTable } from "./utils/parseTable.js";

import { PAIN_POIN_STATUS } from "./utils/index.js";


try {
	log(blue("Starting"));
	await sqlite.open(DB_FILE);
	
	const painPointsFiles = await fs.promises.readdir("./pain_points");
	
	for (const file of painPointsFiles) {
		const painPoint = JSON.parse(await fs.promises.readFile(`./pain_points/${file}`, "utf8"));
		
		// Skip if not new
		if (painPoint.status !== PAIN_POIN_STATUS.NEW) continue;
		
		const dataTable = parseTable(painPoint.content);
		
		for (const results of dataTable) {
			const query = {
				audience_id: painPoint.audience_id,
				title: results[0].toLowerCase(),
				slug: slugify(results[0], { remove: ":", lower: true, trim: true }),
				description: results[1].toLowerCase(),
			};
			console.log(`${blue(query.audience)}\n${query.title}\n${bold(query.description)}`);
			await sqlite.insertRow("pain_points", query);
		}
		
		painPoint.status = PAIN_POIN_STATUS.PARSED;
		await fs.promises.writeFile(`./pain_points/${painPoint.audience_slug}.json`, JSON.stringify(data, null, 2));
		
	}
	
	await sqlite.close();
	log(blue("Done"));
} catch (e) {
	console.log(e);
}
