const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // 支援 JSON POST

// Serve tool.html 當作首頁
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tool.html'));
});

// Health check（給 Render 平台確認應用是否活著）
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 處理從前端來的 POST 請求
app.post('/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;

    // 呼叫 OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    res.status(500).json({ error: 'AI 無法回覆，請稍後再試。' });
  }
});

// 啟動 server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
