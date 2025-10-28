
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { RemovalPolicy, Stack, StackProps, CfnOutput, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as cr from 'aws-cdk-lib/custom-resources';

export class CDKQuantStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1. Create an S3 bucket for static files
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
    });
    new CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });
    new CfnOutput(this, 'WebsiteURL', { value: siteBucket.bucketWebsiteUrl });

    // 2. Deploy static files to S3
    const deploy = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('html-website')],
      destinationBucket: siteBucket,
    });

    // 3. Create a simple API Gateway REST API
    const api = new apigateway.RestApi(this, 'DefaultApi', {
      restApiName: 'Default Service',
      description: 'This service serves as a default API Gateway endpoint.',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // 4. Add resources and methods
    const hello = api.root.addResource('hello');
    hello.addMethod('GET', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: { 'application/json': '{ "message": "Hello from API Gateway!" }' },
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: { 'application/json': '{ "statusCode": 200 }' },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        },
      }],
    });

    // Add CORS preflight OPTIONS method
    hello.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: { 'application/json': '"OK"' },
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: { 'application/json': '{"statusCode": 200}' },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        },
      }],
    });

    new CfnOutput(this, 'ApiUrl', { value: api.url ?? 'API URL not available' });

  // Write the API URL to a config.json file in the S3 bucket
  const writeConfig = new cr.AwsCustomResource(this, 'WriteSiteConfig', {
      onCreate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Bucket: siteBucket.bucketName,
          Key: 'config.json',
          Body: JSON.stringify({ apiUrl: api.url }),
          ContentType: 'application/json',
          CacheControl: 'no-cache, no-store, must-revalidate',
        },
        physicalResourceId: cr.PhysicalResourceId.of('site-config'),
      },
      onUpdate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Bucket: siteBucket.bucketName,
          Key: 'config.json',
          Body: JSON.stringify({ apiUrl: api.url }),
          ContentType: 'application/json',
          CacheControl: 'no-cache, no-store, must-revalidate',
        },
        physicalResourceId: cr.PhysicalResourceId.of('site-config'),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: [siteBucket.bucketArn + '/*'] }),
    });

    writeConfig.node.addDependency(deploy);

    // 5. Create a VPC for ECS
    // CloudFormation parameter for the container port. This allows passing
    // `--parameters <Stack>:Port=XXXX` to `cdk deploy` and have the value
    // appear in the generated template.
    const portParam = new CfnParameter(this, 'Port', {
      type: 'Number',
      default: 3000,
      description: 'Port on which the Node.js container listens',
    });

    // CloudFormation parameter for the ECS cluster name
    const clusterNameParam = new CfnParameter(this, 'ClusterName', {
      type: 'String',
      default: 'QuantServerCluster',
      description: 'Name of the ECS Cluster',
    });

    const vpc = new ec2.Vpc(this, 'ServerVpc', {
      maxAzs: 2,
    });

    // 6. ECS Cluster
    const cluster = new ecs.Cluster(this, 'ServerCluster', {
      vpc,
      clusterName: clusterNameParam.valueAsString,
    });

    // 7. Fargate Service + Load Balancer
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'NodeFargateService', {
      cluster,
      cpu: 256,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../server'),
        // Use the CloudFormation parameter value for container port. We
        // pass it both to the container port mapping and as an environment
        // variable so the app inside the container can read it at runtime.
        containerPort: portParam.valueAsNumber as unknown as number,
        environment: {
          PORT: portParam.valueAsString,
          CLUSTER_NAME: clusterNameParam.valueAsString,
        },
      },
      memoryLimitMiB: 512,
      publicLoadBalancer: true,
    });

    // Set ALB health check path to /api/hello
    fargateService.targetGroup.configureHealthCheck({
      path: '/api/hello',
      healthyHttpCodes: '200',
    });

    new CfnOutput(this, 'NodeServerUrl', {
      value: `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'URL of the Node.js server (Fargate behind ALB)',
    });

    // Export the port and cluster name used by the container so they're visible in stack outputs
    // and can be inspected after deployment.
    new CfnOutput(this, 'PortOutput', {
      value: portParam.valueAsString,
      description: 'Port the Node.js container listens on',
    });
    new CfnOutput(this, 'ClusterNameOutput', {
      value: clusterNameParam.valueAsString,
      description: 'Name of the ECS Cluster',
    });
  }
}
