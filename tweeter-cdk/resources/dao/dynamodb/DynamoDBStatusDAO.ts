import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { StatusDto } from "tweeter-shared";
import { IStatusDAO } from "../IStatusDAO";
import { DynamoDBDAOBase } from "./DynamoDBDAOBase";

const TABLE = process.env.STATUS_TABLE!;

export class DynamoDBStatusDAO extends DynamoDBDAOBase implements IStatusDAO {
  async putStatus(status: StatusDto): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          senderAlias: status.user.alias,
          timestamp: status.timestamp,
          post: status.post,
          userFirstName: status.user.firstName,
          userLastName: status.user.lastName,
          userImageUrl: status.user.imageUrl,
        },
      })
    );
  }

  // Returns statuses newest-first; lastTimestamp is the SK of the last item seen
  async getPageOfStatuses(
    senderAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[StatusDto[], boolean]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "senderAlias = :sa",
        ExpressionAttributeValues: { ":sa": senderAlias },
        ScanIndexForward: false, // newest first
        Limit: pageSize + 1,
        ExclusiveStartKey: lastTimestamp
          ? { senderAlias, timestamp: lastTimestamp }
          : undefined,
      })
    );
    const items = result.Items ?? [];
    const hasMore = items.length > pageSize;
    return [items.slice(0, pageSize).map(this.toDto), hasMore];
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
