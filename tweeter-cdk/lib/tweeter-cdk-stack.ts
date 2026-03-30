import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  RestApi,
  LambdaIntegration,
  Cors,
  MethodResponse,
  CfnDocumentationPart,
  CfnDocumentationVersion,
  CfnStage,
} from 'aws-cdk-lib/aws-apigateway';

const METHOD_RESPONSES: MethodResponse[] = [
  { statusCode: '200' },
  { statusCode: '400' },
  { statusCode: '500' },
];

export class TweeterCdkStack extends cdk.Stack {
  private api!: RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- DynamoDB Tables ---
    const userTable = new dynamodb.Table(this, 'UserTable', {
      tableName: 'tweeter-users',
      partitionKey: { name: 'alias', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const authTokenTable = new dynamodb.Table(this, 'AuthTokenTable', {
      tableName: 'tweeter-auth-tokens',
      partitionKey: { name: 'token', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Follow table: PK=followerAlias, SK=followeeAlias
    // GSI: PK=followeeAlias, SK=followerAlias (look up who follows a given user)
    const followTable = new dynamodb.Table(this, 'FollowTable', {
      tableName: 'tweeter-follows',
      partitionKey: { name: 'followerAlias', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'followeeAlias', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    followTable.addGlobalSecondaryIndex({
      indexName: 'followee-index',
      partitionKey: { name: 'followeeAlias', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'followerAlias', type: dynamodb.AttributeType.STRING },
      readCapacity: 5,
      writeCapacity: 5,
    });

    // Story table: PK=senderAlias, SK=timestamp (number, ms since epoch)
    const statusTable = new dynamodb.Table(this, 'StatusTable', {
      tableName: 'tweeter-story',
      partitionKey: { name: 'senderAlias', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Feed table: PK=recipientAlias, SK=timestamp (number, ms since epoch)
    const feedTable = new dynamodb.Table(this, 'FeedTable', {
      tableName: 'tweeter-feed',
      partitionKey: { name: 'recipientAlias', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- S3 Bucket for profile images (public read via ACLs) ---
    const imageBucket = new s3.Bucket(this, 'ImageBucket', {
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const handlerDir = path.join(__dirname, '../resources/lambdaHandler');
    const commonProps = {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        USER_TABLE: userTable.tableName,
        AUTH_TOKEN_TABLE: authTokenTable.tableName,
        FOLLOW_TABLE: followTable.tableName,
        STATUS_TABLE: statusTable.tableName,
        FEED_TABLE: feedTable.tableName,
        IMAGE_BUCKET: imageBucket.bucketName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    };

    // --- Lambdas ---
    const loginLambda = new NodejsFunction(this, 'LoginFunction', { ...commonProps, entry: path.join(handlerDir, 'LoginHandler.ts') });
    const registerLambda = new NodejsFunction(this, 'RegisterFunction', { ...commonProps, entry: path.join(handlerDir, 'RegisterHandler.ts') });
    const logoutLambda = new NodejsFunction(this, 'LogoutFunction', { ...commonProps, entry: path.join(handlerDir, 'LogoutHandler.ts') });
    const getUserLambda = new NodejsFunction(this, 'GetUserFunction', { ...commonProps, entry: path.join(handlerDir, 'GetUserHandler.ts') });
    const getFollowersLambda = new NodejsFunction(this, 'GetFollowersFunction', { ...commonProps, entry: path.join(handlerDir, 'GetFollowersHandler.ts') });
    const getFolloweesLambda = new NodejsFunction(this, 'GetFolloweesFunction', { ...commonProps, entry: path.join(handlerDir, 'GetFolloweesHandler.ts') });
    const isFollowerStatusLambda = new NodejsFunction(this, 'IsFollowerStatusFunction', { ...commonProps, entry: path.join(handlerDir, 'IsFollowerStatusHandler.ts') });
    const getFollowerCountLambda = new NodejsFunction(this, 'GetFollowerCountFunction', { ...commonProps, entry: path.join(handlerDir, 'GetFollowerCountHandler.ts') });
    const getFolloweeCountLambda = new NodejsFunction(this, 'GetFolloweeCountFunction', { ...commonProps, entry: path.join(handlerDir, 'GetFolloweeCountHandler.ts') });
    const followLambda = new NodejsFunction(this, 'FollowFunction', { ...commonProps, entry: path.join(handlerDir, 'FollowHandler.ts') });
    const unfollowLambda = new NodejsFunction(this, 'UnfollowFunction', { ...commonProps, entry: path.join(handlerDir, 'UnfollowHandler.ts') });
    const getFeedLambda = new NodejsFunction(this, 'GetFeedFunction', { ...commonProps, entry: path.join(handlerDir, 'GetFeedHandler.ts') });
    const getStoryLambda = new NodejsFunction(this, 'GetStoryFunction', { ...commonProps, entry: path.join(handlerDir, 'GetStoryHandler.ts') });
    const postStatusLambda = new NodejsFunction(this, 'PostStatusFunction', { ...commonProps, entry: path.join(handlerDir, 'PostStatusHandler.ts') });

    // --- Grant DynamoDB + S3 permissions to all lambdas ---
    const allLambdas = [
      loginLambda, registerLambda, logoutLambda, getUserLambda,
      getFollowersLambda, getFolloweesLambda, isFollowerStatusLambda,
      getFollowerCountLambda, getFolloweeCountLambda,
      followLambda, unfollowLambda,
      getFeedLambda, getStoryLambda, postStatusLambda,
    ];
    for (const fn of allLambdas) {
      userTable.grantReadWriteData(fn);
      authTokenTable.grantReadWriteData(fn);
      followTable.grantReadWriteData(fn);
      statusTable.grantReadWriteData(fn);
      feedTable.grantReadWriteData(fn);
      imageBucket.grantReadWrite(fn);
    }

    new cdk.CfnOutput(this, 'ImageBucketName', {
      value: imageBucket.bucketName,
      description: 'S3 bucket for Tweeter profile images',
    });

    // --- API Gateway ---
    this.api = new RestApi(this, 'TweeterApi', {
      restApiName: 'Tweeter API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // /user
    const userResource = this.api.root.addResource('user');
    this.addMethod(userResource.addResource('login'), loginLambda, '/user/login',
      'Authenticates a user with alias and password. Returns the user object and an auth token. Returns 400 if alias or password is missing.');
    this.addMethod(userResource.addResource('register'), registerLambda, '/user/register',
      'Registers a new user with name, alias, password, and profile image. Returns the created user object and an auth token.');
    this.addMethod(userResource.addResource('logout'), logoutLambda, '/user/logout',
      'Logs out the current user and invalidates the auth token.');
    this.addMethod(userResource.addResource('get'), getUserLambda, '/user/get',
      'Returns the user object for a given alias. Requires a valid auth token.');

    // /follower
    const followerResource = this.api.root.addResource('follower');
    this.addMethod(followerResource.addResource('list'), getFollowersLambda, '/follower/list',
      'Returns a paginated list of followers for a given user alias. Supports cursor-based pagination via lastItem.');
    this.addMethod(followerResource.addResource('isfollower'), isFollowerStatusLambda, '/follower/isfollower',
      'Checks whether a given user is currently following another user. Returns a boolean isFollower field.');
    this.addMethod(followerResource.addResource('count'), getFollowerCountLambda, '/follower/count',
      'Returns the number of followers for a given user.');
    this.addMethod(followerResource.addResource('follow'), followLambda, '/follower/follow',
      'Follows the specified user. Returns updated follower and followee counts for that user.');
    this.addMethod(followerResource.addResource('unfollow'), unfollowLambda, '/follower/unfollow',
      'Unfollows the specified user. Returns updated follower and followee counts for that user.');

    // /followee
    const followeeResource = this.api.root.addResource('followee');
    this.addMethod(followeeResource.addResource('list'), getFolloweesLambda, '/followee/list',
      'Returns a paginated list of users that a given user is following. Supports cursor-based pagination via lastItem.');
    this.addMethod(followeeResource.addResource('count'), getFolloweeCountLambda, '/followee/count',
      'Returns the number of users that a given user is following.');

    // /feed
    this.addMethod(this.api.root.addResource('feed').addResource('list'), getFeedLambda, '/feed/list',
      'Returns a paginated list of statuses from users that the current user follows (feed). Supports cursor-based pagination via lastItem.');

    // /story
    this.addMethod(this.api.root.addResource('story').addResource('list'), getStoryLambda, '/story/list',
      'Returns a paginated list of statuses posted by a specific user (story). Supports cursor-based pagination via lastItem.');

    // /status
    this.addMethod(this.api.root.addResource('status').addResource('post'), postStatusLambda, '/status/post',
      'Posts a new status on behalf of the authenticated user. The status is added to the user\'s story and their followers\' feeds.');

    // --- Publish documentation version ---
    const docVersion = new CfnDocumentationVersion(this, 'ApiDocVersion', {
      documentationVersion: '1.0',
      restApiId: this.api.restApiId,
      description: 'Tweeter API Documentation v1.0',
    });

    // Associate doc version with the deployed stage
    const cfnStage = this.api.deploymentStage.node.defaultChild as CfnStage;
    cfnStage.documentationVersion = '1.0';
    cfnStage.addDependency(docVersion);

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'Tweeter API Gateway URL',
    });
  }

  private addMethod(
    resource: apigateway.Resource,
    lambdaFn: lambda.Function,
    apiPath: string,
    description: string
  ): void {
    resource.addMethod('POST', new LambdaIntegration(lambdaFn), {
      methodResponses: METHOD_RESPONSES,
    });

    // Derive a unique ID from the path (e.g. "/follower/list" -> "DocFollowerList")
    const docId = 'Doc' + apiPath.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    new CfnDocumentationPart(this, docId, {
      location: { type: 'METHOD', path: apiPath, method: 'POST' },
      properties: JSON.stringify({ description }),
      restApiId: this.api.restApiId,
    });
  }
}
