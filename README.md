# Quant Project

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) (v2)
- [Docker](https://www.docker.com/) (optional, for backend containerization)

## Installation

1. Clone the repository:
	```bash
	git clone <repo-url>
	cd quant
	```
2. Install dependencies for both the root and subprojects:
	```bash
	npm install
	cd cdk && npm install
	cd ../server && npm install
	cd ..
	```

## Deployment

1. Bootstrap your AWS environment for CDK (if not already done):
	```bash
	cdk bootstrap
	```
2. Deploy the infrastructure and application:
	```bash
	cd cdk
	cdk deploy
	```
3. After deployment, note the output URLs for the static website, API, and backend server.

## Destruction

To remove all AWS resources created by this project, run the following commands:

1. Navigate to the CDK project directory:
	```bash
	cd cdk
	```
2. Destroy the deployed stack:
	```bash
	cdk destroy
	```
3. Confirm the destruction when prompted. This will delete all infrastructure provisioned by the CDK stack.


## Requirements Checklist

- ✅ Simple web application
- ✅ Separate front end and back end
- ✅ At least one HTTP request from front end to back end
- ✅ Containerization (Docker) of the back end (optional, implemented)
- ✅ Cloud deployed
- ✅ Infrastructure as code
- ✅ Idempotent deployments

## File Structure

```
quant/
├── README.md
├── package.json
├── cdk/
│   ├── cdk.context.json
│   ├── cdk.json
│   ├── jest.config.js
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── bin/
│   │   └── cdk.ts
│   ├── html-website/
│   │   ├── index.html
│   │   └── error/
│   │       └── index.html
│   ├── lib/
│   │   └── cdk-stack.ts
│   └── test/
│       └── cdk.test.ts
├── server/
│   ├── Dockerfile
│   ├── index.js
│   ├── index.test.js
│   └── package.json
```


## Solution Overview

This project demonstrates a modern cloud-native architecture using AWS services and best practices for infrastructure as code, containerization, and automated testing.

### Technology Stack

- **AWS CDK (TypeScript):** Infrastructure as code for provisioning AWS resources
- **Amazon S3:** Static website hosting and asset storage
- **Amazon API Gateway:** REST API endpoint with CORS and mock integration
- **Amazon ECS (Fargate):** Containerized Node.js server managed by an Application Load Balancer
- **Amazon VPC:** Isolated networking for ECS workloads
- **Node.js (Express):** Lightweight API server (`/api/hello`)
- **Jest:** Unit testing for both infrastructure and application code


## Implementation Details

### Architecture Overview

#### Frontend
- **Static Website**: Hosted on Amazon S3, serving assets from the `html-website/` directory
- **Website Delivery**: S3 bucket is configured for static website hosting with public read access, custom index, and error documents
- **Deployment**: Static assets are deployed to S3 using `BucketDeployment` via AWS CDK

#### Backend
- **API Gateway**: Exposes a `/hello` resource with GET and OPTIONS methods, CORS support, and a mock integration for GET requests
- **Node.js Application Server**: Runs in a Docker container on Amazon ECS (Fargate), managed by an Application Load Balancer
- **Networking**: ECS services are deployed within a VPC (maxAzs=2) for isolation and scalability
- **Health Checks**: Load balancer performs health checks on `/api/hello` endpoint
- **CloudFormation Outputs**: Provide API URL, website URL, and Node.js server URL for easy access

### Application Server

- Express server in `server/index.js` exposes a `/api/hello` endpoint returning a JSON message
- Unit tests (`server/index.test.js`) validate endpoint responses using Supertest and Jest

### Testing

Comprehensive automated testing is implemented for both infrastructure and application code to ensure reliability and maintainability:

#### Infrastructure Tests (CDK)
- **Tooling:** [Jest](https://jestjs.io/) with AWS CDK assertions
- **Location:** `cdk/test/cdk.test.ts`
- **Coverage:**
	- Validates creation and configuration of all major AWS resources (S3, API Gateway, ECS, VPC, etc.)
	- Asserts CloudFormation outputs for API, website, and backend URLs
- **How to run:**
	```bash
	cd cdk
	npm test
	```

#### Application (Server) Tests
- **Tooling:** [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest)
- **Location:** `server/index.test.js`
- **Coverage:**
	- Verifies the `/api/hello` endpoint returns the expected JSON response and status code
	- Can be extended for additional endpoints and error handling
- **How to run:**
	```bash
	cd server
	npm test
	```

All tests are run locally as part of the development workflow and can be integrated into CI/CD pipelines for automated validation.

## Architectural Rationale

- **AWS** was selected for its robust cloud ecosystem and comprehensive tooling
- **AWS CDK** streamlines infrastructure as code, enabling repeatable and version-controlled deployments
- **Node.js/Express** is an industry-standard choice for lightweight, scalable API services

This architecture provides a scalable, maintainable, and testable foundation for cloud-native applications.
