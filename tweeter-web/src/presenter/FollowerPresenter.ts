import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { UserItemPresenter } from "./UserItemPresenter";
import { User } from "tweeter-shared";
import { PAGE_SIZE } from "./PageItemPresenter";

export class FollowerPresenter extends UserItemPresenter {
  protected itemDescription(): string {
    return "load more followers"
  }

  protected getMoreItem(authToken: AuthToken, userAlias: string): Promise<[User[], boolean]> {
    return this.service.loadMoreFollowers(authToken, userAlias, PAGE_SIZE, this.lastItem)
  }
}