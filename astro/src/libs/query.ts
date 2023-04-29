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
		audiences: `
			SELECT
				*
			FROM
				audiences
		`,
		pain_points: `
			SELECT
				*
			FROM
				pain_points
			WHERE
				audience_id = ${other?.["audience_id"]}
		`,
		solutions: `
			SELECT
				*
			FROM
				solutions
			WHERE
					audience_id = ${other?.["audience_id"]}
				AND pain_point_id = ${other?.["pain_point_id"]}
		`,
		solutions2: `
			SELECT
				s.id as id,
				s.title as title,
				s.slug as slug,
				s.description as description,
				s.features as features,
				s.competitors as competitors,
				s.differentiator as differentiator,
				a.id as audience_id,
				a.title as audience_title,
				a.slug as audience_slug,
				p.id as pain_point_id,
				p.title as pain_point_title,
				p.slug as pain_point_slug,
				p.description as pain_point_description 
			FROM
				solutions s
			LEFT JOIN
				pain_points p ON s.pain_point_id = p.id
			LEFT JOIN
				audiences a ON s.audience_id = a.id
			ORDER BY a.id DESC, p.id DESC
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
