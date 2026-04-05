/**
 * Integration test — Post Status flow
 *
 * 1. Logs in a real user via ServerFacade
 * 2. Posts a status via PostStatusPresenter (exercises the Presenter layer)
 * 3. Verifies "Successfully Posted!" was displayed to the user
 * 4. Retrieves the user's story via StatusService and confirms the new post appears
 *
 * Requires a running backend (real DynamoDB/Lambda stack).
 * The test user @allen must exist in the database (created by seedData.ts).
 */

import "isomorphic-fetch";
import { AuthToken, Status, User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import { StatusService } from "../../src/model.service/StatusService";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenter/PostStatusPresenter";

// ─── Fake view that records every message displayed ──────────────────────────

class RecordingView implements PostStatusView {
  public readonly infoMessages: { message: string; duration: number }[] = [];
  public readonly deletedIds: string[] = [];
  public readonly errorMessages: string[] = [];
  public currentPost = "";
  public loading = false;
  private _idCounter = 0;

  displayInfoMessage(message: string, duration: number): string {
    const id = `toast-${this._idCounter++}`;
    this.infoMessages.push({ message, duration });
    return id;
  }

  deleteMessage(id: string): void {
    this.deletedIds.push(id);
  }

  displayErrorMessage(message: string): void {
    this.errorMessages.push(message);
  }

  setPost(post: string): void {
    this.currentPost = post;
  }

  setIsLoading(loading: boolean): void {
    this.loading = loading;
  }
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe("Post Status Integration", () => {
  const facade = new ServerFacade();
  const statusService = new StatusService();

  let authToken: AuthToken;
  let currentUser: User;

  // Unique post text so we can unambiguously identify it in the story
  const uniquePost = `Integration test post — ${Date.now()}`;

  beforeAll(async () => {
    // Step 1: Login
    [currentUser, authToken] = await facade.login("@allen", "password");
    expect(authToken).toBeInstanceOf(AuthToken);
    expect(currentUser).toBeInstanceOf(User);
  }, 15_000);

  it(
    "posts a status and verifies it appears in the user's story",
    async () => {
      // ── Step 2: Post via Presenter ──────────────────────────────────────
      const view = new RecordingView();
      const presenter = new PostStatusPresenter(view);

      await presenter.submitPost(authToken, uniquePost, currentUser);

      // ── Step 3: Verify "Successfully Posted!" was displayed ────────────
      expect(view.errorMessages).toHaveLength(0);
      const successMessage = view.infoMessages.find(
        (m) => m.message === "Successfully Posted!"
      );
      expect(successMessage).toBeDefined();
      // Post field should have been cleared
      expect(view.currentPost).toBe("");

      // ── Step 4: Retrieve story and verify the status is present ────────
      const [storyItems] = await statusService.loadMoreStoryItems(
        authToken,
        currentUser.alias,
        10,
        null
      );

      expect(Array.isArray(storyItems)).toBe(true);
      const match = storyItems.find((s) => s.post === uniquePost);

      expect(match).toBeDefined();
      expect(match!.post).toBe(uniquePost);
      expect(match!.user.alias).toBe(currentUser.alias);
      expect(match!.user.firstName).toBe(currentUser.firstName);
      expect(match!.user.lastName).toBe(currentUser.lastName);
      expect(typeof match!.timestamp).toBe("number");
      expect(match!.timestamp).toBeGreaterThan(0);
    },
    30_000 // allow up to 30 s for real network round-trips
  );
});
