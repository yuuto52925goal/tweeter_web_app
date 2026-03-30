import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { AuthTokenDto } from "tweeter-shared";
import { IAuthTokenDAO } from "../IAuthTokenDAO";
import { DynamoDBDAOBase } from "./DynamoDBDAOBase";

const TABLE = process.env.AUTH_TOKEN_TABLE!;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class DynamoDBAuthTokenDAO extends DynamoDBDAOBase implements IAuthTokenDAO {
  async putAuthToken(authToken: AuthTokenDto, alias: string): Promise<void> {
    const expiresAt = Math.floor((authToken.timestamp + TOKEN_TTL_MS) / 1000); // DynamoDB TTL is in seconds
    await this.docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          token: authToken.token,
          alias,
          timestamp: authToken.timestamp,
          expiresAt,
        },
      })
    );
  }

  async getAuthTokenAlias(token: string): Promise<string | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { token },
        ProjectionExpression: "#a, expiresAt",
        ExpressionAttributeNames: { "#a": "alias" },
      })
    );
    if (!result.Item) return null;

    // Guard against expired items that TTL hasn't cleaned yet
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (result.Item.expiresAt < nowSeconds) return null;

    return result.Item.alias;
  }

  async deleteAuthToken(token: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({ TableName: TABLE, Key: { token } })
    );
  }
}
