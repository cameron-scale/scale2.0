const express = require('express');
const router = express.Router();

// POST /api/assistant/ask – simple stubbed chatbot
router.post('/ask', (req, res) => {
  const { question, context } = req.body;
  res.json({ answer: `Stub response: you asked "${question}".` });
});

module.exports = router;
