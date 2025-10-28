#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CDKQuantStack } from '../lib/cdk-stack';
const app = new cdk.App();
new CDKQuantStack(app, 'CDKQuantStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-north-1' },
});