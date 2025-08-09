const express = require('express');
const router = express.Router();

// Simulated connection state. In production, store tokens securely.
let connected = false;

// GET /api/acrobat/status - returns whether the user is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/acrobat/connect - simulate OAuth connection.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/acrobat/disconnect - simulate disconnecting the account.
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/acrobat/documents - returns a list of documents.
router.get('/documents', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Acrobat not connected' });
  const documents = [
    { id: 'doc1', name: 'Contract.pdf', status: 'signed' },
    { id: 'doc2', name: 'Invoice.pdf', status: 'unsigned' },
  ];
  res.json(documents);
});

// POST /api/acrobat/create - create a new document.
router.post('/create', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Acrobat not connected' });
  const document = req.body;
  res.json({ message: 'Document created', document });
});

module.exports = router;
