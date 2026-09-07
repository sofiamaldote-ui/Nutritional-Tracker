const Database = require("@replit/database");
const db = new Database();
const fs = require("fs");

db.getAll().then(dados => {
    fs.writeFileSync("export.json", JSON.stringify(dados, null, 2));
    console.log("Exportação concluída com sucesso!");
});