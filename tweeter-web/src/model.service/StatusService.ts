import { AuthToken, Status } from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";
import { Service } from "./Service";

export class StatusService implements Service {
  private facade = new ServerFacade();

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return this.facade.getMoreFeedItems({
      authToken: authToken.toDto(),
      userAlias,
      pageSize,
      lastItem: lastItem ? lastItem.toDto() : null,
    });
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return this.facade.getMoreStoryItems({
      authToken: authToken.toDto(),
      userAlias,
      pageSize,
      lastItem: lastItem ? lastItem.toDto() : null,
    });
  }

  public async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    return this.facade.postStatus(authToken, newStatus);
  }
}
