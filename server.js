const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000; // 建議加 fallback

app.use(express.json());

// 提供 public 資料夾中的靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

// 根路由對應到 tool.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tool.html'));
});

// ✅ 新增健康檢查路由
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// AI 請求處理
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
    res.json(response.data);
  } catch (error) {
    console.error('Error from OpenAI API:', error.message);
    res.status(500).json({ error: 'API 請求失敗' });
  }
});

// ✅ 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
