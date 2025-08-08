const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// Middleware：讓 public 裡的檔案能被正確讀取（html / js / css）
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ✅ 將首頁 / 導向 tool.html（避免 Cannot GET /）
app.get('/', (req, res) => {
  res.redirect('/tool.html');
});

// Render 的健康檢查路由，避免被誤認為掛掉
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 處理 AI 分析的 POST 請求
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;

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
    
    console.log('🧪 FULL OpenAI response:', JSON.stringify(response.data, null, 2));

    const result = response.data.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error.message);
    res.status(500).json({ error: 'AI 無法回覆，請稍後再試。' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});



