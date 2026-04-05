/**
 * One-time seed script — run after `cdk deploy` to populate DynamoDB with test data.
 *
 * Usage:
 *   cd tweeter-cdk
 *   npx ts-node resources/seed/seedData.ts
 *
 * Requires AWS credentials with DynamoDB write access (same profile used for cdk deploy).
 *
 * IMPORTANT: Before running, temporarily increase WCU on tweeter-users and tweeter-follows
 * tables to 200 (to speed up writes). After seeding is complete, reduce back to 5.
 *
 * What gets created:
 *   - @allen + 15 named users (existing test users, password = "password")
 *   - 10,000 generated users @user00001–@user10000 (password = "password")
 *   - All 10,000 generated users follow @allen → @allen has 10,015+ followers
 *   - @allen follows the 15 named users
 *   - @allen posts 15 statuses (story)
 *   - The 15 named others each post 3 statuses (story + @allen's feed)
 *   - All other users get @allen's 15 posts in their feed
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

// Number of generated bulk users (must be ≥ 10,000 for pass-off)
const BULK_USER_COUNT = 10_000;
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
const NAMED_USERS = [ALLEN, ...OTHER_USERS];

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

function makeBulkAlias(n: number): string {
  return `@user${String(n).padStart(5, "0")}`;
}

// ─── Seed Steps ──────────────────────────────────────────────────────────────

async function seedNamedUsers(passwordHash: string) {
  console.log(`Seeding ${NAMED_USERS.length} named users…`);
  for (const u of NAMED_USERS) {
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

async function seedBulkUsers(passwordHash: string) {
  console.log(`Seeding ${BULK_USER_COUNT} bulk users (@user00001–@user${String(BULK_USER_COUNT).padStart(5, "0")})…`);
  // All bulk users share the same profile image to keep things simple
  const sharedImageUrl = `${IMAGE_BASE}/bulk-user.png`;

  const items: Record<string, any>[] = [];
  for (let n = 1; n <= BULK_USER_COUNT; n++) {
    const alias = makeBulkAlias(n);
    items.push({
      alias,
      firstName: `User`,
      lastName: `${n}`,
      imageUrl: sharedImageUrl,
      passwordHash,
    });
  }

  console.log("  Writing bulk users in batches of 25…");
  await batchWrite(USER_TABLE, items);
  console.log("  Bulk users written.");
}

async function seedNamedFollows() {
  console.log("Seeding named-user follow relationships…");
  const items: Record<string, any>[] = [];

  for (const other of OTHER_USERS) {
    // @allen → other  (allen's followees)
    items.push({ followerAlias: ALLEN.alias, followeeAlias: other.alias });
    // other → @allen  (allen's followers)
    items.push({ followerAlias: other.alias, followeeAlias: ALLEN.alias });
  }

  await batchWrite(FOLLOW_TABLE, items);
}

async function seedBulkFollows() {
  console.log(`Seeding ${BULK_USER_COUNT} bulk-user follows → @allen…`);
  const items: Record<string, any>[] = [];

  for (let n = 1; n <= BULK_USER_COUNT; n++) {
    items.push({ followerAlias: makeBulkAlias(n), followeeAlias: ALLEN.alias });
  }

  console.log("  Writing bulk follows in batches of 25…");
  await batchWrite(FOLLOW_TABLE, items);
  console.log(`  Done. @allen now has ${BULK_USER_COUNT + OTHER_USERS.length} followers.`);
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
  console.log("Seeding named users' feeds (@allen's posts)…");
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
  console.log("NOTE: Make sure you have temporarily set WCU to 200 on");
  console.log("      tweeter-users and tweeter-follows before running this script.\n");

  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  await seedNamedUsers(passwordHash);
  await seedBulkUsers(passwordHash);
  await seedNamedFollows();
  await seedBulkFollows();
  const allenPosts = await seedAllenStory();
  const otherPosts = await seedOtherStories();
  await seedAllenFeed(otherPosts);
  await seedOtherFeeds(allenPosts);

  console.log("\n✅ Done! Summary:");
  console.log(`  Named users:   ${NAMED_USERS.length}  (all use password: "password")`);
  console.log(`  Bulk users:    ${BULK_USER_COUNT}  (@user00001–@user${String(BULK_USER_COUNT).padStart(5, "0")})`);
  console.log(`  @allen followers: ${BULK_USER_COUNT + OTHER_USERS.length}`);
  console.log("\nTest credentials:");
  console.log("  alias: @allen   password: password");
  console.log("  alias: @amy     password: password");
  console.log("  (all named users share the same password)");
  console.log("\nRemember to reduce WCU back to 5 on users and follows tables!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
