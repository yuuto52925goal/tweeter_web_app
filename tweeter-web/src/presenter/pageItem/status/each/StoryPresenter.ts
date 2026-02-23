import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { StatusItemPresenter } from "../StatusItemPresenter";
import { PAGE_SIZE } from "../../PageItemPresenter";
import { Status } from "tweeter-shared/dist/model/domain/Status";

export class StoryPresenter extends StatusItemPresenter {
  protected itemDescription(): string {
    return "load more story items"
  }
  protected getMoreItem(authToken: AuthToken, userAlias: string): Promise<[Status[], boolean]> {
    return this.service.loadMoreStoryItems(authToken, userAlias, PAGE_SIZE, this.lastItem)
  }
}
