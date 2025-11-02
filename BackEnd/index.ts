import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();
const port = process.env.PORT || 3000;

// Allow cross-origin requests for local testing. In production, restrict origins as needed.
app.use(cors());

// Using mounted router for Hello API
import helloRouter from './APIs/Hello/HelloAPI';
app.use('/api/hello', helloRouter);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
