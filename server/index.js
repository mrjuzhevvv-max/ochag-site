
require("dotenv").config();

const express = require("express");
const { Telegraf } = require("telegraf");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

// Проверяем настройки
if (!process.env.BOT_TOKEN) {
  throw new Error("Не указан BOT_TOKEN в .env");
}

if (!process.env.ADMIN_CHAT_ID) {
  throw new Error("Не указан ADMIN_CHAT_ID в .env");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда запуска бота
bot.start((ctx) => {
  return ctx.reply(
    "Добро пожаловать в бот мастерской «Очаг»!\n\n" +
    "Бот готов принимать уведомления о заказах."
  );
});

// Команда получения Telegram ID
bot.command("myid", (ctx) => {
  return ctx.reply(`Ваш Telegram ID: ${ctx.from.id}`);
});

// Раздача файлов сайта
app.use(express.static(path.join(__dirname, "..")));


// Приём заявок с сайта
app.post("/api/booking", async (req, res) => {
  try {
    const { name, phone, details, consent } = req.body;

    // Проверяем заполнение полей и согласие
    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof details !== "string" ||
      !name.trim() ||
      !phone.trim() ||
      !details.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Заполните все поля"
      });
    }

    if (consent !== true) {
      return res.status(400).json({
        success: false,
        message: "Необходимо согласие на обработку персональных данных"
      });
    }

    // Фиксируем время получения заявки на сервере
    const consentDate = new Date().toISOString();
    const consentVersion = "consent-v1";

    const message =
      "🔔 НОВАЯ ЗАЯВКА — ОЧАГ\n\n" +
      `👤 Имя: ${name.trim().slice(0, 100)}\n` +
      `📞 Телефон: ${phone.trim().slice(0, 50)}\n\n` +
      "🛠 Описание заказа:\n" +
      details.trim().slice(0, 3000) +
      "\n\n" +
      "📄 Согласие на обработку данных: получено\n" +
      `Версия документа: ${consentVersion}\n` +
      `Дата получения: ${consentDate}\n\n` +
      "📍 Мастерская «Очаг» | Оренбург";

    await bot.telegram.sendMessage(
      process.env.ADMIN_CHAT_ID,
      message
    );

    return res.json({
      success: true,
      message: "Заявка отправлена!"
    });

  } catch (error) {
    console.error("Ошибка отправки заявки:", error);

    return res.status(500).json({
      success: false,
      message: "Не удалось отправить заявку"
    });
  }
});


// СНАЧАЛА ЗАПУСКАЕМ САЙТ
const server = app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
});

// ЗАТЕМ ЗАПУСКАЕМ TELEGRAM
bot.launch()
  .then(() => {
    console.log("Telegram-бот успешно запущен!");
  })
  .catch((error) => {
    console.error("Ошибка запуска Telegram:", error);
  });

// Корректное завершение
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  server.close();
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  server.close();
});
