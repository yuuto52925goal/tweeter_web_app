/**
 * One-time seed script — run after `cdk deploy` to populate DynamoDB with test data.
 *
 * Usage:
 *   cd tweeter-cdk
 *   npx ts-node resources/seed/seedData.ts
 *
 * Requires AWS credentials with DynamoDB write access (same profile used for cdk deploy).
 *
 * What gets created:
 *   - 16 users  (@allen + 15 others), all with password "password"
 *   - @allen follows all 15 others  → followees tab has 15 items
 *   - All 15 others follow @allen   → followers tab has 15 items
 *   - @allen posts 15 statuses      → @allen's story tab has 15 items
 *   - Each of the 15 others posts 3 statuses that fan-out to @allen's feed
 *                                   → @allen's feed tab has 45 items
 *   - Each of the 15 others gets @allen's 15 posts in their feed
 */

import bcrypt from "bcryptjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

// ─── Config ──────────────────────────────────────────────────────────────────
process.env.AWS_PROFILE = "personal";

const REGION = process.env.AWS_REGION ?? "us-east-1";
const USER_TABLE = "tweeter-users";
const FOLLOW_TABLE = "tweeter-follows";
const STATUS_TABLE = "tweeter-story";
const FEED_TABLE = "tweeter-feed";
const PASSWORD = "password";
const SALT_ROUNDS = 10;
const IMAGE_BASE = "https://robohash.org";
// ─────────────────────────────────────────────────────────────────────────────

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

interface SeedUser {
  alias: string;
  firstName: string;
  lastName: string;
}

const OTHER_USERS: SeedUser[] = [
  { alias: "@amy",    firstName: "Amy",     lastName: "Ames"      },
  { alias: "@bob",    firstName: "Bob",     lastName: "Birch"     },
  { alias: "@charlie",firstName: "Charlie", lastName: "Cross"     },
  { alias: "@dave",   firstName: "Dave",    lastName: "Dunne"     },
  { alias: "@eve",    firstName: "Eve",     lastName: "Ellis"     },
  { alias: "@frank",  firstName: "Frank",   lastName: "Ford"      },
  { alias: "@grace",  firstName: "Grace",   lastName: "Green"     },
  { alias: "@henry",  firstName: "Henry",   lastName: "Hill"      },
  { alias: "@iris",   firstName: "Iris",    lastName: "Ivy"       },
  { alias: "@jack",   firstName: "Jack",    lastName: "Jones"     },
  { alias: "@kate",   firstName: "Kate",    lastName: "King"      },
  { alias: "@leo",    firstName: "Leo",     lastName: "Lane"      },
  { alias: "@mary",   firstName: "Mary",    lastName: "Moss"      },
  { alias: "@ned",    firstName: "Ned",     lastName: "Nash"      },
  { alias: "@olivia", firstName: "Olivia",  lastName: "Oaks"      },
];

const ALLEN: SeedUser = { alias: "@allen", firstName: "Allen", lastName: "Anderson" };
const ALL_USERS = [ALLEN, ...OTHER_USERS];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function batchWrite(tableName: string, items: Record<string, any>[]) {
  const CHUNK = 25;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((Item) => ({ PutRequest: { Item } })),
        },
      })
    );
  }
}

function imageUrl(alias: string) {
  return `${IMAGE_BASE}/${encodeURIComponent(alias)}.png`;
}

// Timestamps descending from now, spaced 1 minute apart
function timestamps(count: number, baseOffset = 0): number[] {
  const base = Date.now() - baseOffset;
  return Array.from({ length: count }, (_, i) => base - i * 60_000);
}

// ─── Seed Steps ──────────────────────────────────────────────────────────────

async function seedUsers(passwordHash: string) {
  console.log("Seeding users…");
  for (const u of ALL_USERS) {
    await docClient.send(
      new PutCommand({
        TableName: USER_TABLE,
        Item: {
          alias: u.alias,
          firstName: u.firstName,
          lastName: u.lastName,
          imageUrl: imageUrl(u.alias),
          passwordHash,
        },
      })
    );
  }
}

