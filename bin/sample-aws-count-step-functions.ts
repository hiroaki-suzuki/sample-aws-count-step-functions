#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SampleAwsCountStepFunctionsStack } from "../lib/sample-aws-count-step-functions-stack";

const app = new cdk.App();

const projectName = app.node.tryGetContext("projectName");
const namePrefix = projectName;

const stack = new SampleAwsCountStepFunctionsStack(app, namePrefix, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "ap-northeast-1"
  },
  namePrefix
});

