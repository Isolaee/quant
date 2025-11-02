// This module publishes a simple Hello API endpoint
// Endpoints are developed and published as individual modules for modularity

import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// This endpoint responds to GET requests with a message
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Node server!' });
});

export default router;
