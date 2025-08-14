const express = require('express');
const router = express.Router();

// Simple connection flag for Asana integration
let connected = false;

// GET /api/asana/status – returns whether the Asana integration is connected
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/asana/connect – pretend to connect via OAuth
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/asana/disconnect – disconnect Asana
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/asana/projects – return a list of projects
router.get('/projects', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Asana not connected' });
  }
  res.json({ projects: [
    { id: '123', name: 'Website Redesign' },
    { id: '456', name: 'Product Launch' }
  ] });
});

// GET /api/asana/tasks – return tasks. Accepts optional query param `projectId`.
router.get('/tasks', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Asana not connected' });
  }
  const { projectId } = req.query;
  const tasks = [
    { id: 't1', name: 'Design homepage', completed: false },
    { id: 't2', name: 'Write blog post', completed: true }
  ];
  res.json({ projectId: projectId || '123', tasks });
});

module.exports = router;