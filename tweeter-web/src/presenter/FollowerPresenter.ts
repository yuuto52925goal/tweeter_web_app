import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { FollowService } from "../model.service/FollowService";
import { UserItemPresenter, UserItemView } from "./UserItemPresenter";
import { PAGE_SIZE } from "./FolloweePresenter";
import { User } from "tweeter-shared";

export class FollowerPresenter extends UserItemPresenter {
    private service: FollowService;

    public constructor(view: UserItemView){
      super(view);
      this.service = new FollowService();
    }

    public async loadMoreItems(authToken: AuthToken, userAlias: string): Promise<void> {
        this.doFailureReportingOperation(async () => {
            const [newItems, hasMore] = await this.service.loadMoreFollowers(
                authToken!,
                userAlias,
                PAGE_SIZE,
                this.lastItem
            );
            this.hasMoreItems = hasMore;
            this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null as User | null;
            this.view.addItems(newItems);
        }, "load more followers");
    }
}