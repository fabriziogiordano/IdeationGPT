import sqlite3 from "sqlite3";

export let db;

export const open = (path) => {
  if (db && db.constructor.name === 'Database') {
    return db;
  }
    
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.log(err);
        reject(`Open error: ${err.message}`);
      }
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