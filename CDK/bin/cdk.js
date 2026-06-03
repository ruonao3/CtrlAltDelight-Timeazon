#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack.js";

//const stackName = 'CtrlAltDelight'

const stackName = process.env.GROUP_PROJECT_STACK_NAME;
const environmentName = process.env.APP_ENV || "dev";

if (!stackName || !stackName.trim()) {
  console.error("Environment variable GROUP_PROJECT_STACK_NAME is not set");
  process.exit(1);
}

const settings = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || "NOT_SET",
    region: process.env.CDK_DEFAULT_REGION || "NOT_SET",
  },
  stackName: stackName,
  certArn: cdk.Fn.importValue("CTASharedCertArn"), // SSL cert for HTTPS
  permissionsBoundaryPolicyName: "scopePermissions",
  domainName: "cta-training.academy", // Root domain
  subDomain: stackName.toLowerCase(),
  // For the context of training it has been hardcoded but for a real production system it wouldn't
  // be exposed and would be managed by AWS Secrets Manager
  authToken: "CtrlAltDelightAPIToken",
  dbName: environmentName,
  vpcName: "CTASharedVPC-vpc",
  devWebAclArn:
    environmentName == "dev"
      ? "arn:aws:wafv2:us-east-1:827602716979:global/webacl/CtrlAltDelight-dev-waf/961fc0b7-1dae-42f3-a00d-8097b965a4c1"
      : undefined,
};

const app = new cdk.App();
if (environmentName === "dev") {
  const DevStack = new CdkStack(app, "CdkStackDev", {
    env: settings.env,
    permissionsBoundaryPolicyName: settings.permissionsBoundaryPolicyName,
    subDomain: `${settings.subDomain}-dev`,
    stackName: `${stackName}-dev`,
    certArn: settings.certArn,
    domainName: settings.domainName,
    dbName: settings.dbName,
    vpcName: settings.vpcName,
    authToken: settings.authToken,
    environmentName: "dev",
    devWebAclArn: settings.devWebAclArn,
  });
}

if (environmentName === "prod") {
  const ProdStack = new CdkStack(app, "CdkStackProd", {
    env: settings.env,
    permissionsBoundaryPolicyName: settings.permissionsBoundaryPolicyName,
    subDomain: `${settings.subDomain}-prod`,
    stackName: `${stackName}-prod`,
    certArn: settings.certArn,
    domainName: settings.domainName,
    dbName: settings.dbName,
    vpcName: settings.vpcName,
    authToken: settings.authToken,
    environmentName: "prod",
    devWebAclArn: undefined,
  });
}
// new CdkStack(app, 'CdkStack', {
//   env: settings.env,
//   permissionsBoundaryPolicyName: settings.permissionsBoundaryPolicyName,
//   subDomain: settings.subDomain,
//   stackName: settings.stackName,
//   certArn: settings.certArn,
//   domainName: settings.domainName,
//   dbName: settings.dbName,
//   vpcName: settings.vpcName,
//   environmentName: environmentName
// });
