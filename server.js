const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // 支援 JSON POST

// Serve tool.html 當作首頁
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tool.html'));
});

// Health check（Render 用來確認網站有活著）
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// AI 回應路由
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: '未設定 OpenAI API 金鑰' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API 錯誤：', error.message);
    res.status(500).json({ error: 'AI 無法回應，請稍後再試' });
  }
});

// 啟動 server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
