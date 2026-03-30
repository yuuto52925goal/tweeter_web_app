import "isomorphic-fetch";
import { AuthToken, User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";

const facade = new ServerFacade();

describe("ServerFacade integration tests", () => {
  // Login once to get a real DynamoDB-backed token for all protected endpoints
  let authToken: AuthToken;
  beforeAll(async () => {
    const [, token] = await facade.login("@allen", "password");
    authToken = token;
  });

  describe("register", () => {
    it("returns a valid user and authToken", async () => {
      // Use a unique alias so re-runs don't fail with "alias already taken"
      const alias = `@testuser${Date.now()}`;
      const [user, token] = await facade.register(
        "John",
        "Doe",
        alias,
        "password",
        "",
        "png"
      );

      expect(user).toBeInstanceOf(User);
      expect(user.firstName).toBeTruthy();
      expect(user.alias).toBeTruthy();
      expect(token).toBeInstanceOf(AuthToken);
      expect(token.token).toBeTruthy();
    });
  });

  describe("getMoreFollowers", () => {
    it("returns a page of followers and a hasMore flag", async () => {
      const [followers, hasMore] = await facade.getMoreFollowers({
        authToken: authToken.toDto(),
        userAlias: "@allen",
        pageSize: 5,
        lastItem: null,
      });

      expect(Array.isArray(followers)).toBe(true);
      expect(followers.length).toBeGreaterThan(0);
      followers.forEach((u) => expect(u).toBeInstanceOf(User));
      expect(typeof hasMore).toBe("boolean");
    });

    it("paginates correctly with a lastItem", async () => {
      const [firstPage] = await facade.getMoreFollowers({
        authToken: authToken.toDto(),
        userAlias: "@allen",
        pageSize: 2,
        lastItem: null,
      });

      const [secondPage] = await facade.getMoreFollowers({
        authToken: authToken.toDto(),
        userAlias: "@allen",
        pageSize: 2,
        lastItem: firstPage[firstPage.length - 1].toDto(),
      });

      expect(secondPage.length).toBeGreaterThan(0);
      expect(secondPage[0].alias).not.toBe(firstPage[0].alias);
    });
  });

  describe("getFollowerCount and getFolloweeCount", () => {
    it("returns a positive follower count", async () => {
      const user = new User("Allen", "Anderson", "@allen", "");
      const count = await facade.getFollowerCount(authToken, user);

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });

    it("returns a positive followee count", async () => {
      const user = new User("Allen", "Anderson", "@allen", "");
      const count = await facade.getFolloweeCount(authToken, user);

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });
  });
});
