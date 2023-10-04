#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { AcmForCloudfrontStack } from "../lib/acm-for-cloudfront-stack"
import { CloudfrontStack } from "../lib/cloudfront-stack"

const account = "<<YOUR_AWS_ACCOUNT_NO>>"
const domainName = "<<YOUR_PUBLIC_DOMAIN_NAME>>"
const hostName = "cf-cross"

const envJP: cdk.Environment = {
  account,
  region: "ap-northeast-1",
}

const envUS: cdk.Environment = {
  account,
  region: "us-east-1",
}

const app = new cdk.App()

const acmForCloudfront = new AcmForCloudfrontStack(
  app,
  "AcmForCloudfrontStack",
  {
    env: envUS,
    crossRegionReferences: true,
    domainName,
    hostName,
  },
)

const cloudfront = new CloudfrontStack(app, "CloudFrontStack", {
  env: envJP,
  crossRegionReferences: true,
  domainName,
  hostName,
  certificate: acmForCloudfront.certificate,
})
