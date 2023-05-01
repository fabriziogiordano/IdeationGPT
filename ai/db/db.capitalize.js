import * as sqlite from "./index.js";
const DB_FILE = "../../astro/src/db/DB.db";
console.log(await sqlite.open(DB_FILE));

// Capitalize audiences
const audiences = await sqlite.all("SELECT * FROM audiences", []);
for (const audience of audiences) {
	const firstLetterUppercase = audience.title.charAt(0).toUpperCase() + audience.title.slice(1);
	console.log(firstLetterUppercase);
	await sqlite.runEscape("UPDATE audiences SET title = ? WHERE id = ?", [firstLetterUppercase,audience.id]);
}

// Capitalize pain points
const pain_points = await sqlite.all("SELECT * FROM pain_points", []);
for (const pain_point of pain_points) {
	const firstLetterUppercaseTitle = pain_point.title.charAt(0).toUpperCase() + pain_point.title.slice(1);
	const firstLetterUppercaseDescription = pain_point.description.charAt(0).toUpperCase() + pain_point.description.slice(1);
	console.log(firstLetterUppercaseTitle);
	console.log(firstLetterUppercaseDescription);
	await sqlite.runEscape("UPDATE pain_points SET title = ? WHERE id = ?", [firstLetterUppercaseTitle, pain_point.id]);
	await sqlite.runEscape("UPDATE pain_points SET description = ? WHERE id = ?", [firstLetterUppercaseDescription, pain_point.id]);
}


// Capitalize solutions
const solutions = await sqlite.all("SELECT * FROM solutions", []);
for (const solution of solutions) {
	const firstLetterUppercaseTitle = solution.title.charAt(0).toUpperCase() + solution.title.slice(1);
	console.log(firstLetterUppercaseTitle);
	await sqlite.runEscape("UPDATE solutions SET title = ? WHERE id = ?", [firstLetterUppercaseTitle, solution.id]);
}

await sqlite.close();
