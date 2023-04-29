import path from "path";
import { ROOT_PATH } from "~/config.js";
import * as sqlite from "~/db/index.js";

const BASE_DIR = process?.env?.BASE_DIR || ROOT_PATH;
const DB_FILE = path.join(BASE_DIR, "src", "db", "DB.db");

async function loadSqlite(query: string, other?: object) {
	if (query === null) {
		console.log("Query can't be null");
		process.exit();
	}
	
	await sqlite.open(DB_FILE);

	const queries = {
		problems: `
			SELECT
				id,
				audience,
				pain_point_short
			FROM 
				problems
		`,
		solutions: `
			SELECT
				title,
				description,
				features,
				competitors,
				differentiator
			FROM 
				solutions
			WHERE
				problem_id = ${other?.id}
	`,
	};

	const queryText = queries[query];

	// console.log(queryText);

	const rows = await sqlite.all(queryText);

	// await sqlite.close();
	return rows;
}

const _posts = {};

export async function runQuery(query, other = {}) {
	const cacheKey = JSON.stringify({ query, ...other });
	_posts[cacheKey] = cacheKey in _posts ? _posts[cacheKey] : loadSqlite(query, other);
	//_posts[cacheKey] = loadSqlite(query);

	// console.log(query);
	return await _posts[cacheKey];
}
