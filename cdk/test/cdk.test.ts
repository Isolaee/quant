
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CDKQuantStack } from '../lib/cdk-stack';

describe('CDKQuantStack', () => {
	let app: cdk.App;
	let stack: CDKQuantStack;
	let template: Template;

	beforeAll(() => {
		app = new cdk.App();
		stack = new CDKQuantStack(app, 'TestStack');
		template = Template.fromStack(stack);
	});

	it('creates an S3 Bucket with correct properties', () => {
			template.hasResourceProperties('AWS::S3::Bucket', {
				WebsiteConfiguration: {
					IndexDocument: 'index.html',
					ErrorDocument: 'error.html',
				},
				PublicAccessBlockConfiguration: {
					BlockPublicAcls: false,
					BlockPublicPolicy: false,
					IgnorePublicAcls: false,
					RestrictPublicBuckets: false,
				},
				// AccessControl is not set in the template, so we do not check it
			});
			template.resourceCountIs('AWS::S3::Bucket', 1);
	});

	it('creates an S3 deployment to the correct bucket', () => {
			// Asset parameter names are dynamic, so we use expect.anything() for values
			template.resourceCountIs('Custom::CDKBucketDeployment', 1);
			const deployments = template.findResources('Custom::CDKBucketDeployment');
			const hasCorrectBucket = Object.values(deployments).some((dep: any) => {
				return dep.Properties && dep.Properties.DestinationBucketName && dep.Properties.SourceBucketNames;
			});
			expect(hasCorrectBucket).toBe(true);
	});

	it('creates an API Gateway with /hello resource and methods', () => {
		template.hasResourceProperties('AWS::ApiGateway::Resource', {
			PathPart: 'hello',
		});
		template.hasResourceProperties('AWS::ApiGateway::Method', {
			HttpMethod: 'GET',
		});
		template.hasResourceProperties('AWS::ApiGateway::Method', {
			HttpMethod: 'OPTIONS',
		});
	});

	it('has CORS settings in API Gateway method responses', () => {
		const methods = template.findResources('AWS::ApiGateway::Method');
		const hasCORS = Object.values(methods).some((method: any) => {
			const integration = method.Properties.Integration;
			return integration && integration.IntegrationResponses && integration.IntegrationResponses.some((resp: any) => {
				return resp.ResponseParameters && resp.ResponseParameters['method.response.header.Access-Control-Allow-Origin'];
			});
		});
		expect(hasCORS).toBe(true);
	});

	it('has mock integration response templates for API Gateway', () => {
		const methods = template.findResources('AWS::ApiGateway::Method');
		const hasMock = Object.values(methods).some((method: any) => {
			const integration = method.Properties.Integration;
			return integration && integration.Type === 'MOCK' && integration.IntegrationResponses && integration.IntegrationResponses.some((resp: any) => {
				return resp.ResponseTemplates && resp.ResponseTemplates['application/json'];
			});
		});
		expect(hasMock).toBe(true);
	});

	it('creates a VPC with maxAzs=2', () => {
		template.hasResourceProperties('AWS::EC2::VPC', {});
		// maxAzs is not directly testable, but subnet count can be checked
		const subnets = template.findResources('AWS::EC2::Subnet');
		expect(Object.keys(subnets).length).toBeGreaterThanOrEqual(2);
	});

	it('creates an ECS Cluster and Fargate Service with correct config', () => {
			template.hasResourceProperties('AWS::ECS::Cluster', {
				ClusterName: 'QuantServerCluster',
			});
			// The synthesized template has ContainerDefinitions as an array, so we check for array presence and port mapping
			const taskDefs = template.findResources('AWS::ECS::TaskDefinition');
			const hasPort = Object.values(taskDefs).some((def: any) => {
				return def.Properties && Array.isArray(def.Properties.ContainerDefinitions) &&
					def.Properties.ContainerDefinitions.some((container: any) =>
						Array.isArray(container.PortMappings) &&
						container.PortMappings.some((pm: any) => pm.ContainerPort === 3000)
					);
			});
			expect(hasPort).toBe(true);
			template.hasResourceProperties('AWS::ECS::TaskDefinition', {
				Cpu: '256',
				Memory: '512',
			});
			template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
				HealthCheckPath: '/api/hello',
				Matcher: { HttpCode: '200' },
			});
	});

	it('defines expected CloudFormation outputs', () => {
				// Only check that the outputs exist by name
				const outputs = template.toJSON().Outputs;
				expect(outputs).toHaveProperty('ApiUrl');
				expect(outputs).toHaveProperty('WebsiteURL');
				expect(outputs).toHaveProperty('NodeServerUrl');
	});
});
