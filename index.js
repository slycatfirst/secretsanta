import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const DATA_FILE = "./data.json";

// Загружаем данные
function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Сохраняем данные
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Получить количество оставшихся участников
app.get("/remaining", (req, res) => {
  const data = loadData();
  res.json({ count: data.available.length });
});

// Выбрать случайного участника
app.post("/pick", (req, res) => {
  const data = loadData();

  if (data.available.length === 0) {
    return res.json({ error: "Участники закончились" });
  }

  // Случайный выбор
  const index = Math.floor(Math.random() * data.available.length);
  const chosen = data.available[index];

  // Удаляем из списка доступных
  data.available.splice(index, 1);

  // Сохраняем в файл
  saveData(data);

  res.json({ picked: chosen, remaining: data.available.length });
});

// Сброс (опционально — удалить когда закончите тестирование)
app.post("/reset", (req, res) => {
  const data = loadData();
  data.available = [...data.participants];
  saveData(data);
  res.json({ success: true, available: data.available.length });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
