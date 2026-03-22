import "isomorphic-fetch";
import { AuthToken, User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";

const facade = new ServerFacade();

describe("ServerFacade integration tests", () => {
  describe("register", () => {
    it("returns a valid user and authToken", async () => {
      const [user, authToken] = await facade.register(
        "John",
        "Doe",
        "@jdoe",
        "password",
        "",
        "png"
      );

      expect(user).toBeInstanceOf(User);
      expect(user.firstName).toBeTruthy();
      expect(user.alias).toBeTruthy();
      expect(authToken).toBeInstanceOf(AuthToken);
      expect(authToken.token).toBeTruthy();
    });
  });

  describe("getMoreFollowers", () => {
    it("returns a page of followers and a hasMore flag", async () => {
      const authToken = AuthToken.Generate();
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
      const authToken = AuthToken.Generate();
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
      const authToken = AuthToken.Generate();
      const user = new User("Allen", "Anderson", "@allen", "");
      const count = await facade.getFollowerCount(authToken, user);

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });

    it("returns a positive followee count", async () => {
      const authToken = AuthToken.Generate();
      const user = new User("Allen", "Anderson", "@allen", "");
      const count = await facade.getFolloweeCount(authToken, user);

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });
  });
});
