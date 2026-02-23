import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { UserItemPresenter } from "../UserItemPresenter";
import { User } from "tweeter-shared/dist/model/domain/User";
import { PAGE_SIZE, PageItemView } from "../../PageItemPresenter";


export class FolloweePresenter extends UserItemPresenter{
    protected itemDescription(): string {
      return "load more followees"
    }

    protected getMoreItem(authToken: AuthToken, userAlias: string): Promise<[User[], boolean]> {
      return this.service.loadMoreFollowees(authToken, userAlias, PAGE_SIZE, this.lastItem)
    }
}