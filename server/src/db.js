const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const filepath = path.join(__dirname, "..", "db", "coupons.db");

function createDbConnection() {
    if (fs.existsSync(filepath)) {
        console.log("Connection with SQLite has been established");
        return new sqlite3.Database(filepath);
    } else {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                return console.error(error.message);
            }
            createTable(db);
            console.log("DB created and connection with SQLite has been established");
        });
        return db;
    }
}

function createTable(db) {
    db.exec(`
        CREATE TABLE coupons
        (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            receiver VARCHAR(64) NOT NULL,
            amount VARCHAR(16) NOT NULL,
            code VARCHAR(16) NOT NULL,
            style INTEGER NOT NULL,
            created_time VARCHAR(40) NOT NULL
        );
    `);
}

async function insertRow(db, receiver, amount, style, code, created_time) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO coupons (receiver, amount, style, code, created_time) VALUES (?, ?, ?, ?, ?)`,
            [receiver, amount, style, code, created_time],
            function (error) {
                if (error) {
                    console.error(error.message);
                    reject(error);
                }
                console.log(`Inserted a row with the ID: ${this.lastID} for ${receiver}`);
                resolve(this.lastID);
            }
        );
    });
}

async function selectRows(db) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM coupons`, [], (error, rows) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            console.log(`Selected all rows from DB`);
            resolve(rows);
        });
    });
}

async function deleteRow(db, id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM coupons WHERE id = ?`, [id], function (error) {
            if (error) {
                console.error(error);
                reject(error);
            }
            console.log(`Row with the ID ${id} has been deleted`);
            resolve();
        });
    });
}

module.exports = {
    createDbConnection,
    insertRow,
    selectRows,
    deleteRow
}