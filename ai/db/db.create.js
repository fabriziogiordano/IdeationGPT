import fs from "fs";
import * as sqlite from "./index.js";
const DB_FILE = "DB.db";

try {
  fs.unlinkSync(DB_FILE);
  console.log(`${DB_FILE} removed`);
} catch (e) {
    // console.log(e);
}

async function mainApp() {
    try {
        console.log(await sqlite.open(DB_FILE));

        let table = "";

        table = "problems";
        await sqlite.run(`
          CREATE TABLE ${table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audience text,
            audience_slug text,
            pain_point_short text,
            pain_point_short_slug text,
            pain_point_description text
          )
        `);
        console.log(`Table **${table}** created`);
        await sqlite.run(`CREATE INDEX audience_slug_index ON ${table} (audience_slug);`);
        // await sqlite.run(`CREATE INDEX space_index ON ${table} (audience);`);

        table = "solutions";
        await sqlite.run(`
          CREATE TABLE ${table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title text,
            title_slug text,
            description text,
            features text,
            competitors text,
            differentiator text, 

            problem_id integer,
            audience text,
            pain_point_short text,
            pain_point_description text
          )
        `);
        console.log(`Table **${table}** created`);
        await sqlite.run(`CREATE INDEX problem_id_index ON ${table} (problem_id);`);
        await sqlite.run(`CREATE INDEX title_slug_index ON ${table} (title_slug);`);

        await sqlite.close();
    } catch (e) {
        console.log(e);
    }
}

// try {
//   fs.unlinkSync(DB_FILE);
// } catch (e) {}

mainApp();