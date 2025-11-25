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
              '你是一個友善、具體、條理清楚的 AI 助理，擅長幫使用者解決問題、整理想法，' +
              '在時間管理與自律相關的問題時，要特別主動幫忙拆計畫、估時間和安排步驟。'
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


// ✅ 新增：社群貼文的 AI 評語 API
app.post('/api/ai-comment', async (req, res) => {
  try {
    const { content, habitTag } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content 必須是字串且不可為空' });
    }

    const prompt = `
你是一位溫柔但講實話的時間管理教練。
使用繁體中文，給 1～3 句內的短評，語氣像跟大學生聊天。

使用者今天的紀錄內容如下：
「${content}」

此篇貼文的習慣標籤（可能是空白）：
「${habitTag || '（無標籤）'}」

請你回覆一段：
- 不要重複貼文原文
- 不要太官方
- 可以肯定 + 一點具體建議
`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一位時間管理教練。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const text =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      '今天有留下紀錄就是一件很棒的事，之後可以慢慢調整節奏。';

    res.json({ text });
  } catch (error) {
    console.error('❌ Error calling OpenAI /api/ai-comment:', error.message);
    res.status(500).json({ error: 'AI 無法產生評語，請稍後再試。' });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});



