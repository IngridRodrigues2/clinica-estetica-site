const express = require("express");
const cors = require("cors");
const db = require("./database"); // seu banco SQLite
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("Servidor iniciado...");

// --- Pasta exports ---
const dir = path.join(__dirname, "exports");

// Cria a pasta se não existir
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Caminho completo do Excel
const filePath = path.join(dir, "agendamentos.xlsx");

// --- Rota de cadastro ---
app.post("/agendar", (req, res) => {
    const { nome, nascimento, telefone, email, cidade, data_consulta } = req.body;
    const agora = new Date();
    const dataHoraBrasil = agora.toLocaleString("sv-SE").replace("T", " ");

    db.run(
        `INSERT INTO agendamentos 
        (nome, nascimento, telefone, email, cidade, data_consulta, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, nascimento, telefone, email, cidade, data_consulta, dataHoraBrasil],
        async function (err) {
            if (err) return res.status(500).json({ erro: err.message });

            // --- Atualiza Excel automaticamente ---
            const workbook = new ExcelJS.Workbook();

            try {
                await workbook.xlsx.readFile(filePath);
            } catch {
                const ws = workbook.addWorksheet("Agendamentos");
                ws.columns = [
                    { header: "ID", key: "id", width: 10 },
                    { header: "Nome", key: "nome", width: 25 },
                    { header: "Nascimento", key: "nascimento", width: 20 },
                    { header: "Telefone", key: "telefone", width: 20 },
                    { header: "Email", key: "email", width: 30 },
                    { header: "Cidade", key: "cidade", width: 20 },
                    { header: "Data Consulta", key: "data_consulta", width: 20 },
                    { header: "Criado em", key: "created_at", width: 25 }
                ];
            }

            const worksheet = workbook.getWorksheet("Agendamentos") || workbook.addWorksheet("Agendamentos");

            worksheet.addRow({
                id: this.lastID,
                nome,
                nascimento,
                telefone,
                email,
                cidade,
                data_consulta,
                created_at: dataHoraBrasil
            });

            await workbook.xlsx.writeFile(filePath);

            res.json({ sucesso: true });
        }
    );
});

// --- Listar agendamentos em JSON ---
app.get("/agendamentos", (req, res) => {
    db.all("SELECT * FROM agendamentos ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// --- Exportar Excel manual (opcional) ---
app.get("/exportar", async (req, res) => {
    res.download(filePath, "agendamentos.xlsx");
});

// --- Servidor ---
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});