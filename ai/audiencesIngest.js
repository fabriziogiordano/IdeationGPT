import fs from "fs";
import slugify from "slugify";

import * as sqlite from "./db/index.js";
const DB_FILE = "./db/DB.db";

import { AUDIENCE_STATUS } from "./utils/index.js";

try {
	await sqlite.open(DB_FILE);
	const audiences = JSON.parse(await fs.promises.readFile("./audiences.json", "utf8"));
	for (const audience of audiences) {
		const audience_db = await sqlite.get("SELECT * FROM audiences WHERE title = ?", audience);
		if (!audience_db) {
			const data = [audience, slugify(audience, { lower: true, trim: true }), AUDIENCE_STATUS.EMPTY];
			console.log(data);
			await sqlite.runEscape("INSERT INTO audiences (title, slug, status) VALUES (?, ?, ?)", data);
		}
	}
	await sqlite.close();
} catch (e) {
	console.log(e);
}
