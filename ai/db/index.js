import sqlite3 from "sqlite3";

export let db;

const DB_FILE = null;

export const open = (path = DB_FILE) => {
    return new Promise((resolve) => {
        // console.log(path);
        db = new sqlite3.Database(path, (err) => {
            if (err) reject(`Open error: ${err.message}`);
            else resolve(`${path} opened`);
        });
    });
};

// any query: insert/delete/update

export const run = (query) => {
    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) reject(err.message);
            else resolve(db.changes);
        });
    });
};

export const runEscape = (query, data) => {
    return new Promise((resolve, reject) => {
        db.run(query, data, (err) => {
            if (err) reject(err.message);
            else resolve(true);
        });
    });
};

// first row read
export const get = (query, params) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(`Read error: ${err.message}`);
            else {
                resolve(row);
            }
        });
    });
};

// set of rows read
export const all = (query, params) => {
    return new Promise((resolve, reject) => {
        if (params === undefined) params = [];

        db.all(query, params, (err, rows) => {
            if (err) reject(`Read error: ${err.message}`);
            else {
                resolve(rows);
            }
        });
    });
};

// each row returned one by one
export const each = (query, params, action) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.each(query, params, (err, row) => {
                if (err) reject(`Read error: ${err.message}`);
                else {
                    if (row) {
                        action(row);
                    }
                }
            });
            db.get("", (err, row) => {
                resolve(true);
            });
        });
    });
};

export const close = () => {
    return new Promise((resolve, reject) => {
        db.close();
        resolve(true);
    });
};

export async function insertRow(table, data) {
    const sql = `INSERT INTO ${table} (${Object.keys(data)
        .map((key) => `${key}`)
        .join(",")}) VALUES (${Object.keys(data)
        .map((_) => "?")
        .join(",")})`;

    const data_temp = [];
    for (const property in data) {
        data_temp.push(data[property]);
    }

    try {
        return runEscape(sql, data_temp);
        // if (result) console.log("Inserted:", data.pageid, data.title);
    } catch (e) {
        console.log(e, data_temp);
    }
}