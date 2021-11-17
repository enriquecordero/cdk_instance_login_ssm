#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwesomeNetworkStack } from '../lib/awesome/stacks/network';
import { AwesomeAppStack } from '../lib/awesome/stacks/app';
import { AwesomeSecretManagerStack } from '../lib/awesome/stacks/secretManager';
const app = new cdk.App();

const org = 'awesome';
const enviroment = 'dev'

const props = {
  org:org,
  enviroment:enviroment,
  cidr:'10.1.0.0/16',
  maxAz:2,
  env:{
    account: '913008941063',
    region: 'us-east-1'
  },


}



const networkStack = new AwesomeNetworkStack(app,`${org}-${enviroment}-network`,props)
const appStack = new AwesomeAppStack(app,`${org}-${enviroment}-app`,{...props , vpc:networkStack.vpc})
//const secretManagerStack = new AwesomeSecretManagerStack(app,`${org}-${enviroment}-secretManager`,{...props , vpc:networkStack.vpc} )