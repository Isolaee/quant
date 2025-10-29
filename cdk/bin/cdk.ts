#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CDKQuantStack } from '../lib/cdk-stack';

const app = new cdk.App();

// Allow the stack name/ID to be provided via CDK context (-c stackName=MyStack),
// or the STACK_NAME environment variable. Defaults to 'CDKQuantStack'.
const stackId = app.node.tryGetContext('stackName') || process.env.STACK_NAME || 'CDKQuantStack';

new CDKQuantStack(app, stackId, {
  // Also set the physical CloudFormation stack name so `cdk deploy` can target it
  // consistently when provided via context/env.
  stackName: stackId,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});