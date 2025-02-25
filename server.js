const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const crypto = require("crypto");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Функция проверки подписи Telegram
function checkTelegramAuth(data) {
    const secret = process.env.TELEGRAM_BOT_TOKEN;
    if (!secret) {
        console.error("Ошибка: TELEGRAM_BOT_TOKEN не задан в .env");
        return false;
    }

    const hash = data.hash;
    delete data.hash;

    const checkString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(secret).digest();

    const computedHash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
    return computedHash === hash;
}

// Маршрут авторизации через Telegram
app.get("/auth", (req, res) => {
    const userData = req.query;

    if (!checkTelegramAuth(userData)) {
        return res.status(403).send("Ошибка авторизации!");
    }

    res.send(`Привет, ${userData.first_name}! Добро пожаловать.`);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
