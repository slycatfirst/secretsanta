import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const DATA_FILE = "./data.json";

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Получить список участников
app.get("/participants", (req, res) => {
  const data = loadData();
  res.json({ participants: data.participants });
});

// Выбрать случайного, исключив себя
app.post("/pick", (req, res) => {
  const { user } = req.body;

  if (!user) return res.json({ error: "Не указано имя пользователя" });

  const data = loadData();

  // Фильтруем доступных так, чтобы исключить самого пользователя
  const filtered = data.available.filter(name => name !== user);

  if (filtered.length === 0) {
    return res.json({ error: "Нет доступных участников (кроме тебя)" });
  }

  const index = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[index];

  // Удаляем выбранного из доступных
  const globalIndex = data.available.indexOf(chosen);
  if (globalIndex !== -1) {
    data.available.splice(globalIndex, 1);
  }

  saveData(data);

  res.json({ picked: chosen });
});

// Сброс
app.post("/reset", (req, res) => {
  const data = loadData();
  data.available = [...data.participants];
  saveData(data);
  res.json({ success: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
