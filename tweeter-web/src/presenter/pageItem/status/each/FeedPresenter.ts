import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { StatusItemPresenter } from "../StatusItemPresenter";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { PAGE_SIZE } from "../../PageItemPresenter";

export class FeedPresenter extends StatusItemPresenter {
  protected itemDescription(): string {
    return "load more feed items"
  }
  protected getMoreItem(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
    return this.service.loadMoreFeedItems(authToken, userAlias, PAGE_SIZE, this.lastItem)
  }
}
