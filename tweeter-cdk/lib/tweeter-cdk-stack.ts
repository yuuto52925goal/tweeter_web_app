import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

export class TweeterCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getUserLambda = new NodejsFunction(this, 'GetUserFunction', {
      entry: path.join(__dirname, '../resources/lambda/GetUserHandler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    // API Gateway
    const api = new RestApi(this, 'TweeterApi', {
      restApiName: 'Tweeter API',
    });

    const users = api.root.addResource('user');
    users.addMethod('GET', new LambdaIntegration(getUserLambda));
  }
}

