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

// ✅ 時間管理專用 AI 聊天室
app.post('/api/time-coach', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages 必須是陣列' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // 之後你要改成別的 model 再換
        messages: [
          {
            role: 'system',
            content:
              '你是一個專門幫大學生做時間管理與排程的教練。' +
              '只回答「時間管理、排程、讀書計畫、自律、番茄鐘、作息調整」相關問題。' +
              '如果使用者問到感情、八卦、或跟時間無關的內容，要禮貌拒答，並引導回時間安排。' +
              '回答時要具體、可執行，會拆步驟、估時間、安排優先順序。'
          },
          ...messages, // 前端傳來的對話歷史
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content || '（AI 沒有回應內容）';
    res.json({ reply });
  } catch (error) {
    console.error('❌ Error calling OpenAI /api/time-coach:', error.message);
    res.status(500).json({ error: 'AI 無法回覆，請稍後再試。' });
  }
});


// 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});



