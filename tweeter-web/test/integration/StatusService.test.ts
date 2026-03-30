import "isomorphic-fetch";
import { AuthToken, Status } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import { StatusService } from "../../src/model.service/StatusService";

const facade = new ServerFacade();
const service = new StatusService();

describe("StatusService integration tests", () => {
  let authToken: AuthToken;
  beforeAll(async () => {
    const [, token] = await facade.login("@allen", "password");
    authToken = token;
  });

  describe("loadMoreStoryItems", () => {
    it("returns a non-empty page of statuses with a hasMore flag", async () => {
      const [items, hasMore] = await service.loadMoreStoryItems(
        authToken,
        "@allen",
        5,
        null
      );

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      items.forEach((s) => {
        expect(s).toBeInstanceOf(Status);
        expect(s.post).toBeTruthy();
        expect(s.user).toBeTruthy();
        expect(s.timestamp).toBeDefined();
      });
      expect(typeof hasMore).toBe("boolean");
    });
  });
});
