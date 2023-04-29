import { log, bold, blue } from "./utils/log.js";

import fs from "fs";
import slugify from "slugify";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { parseTable } from "./utils/parseTable.js";

import { PAIN_POIN_STATUS } from "./utils/index.js";

try {
	log(blue("Starting"));
	await sqlite.open(DB_FILE);

	const painPointsFiles = await fs.promises.readdir("./pain_points");

	for (const file of painPointsFiles) {
		const data = JSON.parse(await fs.promises.readFile(`./pain_points/${file}`, "utf8"));

		// Skip if not new
		if (data.status !== PAIN_POIN_STATUS.NEW) continue;

		const dataTable = parseTable(data.content);

		for (const results of dataTable) {
			let description = results[1];
			while (description[description.length - 1] === ".") description = description.slice(0, -1);
			
			const query = {
				audience_id: data.audience_id,
				title: results[0].toLowerCase(),
				slug: slugify(results[0], { remove: ":", lower: true, trim: true }),
				description: description.toLowerCase(),
			};
			console.log(
				`${blue(`${data.audience_id} - ${data.audience_title}`)}\n${query.title}\n${bold(query.description)}`,
			);
			await sqlite.insertRow("pain_points", query);
		}

		data.status = PAIN_POIN_STATUS.PARSED;
		await fs.promises.writeFile(`./pain_points/${data.audience_slug}.json`, JSON.stringify(data, null, 2));
	}

	await sqlite.close();
	log(blue("Done"));
} catch (e) {
	console.log(e);
}
