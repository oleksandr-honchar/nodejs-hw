import express from "express";
import cors from "cors";
import pino from "pino-http";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  pino({
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat:
          "{req.method} {req.url} {res.statusCode} - {responseTime}ms",
        hideObject: true,
      },
    },
  }),
);

// Кореневий маршрут
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

// Всі нотатки
app.get("/notes", (req, res) => {
  res.status(200).json({ message: "Retrieved all notes" });
});

// Одна нотатка за ID
app.get("/notes/:noteId", (req, res) => {
  res
    .status(200)
    .json({ message: `Retrieved note with ID: ${req.params.noteId}` });
});

// Маршрут для тестування middleware помилки
app.get("/test-error", () => {
  throw new Error("Simulated server error"); // штучна помилка
});

// Middleware 404 (після всіх маршрутів)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Middleware для обробки помилок (останнє)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: "Simulated server error",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
