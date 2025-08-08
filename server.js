const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// 讓 Express 能解析 JSON 請求
app.use(express.json());

// 提供 public 資料夾中的靜態檔案（例如 tool.html、js、css）
app.use(express.static(path.join(__dirname, 'public')));

// 根路徑導向 tool.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tool.html'));
});

// 處理前端送來的 AI 請求
app.post('/chat', async (req, res) => {
  const prompt = req.body.prompt;
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('❌ AI 回應錯誤:', error.message);
    res.status(500).json({ error: 'AI 無法回應，請稍後再試' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

