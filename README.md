# Quant Project

## Stack Overview

- **AWS CDK (TypeScript):** Infrastructure as code for AWS resources
- **Amazon S3:** Static website hosting and asset storage
- **Amazon API Gateway:** REST API endpoint with CORS and mock integration
- **Amazon ECS (Fargate):** Containerized Node.js server with Application Load Balancer
- **Amazon VPC:** Isolated networking for ECS
- **Node.js (Express):** Simple API server (`/api/hello`)
- **Jest:** Unit testing for both infrastructure and server

## Implementation Description

### Infrastructure (CDK)
- S3 bucket is configured for static website hosting with public read access and custom index/error documents.
- Static assets from `html-website/` are deployed to the S3 bucket using `BucketDeployment`.
- API Gateway exposes a `/hello` resource with GET and OPTIONS methods, CORS headers, and mock integration for GET.
- VPC is created with `maxAzs=2` for ECS networking.
- ECS Cluster and Fargate Service run a Node.js server container, exposed via an Application Load Balancer with health checks on `/api/hello`.
- CloudFormation outputs provide the API URL, website URL, and Node server URL.

### Server
- Simple Express server in `server/index.js` with `/api/hello` endpoint returning a JSON message.
- Unit test (`server/index.test.js`) verifies the endpoint response.

### Testing
- CDK stack is covered by Jest unit tests in `cdk/test/cdk.test.ts` for all major resources and outputs.
- Server endpoint is tested with Supertest and Jest.

## Reasoning and Thoughts

<!-- TODO: Add reasoning and architectural decisions here. -->