async function seedFollows() {
  console.log("Seeding follow relationships…");
  const items: Record<string, any>[] = [];

  for (const other of OTHER_USERS) {
    // @allen → other  (allen's followees)
    items.push({ followerAlias: ALLEN.alias, followeeAlias: other.alias });
    // other → @allen  (allen's followers)
    items.push({ followerAlias: other.alias, followeeAlias: ALLEN.alias });
  }

  await batchWrite(FOLLOW_TABLE, items);
}

async function seedAllenStory(): Promise<{ timestamp: number; post: string }[]> {
  console.log("Seeding @allen's story (15 posts)…");
  const ts = timestamps(15);
  const items = ts.map((timestamp, i) => ({
    senderAlias: ALLEN.alias,
    timestamp,
    post: `Hey everyone! This is Allen's post #${i + 1}. #tweeter`,
    userFirstName: ALLEN.firstName,
    userLastName: ALLEN.lastName,
    userImageUrl: imageUrl(ALLEN.alias),
  }));

  await batchWrite(STATUS_TABLE, items);
  return items.map((it) => ({ timestamp: it.timestamp, post: it.post }));
}

async function seedOtherStories(): Promise<
  { senderAlias: string; timestamp: number; post: string }[]
> {
  console.log("Seeding other users' stories (3 posts each)…");
  const allPosts: { senderAlias: string; timestamp: number; post: string }[] = [];
  const storyItems: Record<string, any>[] = [];

  for (let idx = 0; idx < OTHER_USERS.length; idx++) {
    const u = OTHER_USERS[idx];
    // offset each user's posts so timestamps don't collide
    const ts = timestamps(3, (idx + 1) * 200_000);
    for (let j = 0; j < 3; j++) {
      const post = `Hello from ${u.firstName}! Post #${j + 1} — loving Tweeter! #hello`;
      storyItems.push({
        senderAlias: u.alias,
        timestamp: ts[j],
        post,
        userFirstName: u.firstName,
        userLastName: u.lastName,
        userImageUrl: imageUrl(u.alias),
      });
      allPosts.push({ senderAlias: u.alias, timestamp: ts[j], post });
    }
  }

  await batchWrite(STATUS_TABLE, storyItems);
  return allPosts;
}

async function seedAllenFeed(
  otherPosts: { senderAlias: string; timestamp: number; post: string }[]
) {
  console.log(`Seeding @allen's feed (${otherPosts.length} items)…`);
  const items = otherPosts.map(({ senderAlias, timestamp, post }) => {
    const u = OTHER_USERS.find((x) => x.alias === senderAlias)!;
    return {
      recipientAlias: ALLEN.alias,
      timestamp,
      post,
      senderAlias,
      userFirstName: u.firstName,
      userLastName: u.lastName,
      userImageUrl: imageUrl(senderAlias),
    };
  });

  await batchWrite(FEED_TABLE, items);
}

async function seedOtherFeeds(
  allenPosts: { timestamp: number; post: string }[]
) {
  console.log("Seeding other users' feeds (@allen's posts)…");
  const items: Record<string, any>[] = [];

  for (const u of OTHER_USERS) {
    for (const { timestamp, post } of allenPosts) {
      items.push({
        recipientAlias: u.alias,
        timestamp,
        post,
        senderAlias: ALLEN.alias,
        userFirstName: ALLEN.firstName,
        userLastName: ALLEN.lastName,
        userImageUrl: imageUrl(ALLEN.alias),
      });
    }
  }

  await batchWrite(FEED_TABLE, items);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Connecting to DynamoDB in ${REGION}…\n`);
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  await seedUsers(passwordHash);
  await seedFollows();
  const allenPosts = await seedAllenStory();
  const otherPosts = await seedOtherStories();
  await seedAllenFeed(otherPosts);
  await seedOtherFeeds(allenPosts);

  console.log("\nDone! Test credentials:");
  console.log("  alias: @allen   password: password");
  console.log("  alias: @amy     password: password");
  console.log("  (all 16 users share the same password)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
