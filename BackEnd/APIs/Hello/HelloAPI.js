// This module publishes a simple Hello API endpoint
// Endpoints are developed and published as individual modules for modularity

const express = require('express');
const router = express.Router();

// This endpoint responds to GET requests with a message
router.get('/', (req, res) => {
  res.json({ message: 'Hello from Node server!' });
});

module.exports = router;