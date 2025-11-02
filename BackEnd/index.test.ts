import request from 'supertest';
import express, { Application } from 'express';
import app from './index';
import { Server } from 'http';

describe('Node server', () => {
  let server: Server;
  
  beforeAll((done) => {
    server = app.listen(3000, done);
  });
  
  afterAll((done) => {
    server.close(done);
  });

  it('GET /api/hello returns hello message', async () => {
    const res = await request(server).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Hello from Node server!');
  });
});
