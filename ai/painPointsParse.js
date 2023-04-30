import { log, bold, blue } from "./utils/log.js";

import fs from "fs";
import slugify from "slugify";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { parseTable } from "./utils/parseTable.js";

import { PAIN_POINT_STATUS } from "./utils/index.js";

try {
	log(blue("Starting"));
	await sqlite.open(DB_FILE);

	const PAIN_POINT_PATH = "./pain_points";
	const painPointsFiles = await fs.promises.readdir(PAIN_POINT_PATH);

	for (const file of painPointsFiles) {
		const PAIN_POINT_PATH_FILE = `${PAIN_POINT_PATH}/${file}`;
		const data = JSON.parse(await fs.promises.readFile(PAIN_POINT_PATH_FILE, "utf8"));

		// Skip if not new
		if (data.status !== PAIN_POINT_STATUS.NEW) continue;

		const dataTable = parseTable(data.content);

		for (const results of dataTable) {
			let title = results[0].toLowerCase();
			title = title.charAt(0).toUpperCase() + title.slice(1);

			let description = results[1];
			description = description.charAt(0).toUpperCase() + description.slice(1);
			while (description[description.length - 1] === ".") description = description.slice(0, -1);

			const query = {
				audience_id: data.audience_id,
				title,
				slug: slugify(results[0], { remove: ":", lower: true, trim: true }),
				description,
			};
			console.log(
				`${blue(`${data.audience_id} - ${data.audience_title}`)}\n${query.title}\n${bold(query.description)}`,
			);
			await sqlite.insertRow("pain_points", query);
		}

		data.status = PAIN_POINT_STATUS.PARSED;
		await fs.promises.writeFile(PAIN_POINT_PATH_FILE, JSON.stringify(data, null, 2));
	}

	await sqlite.close();
	log(blue("Done"));
} catch (e) {
	console.log(e);
}
