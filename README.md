# Quant Project

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.14.0 or newer required)
- [npm](https://www.npmjs.com/) (v9 or newer recommended, comes with Node.js)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) (v2)
- [Docker](https://www.docker.com/)

## Getting Started

> **Note:** This project requires Node.js v18.14.0 or newer and npm v9 or newer. Using older versions may result in dependency errors, especially with Jest and AWS CDK.


1. **Install AWS CLI:**

	**Either**

	Follow the official guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
	
	**Or**

	On Linux (x86_64) development machine run:
	  ```bash
	  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
	  unzip awscliv2.zip
	  sudo ./aws/install
	  ```

	Execute command to verify the installation.
	  ```
	  aws --version
	  ```
	>This should return AWS CLI version number

	Configure your credentials:
	  ```bash
	  aws configure
	  ```

	Access rights
	<details>

	> Development was done with full access rights; the following minimum access policy should be sufficient for a CI/deploy principal running `cdk deploy`.

	```json
	{
	  "Version": "2012-10-17",
	  "Statement": [
	    {
	      "Sid": "CloudFormationFullAccessToSpecificStack",
	      "Effect": "Allow",
	      "Action": [
	        "cloudformation:CreateStack",
	        "cloudformation:UpdateStack",
	        "cloudformation:DeleteStack",
	        "cloudformation:DescribeStacks",
	        "cloudformation:DescribeStackEvents",
	        "cloudformation:GetTemplate",
	        "cloudformation:ValidateTemplate",
	        "cloudformation:ListStackResources",
	        "cloudformation:DescribeStackResource"
	      ],
	      "Resource": "arn:aws:cloudformation:<REGION>:<ACCOUNT>:stack/<STACK_NAME>/*"
	    },
	    {
	      "Sid": "S3PutGetForAssets",
	      "Effect": "Allow",
	      "Action": [
	        "s3:PutObject",
	        "s3:PutObjectAcl",
	        "s3:GetObject",
	        "s3:ListBucket"
	      ],
	      "Resource": [
	        "arn:aws:s3:::<BOOTSTRAP_BUCKET>/*",
	        "arn:aws:s3:::<BUCKET_NAME>/*"
	      ]
	    },
	    {
	      "Sid": "ECRForAssets",
	      "Effect": "Allow",
	      "Action": [
	        "ecr:GetAuthorizationToken",
	        "ecr:BatchCheckLayerAvailability",
	        "ecr:GetDownloadUrlForLayer",
	        "ecr:BatchGetImage",
	        "ecr:PutImage",
	        "ecr:InitiateLayerUpload",
	        "ecr:UploadLayerPart",
	        "ecr:CompleteLayerUpload",
	        "ecr:CreateRepository"
	      ],
	      "Resource": "*"
	    },
	    {
	      "Sid": "IAMForCloudFormation",
	      "Effect": "Allow",
	      "Action": [
	        "iam:CreateRole",
	        "iam:DeleteRole",
	        "iam:AttachRolePolicy",
	        "iam:PutRolePolicy",
	        "iam:PassRole",
	        "iam:CreatePolicy",
	        "iam:DeletePolicyVersion",
	        "iam:GetRole",
	        "iam:GetPolicy"
	      ],
	      "Resource": "*"
	    },
	    {
	      "Sid": "EC2andECSNetworking",
	      "Effect": "Allow",
	      "Action": [
	        "ec2:CreateSecurityGroup",
	        "ec2:DeleteSecurityGroup",
	        "ec2:AuthorizeSecurityGroupIngress",
	        "ec2:RevokeSecurityGroupIngress",
	        "ec2:CreateVpc",
	        "ec2:DeleteVpc",
	        "ec2:Describe*",
	        "ecs:*",
	        "elasticloadbalancing:*",
	        "autoscaling:*",
	        "apigateway:*",
	        "acm:RequestCertificate",
	        "acm:DescribeCertificate"
	      ],
	      "Resource": "*"
	    },
	    {
	      "Sid": "LogsForDeployment",
	      "Effect": "Allow",
	      "Action": [
	        "logs:CreateLogGroup",
	        "logs:CreateLogStream",
	        "logs:PutLogEvents",
	        "logs:DescribeLogStreams"
	      ],
	      "Resource": "*"
	    }
	  ]
	}
	```

	</details>

2. **Install AWS CDK (v2):**
	Install globally using npm:
	  ```bash
	  npm install -g aws-cdk@2
	  ```
	Execute command to verify the installation.
	  ```
	  cdk --version
	  ```

3. **Clone the repository:**
	```bash
	git clone <repo-url>
	cd quant
	```

4. **Install dependencies for both the root and subprojects:**
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

	You can specify User, region and name with following:
	```
	cdk bootstrap aws://[User]/[Region] --toolkit-stack-name [StackName]
	```

	> Remember to open your Docker engine and have "docker" in path.

2. Deploy the infrastructure and application:
	```bash
	cd cdk
	cdk deploy
	```
	>CDK Deploy supports three custom parameters "StackName", "ClusterName" and "Port", with this you can easily reproduce solution.

	```
	Example:
	cdk deploy -c stackName=CDKTestStack --parameters CDKTestStack:Port=3000 --parameters CDKTestStack:ClusterName=TestCluster
	```

3. After deployment, note the output URLs for the static website, API, and backend server.

## Usage

Website locations are shown in cdk deploy outputs

```
Outputs:
[StackName].ApiUrl = https://[URL]
[StackName].Bucket = [BucketName]
[StackName].DefaultApiEndpointB0E75779 = https://[URL]
[StackName].NodeFargateServiceLoadBalancerDNS3BD08BD7 = [LoadBalancer]
[StackName].NodeFargateServiceServiceURLE6F1CAA2 = http://[URL]
[StackName].NodeServerUrl = http://[URL]
[StackName].WebsiteURL = http://[URL]
```

To view the frontend, open the `WebsiteURL` output in your browser. To call the API, use the `ApiUrl` output or the load balancer / server URLs as appropriate.

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

## Environment variables

This project uses (or may require) the following environment variables for deployment or local development:

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — AWS credentials (can be set via `aws configure` or environment variables)
- `AWS_DEFAULT_REGION` — AWS region for resource deployment (e.g., `eu-north-1`)

Make sure these are set in your shell or CI/CD environment as needed.

## File Structure

```
quant/
├── README.md
├── package.json
├── BackEnd/
│   ├── Dockerfile
│   ├── index.js
│   ├── index.test.js
│   ├── package.json
│   └── APIs/
│       └── Hello/
│           └── HelloAPI.js
├── cdk/
│   ├── cdk.context.json
│   ├── cdk.json
│   ├── jest.config.js
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── bin/
│   │   └── cdk.ts
│   ├── lib/
│   │   └── cdk-stack.ts
│   └── test/
│       └── cdk.test.ts
└── FrontEnd/
	└── html-website/
		├── index.html
		└── error.html
```

> The project's front-end and back-end structures are intentionally modular to promote maintainable development and scalable deployment.

## Solution overview

This project demonstrates a modern cloud-native architecture using AWS services and best practices for infrastructure as code, containerization, and automated testing.

The project implements the requested features:

- ✅ Simple web application
- ✅ Separate front end and back end
- ✅ At least one HTTP request from front end to back end
- ✅ Containerization (Docker) of the back end
- ✅ Cloud deployed
- ✅ Infrastructure as code
- ✅ Idempotent deployments

## Technology stack

- **AWS CDK (TypeScript):** Infrastructure as code for provisioning AWS resources
- **Amazon S3:** Static website hosting and asset storage
- **Amazon API Gateway:** REST API endpoint with CORS and mock integration
- **Amazon ECS (Fargate):** Containerized Node.js server managed by an Application Load Balancer
- **Amazon VPC:** Isolated networking for ECS workloads
- **Node.js (Express):** Lightweight API server (`/api/hello`)
- **Jest:** Unit testing for both infrastructure and application code


## Architecture Overview

### Frontend
- **Static Website**: Hosted on Amazon S3, serving assets from the `html-website/` directory
- **Website Delivery**: S3 bucket is configured for static website hosting with public read access, custom index, and error documents
- **Deployment**: Static assets are deployed to S3 using `BucketDeployment` via AWS CDK

### Backend
- **API Gateway**: Exposes a `/hello` resource with GET and OPTIONS methods, CORS support, and a mock integration for GET requests
- **Node.js Application Server**: Runs in a Docker container on Amazon ECS (Fargate), managed by an Application Load Balancer
- **Networking**: ECS services are deployed within a VPC (maxAzs=2) for isolation and scalability
- **Health Checks**: Load balancer performs health checks on `/api/hello` endpoint
- **CloudFormation Outputs**: Provide API URL, website URL, and Node.js server URL for easy access

### Implementation Details

- Express server in `server/index.js` exposes a `/api/hello` endpoint returning a JSON message
- Unit tests (`server/index.test.js`) validate endpoint responses using Supertest and Jest

## Testing

Comprehensive automated testing is implemented for both infrastructure and application code to ensure reliability and maintainability.

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

This architecture provides a scalable, maintainable, and testable foundation for cloud-native applications.

## Technology Stack Analysis

### Architectural Rationale

- **AWS** was selected for its robust cloud ecosystem and comprehensive tooling
- **AWS CDK** streamlines infrastructure as code, enabling repeatable and version-controlled deployments
- **Node.js/Express** is an industry-standard choice for lightweight, scalable API services

This project leverages a modern cloud-native stack. Below is an analysis of the main technologies used, including their advantages and potential drawbacks.

### AWS CDK (TypeScript)
**Upsides**
- Strongly-typed, code-driven infrastructure as code (IaC)
- Enables version control and repeatable deployments
- Integrates seamlessly with AWS services
- Supports testing and validation of infrastructure

**Downsides**
- Steeper learning curve compared to declarative IaC (e.g., CloudFormation YAML)
- Tightly coupled to AWS ecosystem
- Occasional breaking changes between CDK versions

### Amazon S3 (Static Website Hosting)
**Upsides**
- Highly available and cost-effective static hosting
- Simple deployment and scaling
- Integrates with CloudFront for CDN

**Downsides**
- Limited to static content (no server-side logic)
- Public access configuration can be error-prone

### Amazon API Gateway
**Upsides**
- Fully managed, scalable API endpoint
- Built-in support for CORS, throttling, and security
- Easy integration with AWS Lambda or mock integrations

**Downsides**
- Can be complex to configure for advanced use cases
- Pricing can increase with high request volumes

### Amazon ECS (Fargate)
**Upsides**
- Serverless container orchestration (no server management)
- Integrates with VPC, Load Balancer, and IAM
- Scales automatically with demand

**Downsides**
- Cold start latency for infrequently used services
- Debugging and troubleshooting can be more complex than traditional servers

### Node.js (Express)
**Upsides**
- Lightweight, fast, and widely adopted for APIs
- Large ecosystem of middleware and libraries
- Easy to containerize and deploy

**Downsides**
- Single-threaded by default (may require clustering for CPU-bound tasks)
- Callback-based async can be error-prone if not managed well

### Jest & Supertest
**Upsides**
- Comprehensive testing for both infrastructure and application
- Fast, easy-to-use, and widely supported
- Enables TDD and CI/CD integration

**Downsides**
- May require additional setup for integration or end-to-end tests
- Mocking AWS resources can be complex

### Docker
**Upsides**
- Consistent environment across development, testing, and production
- Simplifies deployment and scaling
- Supported by most cloud providers

**Downsides**
- Adds complexity to local development if not familiar with containers
- Requires understanding of container security and best practices

Overall, this stack provides a robust, scalable, and maintainable foundation for cloud-native applications, with trade-offs primarily around complexity and AWS lock-in.


## Known Issues or Limitations

- The project is tightly coupled to AWS services and may not be easily portable to other cloud providers.
- Node.js version compatibility is required (v18.14.0 or newer).
- Advanced API Gateway or ECS configurations may require further customization.
- Use of Fargate and possible coldboots may affect user experience in form of longer waiting times.

## Use of AI-tools
During the completion of this assignment, I utilized GitHub Copilot as an assistive tool for coding, information retrieval, and README formatting. All solutions and decisions presented are my own and remain my sole responsibility.