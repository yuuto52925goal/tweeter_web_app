import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { FollowService } from "../model.service/FollowService";
import { UserItemPresenter } from "./UserItemPresenter";
import { User } from "tweeter-shared/dist/model/domain/User";
import { PageItemView } from "./PageItemPresenter";

export const PAGE_SIZE = 10;

export class FolloweePresenter extends UserItemPresenter{
    private service: FollowService;

    public constructor(view: PageItemView<User>){
      super(view);
      this.service = new FollowService();
    }

    public async loadMoreItems (authToken: AuthToken, userAlias: string) {
      this.doFailureReportingOperation(async () => {
        const [newItems, hasMore] = await this.service.loadMoreFollowees(
          authToken!,
          userAlias,
          PAGE_SIZE,
          this.lastItem
        );
        this.hasMoreItems = hasMore;
        this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null as User | null;
        this.view.addItems(newItems);
      }, "load more followees");
    };
}