const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Allow cross-origin requests for local testing. In production, restrict origins as needed.
app.use(cors());

// Using mounted router for Hello API
const helloRouter = require('./APIs/Hello/HelloAPI');
app.use('/api/hello', helloRouter);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;