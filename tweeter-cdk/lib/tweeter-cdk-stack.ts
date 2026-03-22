import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';

export class TweeterCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handlerDir = path.join(__dirname, '../resources/lambdaHandler');
    const commonProps = {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
    };

    // --- User Lambdas ---
    const loginLambda = new NodejsFunction(this, 'LoginFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'LoginHandler.ts'),
    });
    const registerLambda = new NodejsFunction(this, 'RegisterFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'RegisterHandler.ts'),
    });
    const logoutLambda = new NodejsFunction(this, 'LogoutFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'LogoutHandler.ts'),
    });
    const getUserLambda = new NodejsFunction(this, 'GetUserFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetUserHandler.ts'),
    });

    // --- Follow Lambdas ---
    const getFollowersLambda = new NodejsFunction(this, 'GetFollowersFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetFollowersHandler.ts'),
    });
    const getFolloweesLambda = new NodejsFunction(this, 'GetFolloweesFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetFolloweesHandler.ts'),
    });
    const isFollowerStatusLambda = new NodejsFunction(this, 'IsFollowerStatusFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'IsFollowerStatusHandler.ts'),
    });
    const getFollowerCountLambda = new NodejsFunction(this, 'GetFollowerCountFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetFollowerCountHandler.ts'),
    });
    const getFolloweeCountLambda = new NodejsFunction(this, 'GetFolloweeCountFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetFolloweeCountHandler.ts'),
    });
    const followLambda = new NodejsFunction(this, 'FollowFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'FollowHandler.ts'),
    });
    const unfollowLambda = new NodejsFunction(this, 'UnfollowFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'UnfollowHandler.ts'),
    });

    // --- Status Lambdas ---
    const getFeedLambda = new NodejsFunction(this, 'GetFeedFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetFeedHandler.ts'),
    });
    const getStoryLambda = new NodejsFunction(this, 'GetStoryFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'GetStoryHandler.ts'),
    });
    const postStatusLambda = new NodejsFunction(this, 'PostStatusFunction', {
      ...commonProps,
      entry: path.join(handlerDir, 'PostStatusHandler.ts'),
    });

    // --- API Gateway ---
    const api = new RestApi(this, 'TweeterApi', {
      restApiName: 'Tweeter API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // /user
    const userResource = api.root.addResource('user');
    userResource.addResource('login').addMethod('POST', new LambdaIntegration(loginLambda));
    userResource.addResource('register').addMethod('POST', new LambdaIntegration(registerLambda));
    userResource.addResource('logout').addMethod('POST', new LambdaIntegration(logoutLambda));
    userResource.addResource('get').addMethod('POST', new LambdaIntegration(getUserLambda));

    // /follower
    const followerResource = api.root.addResource('follower');
    followerResource.addResource('list').addMethod('POST', new LambdaIntegration(getFollowersLambda));
    followerResource.addResource('isfollower').addMethod('POST', new LambdaIntegration(isFollowerStatusLambda));
    followerResource.addResource('count').addMethod('POST', new LambdaIntegration(getFollowerCountLambda));
    followerResource.addResource('follow').addMethod('POST', new LambdaIntegration(followLambda));
    followerResource.addResource('unfollow').addMethod('POST', new LambdaIntegration(unfollowLambda));

    // /followee
    const followeeResource = api.root.addResource('followee');
    followeeResource.addResource('list').addMethod('POST', new LambdaIntegration(getFolloweesLambda));
    followeeResource.addResource('count').addMethod('POST', new LambdaIntegration(getFolloweeCountLambda));

    // /feed
    api.root.addResource('feed').addResource('list').addMethod('POST', new LambdaIntegration(getFeedLambda));

    // /story
    api.root.addResource('story').addResource('list').addMethod('POST', new LambdaIntegration(getStoryLambda));

    // /status
    api.root.addResource('status').addResource('post').addMethod('POST', new LambdaIntegration(postStatusLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Tweeter API Gateway URL',
    });
  }
}
