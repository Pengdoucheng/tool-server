const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

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

    const result = response.data.choices[0].message.content;
    res.json({ reply: result });
  } catch (error) {
    console.error('OpenAI API 錯誤:', error.message);
    res.status(500).json({ error: 'AI 無法回覆，請稍後再試。' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});


