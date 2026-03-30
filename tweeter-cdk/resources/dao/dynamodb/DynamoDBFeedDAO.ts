import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { StatusDto } from "tweeter-shared";
import { IFeedDAO } from "../IFeedDAO";
import { DynamoDBDAOBase } from "./DynamoDBDAOBase";

const TABLE = process.env.FEED_TABLE!;
const BATCH_SIZE = 25; // DynamoDB batch write limit

export class DynamoDBFeedDAO extends DynamoDBDAOBase implements IFeedDAO {
  async putFeedItem(recipientAlias: string, status: StatusDto): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: this.toItem(recipientAlias, status),
      })
    );
  }

  // Fan-out: write one feed item per recipient in batches of 25
  async putFeedItems(recipientAliases: string[], status: StatusDto): Promise<void> {
    for (let i = 0; i < recipientAliases.length; i += BATCH_SIZE) {
      const batch = recipientAliases.slice(i, i + BATCH_SIZE);
      await this.docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE]: batch.map((alias) => ({
              PutRequest: { Item: this.toItem(alias, status) },
            })),
          },
        })
      );
    }
  }

  // Returns feed items newest-first; lastTimestamp is the SK of the last item seen
  async getPageOfFeedItems(
    recipientAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[StatusDto[], boolean]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "recipientAlias = :ra",
        ExpressionAttributeValues: { ":ra": recipientAlias },
        ScanIndexForward: false, // newest first
        Limit: pageSize + 1,
        ExclusiveStartKey: lastTimestamp
          ? { recipientAlias, timestamp: lastTimestamp }
          : undefined,
      })
    );
    const items = result.Items ?? [];
    const hasMore = items.length > pageSize;
    return [items.slice(0, pageSize).map(this.toDto), hasMore];
  }

  private toItem(recipientAlias: string, status: StatusDto): Record<string, any> {
    return {
      recipientAlias,
      timestamp: status.timestamp,
      post: status.post,
      senderAlias: status.user.alias,
      userFirstName: status.user.firstName,
      userLastName: status.user.lastName,
      userImageUrl: status.user.imageUrl,
    };
  }

  private toDto(item: Record<string, any>): StatusDto {
    return {
      post: item.post,
      timestamp: item.timestamp,
      user: {
        alias: item.senderAlias,
        firstName: item.userFirstName,
        lastName: item.userLastName,
        imageUrl: item.userImageUrl,
      },
    };
  }
}
