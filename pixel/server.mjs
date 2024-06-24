import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

const app = express();
const port = 3000;

const BOT_TOKEN = '7246776423:AAGEwo5wyIXNJtLly84cFCQKT4gyH6juhHg'; 
const CHAT_ID = '-4232232433';

// Middleware для обработки JSON и данных формы
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* app.use(fileUpload({
  limits: { fileSize: 20 * 1024 * 1024 }, // 5 MB
  abortOnLimit: true
})); */

// Настройка хранилища для файлов с помощью multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Функция для отправки сообщения в Telegram
async function sendMessageToTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text
    })
  });
  return response.json();
}

// Функция для отправки файлов в Telegram
async function sendFileToTelegram(filePath, fileName) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('document', fs.createReadStream(filePath), fileName);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

// Обработчик для приема данных
app.post('/submit', upload.array('files'), async (req, res) => {
  const { name, phone, email, message } = req.body;
  const files = req.files;
  const referralCode = req.headers.referalcode; // Correctly access the header

  // Подготовка сообщения для отправки в Telegram
  const telegramMessage = `
    Name: ${name}
    Phone: ${phone}
    Email: ${email}
    Message: ${message}
    Referral Code: ${referralCode}
  `;

  try {
    await sendMessageToTelegram(telegramMessage);
    console.log('Message sent to Telegram');

    // Отправка файлов в Telegram
    for (const file of files) {
      const filePath = file.path;
      const fileName = file.originalname;
      await sendFileToTelegram(filePath, fileName);
      console.log(`File ${fileName} sent to Telegram`);
    }

  } catch (error) {
    console.error('Error sending data to Telegram:', error);
  }

  console.log('Name:', name);
  console.log('Phone:', phone);
  console.log('Email:', email);
  console.log('Message:', message);
  console.log('Files:', files);
  console.log('Referral Code:', referralCode); // Log the referral code

  res.send('Data received successfully');
});


app.get('/info', (req, res) => {
  res.send('123');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
