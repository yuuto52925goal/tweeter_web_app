import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { IFollowDAO } from "../IFollowDAO";
import { DynamoDBDAOBase } from "./DynamoDBDAOBase";

const TABLE = process.env.FOLLOW_TABLE!;
const FOLLOWEE_INDEX = "followee-index";

export class DynamoDBFollowDAO extends DynamoDBDAOBase implements IFollowDAO {
  async putFollow(followerAlias: string, followeeAlias: string): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: { followerAlias, followeeAlias },
      })
    );
  }

  async deleteFollow(followerAlias: string, followeeAlias: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { followerAlias, followeeAlias },
      })
    );
  }

  async isFollower(followerAlias: string, followeeAlias: string): Promise<boolean> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { followerAlias, followeeAlias },
        ProjectionExpression: "followerAlias",
      })
    );
    return !!result.Item;
  }

  // Paginated list of aliases that follow followeeAlias (uses GSI)
  async getFollowerAliases(
    followeeAlias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: FOLLOWEE_INDEX,
        KeyConditionExpression: "followeeAlias = :fe",
        ExpressionAttributeValues: { ":fe": followeeAlias },
        Limit: pageSize + 1,
        ExclusiveStartKey: lastAlias
          ? { followeeAlias, followerAlias: lastAlias }
          : undefined,
      })
    );
    const items = result.Items ?? [];
    const hasMore = items.length > pageSize;
    return [
      items.slice(0, pageSize).map((i) => i.followerAlias as string),
      hasMore,
    ];
  }

  // Paginated list of aliases that followerAlias follows (main table)
  async getFolloweeAliases(
    followerAlias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "followerAlias = :fr",
        ExpressionAttributeValues: { ":fr": followerAlias },
        Limit: pageSize + 1,
        ExclusiveStartKey: lastAlias
          ? { followerAlias, followeeAlias: lastAlias }
          : undefined,
      })
    );
    const items = result.Items ?? [];
    const hasMore = items.length > pageSize;
    return [
      items.slice(0, pageSize).map((i) => i.followeeAlias as string),
      hasMore,
    ];
  }

  async getFollowerCount(followeeAlias: string): Promise<number> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: FOLLOWEE_INDEX,
        KeyConditionExpression: "followeeAlias = :fe",
        ExpressionAttributeValues: { ":fe": followeeAlias },
        Select: "COUNT",
      })
    );
    return result.Count ?? 0;
  }

  async getFolloweeCount(followerAlias: string): Promise<number> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "followerAlias = :fr",
        ExpressionAttributeValues: { ":fr": followerAlias },
        Select: "COUNT",
      })
    );
    return result.Count ?? 0;
  }

  // Full list of follower aliases — used for feed fan-out
  async getAllFollowerAliases(followeeAlias: string): Promise<string[]> {
    const aliases: string[] = [];
    let lastKey: Record<string, any> | undefined;

    do {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: TABLE,
          IndexName: FOLLOWEE_INDEX,
          KeyConditionExpression: "followeeAlias = :fe",
          ExpressionAttributeValues: { ":fe": followeeAlias },
          ExclusiveStartKey: lastKey,
        })
      );
      (result.Items ?? []).forEach((i) => aliases.push(i.followerAlias as string));
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return aliases;
  }
}
