import {
  GetCommand,
  PutCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { UserDto } from "tweeter-shared";
import { IUserDAO } from "../IUserDAO";
import { DynamoDBDAOBase } from "./DynamoDBDAOBase";

const TABLE = process.env.USER_TABLE!;

export class DynamoDBUserDAO extends DynamoDBDAOBase implements IUserDAO {
  async putUser(user: UserDto, hashedPassword: string): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          alias: user.alias,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          passwordHash: hashedPassword,
        },
      })
    );
  }

  async getUser(alias: string): Promise<UserDto | null> {
    const result = await this.docClient.send(
      new GetCommand({ TableName: TABLE, Key: { alias } })
    );
    return result.Item ? this.toDto(result.Item) : null;
  }

  async getPasswordHash(alias: string): Promise<string | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { alias },
        ProjectionExpression: "passwordHash",
      })
    );
    return result.Item?.passwordHash ?? null;
  }

  async getUsersByAliases(aliases: string[]): Promise<UserDto[]> {
    if (aliases.length === 0) return [];

    // BatchGetItem supports up to 100 keys per call
    const users: UserDto[] = [];
    for (let i = 0; i < aliases.length; i += 100) {
      const batch = aliases.slice(i, i + 100);
      const result = await this.docClient.send(
        new BatchGetCommand({
          RequestItems: {
            [TABLE]: {
              Keys: batch.map((alias) => ({ alias })),
            },
          },
        })
      );
      const items = result.Responses?.[TABLE] ?? [];
      users.push(...items.map((item) => this.toDto(item)));
    }

    // BatchGetItem returns items in unspecified order.
    // Restore the original alias order so the pagination cursor stays correct.
    const byAlias = new Map(users.map((u) => [u.alias, u]));
    return aliases.map((a) => byAlias.get(a)).filter((u): u is UserDto => u !== undefined);
  }

  private toDto(item: Record<string, any>): UserDto {
    return {
      alias: item.alias,
      firstName: item.firstName,
      lastName: item.lastName,
      imageUrl: item.imageUrl,
    };
  }
}
