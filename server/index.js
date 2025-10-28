const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Allow cross-origin requests for local testing. In production, restrict origins as needed.
app.use(cors());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node server!' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;