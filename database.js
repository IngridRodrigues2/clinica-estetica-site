const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db/clinica.sqlite", (err) => {
    if (err) {
        console.error("Erro ao conectar no banco:", err.message);
    } else {
        console.log("Banco conectado com sucesso!");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nascimento TEXT NOT NULL,
            telefone TEXT NOT NULL,
            email TEXT NOT NULL,
            cidade TEXT NOT NULL,
            data_consulta TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;