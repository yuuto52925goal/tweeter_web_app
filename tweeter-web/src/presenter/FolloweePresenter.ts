import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { FollowService } from "../model.service/FollowService";
import { UserItemPresenter, UserItemView } from "./UserItemPresenter";
import { User } from "tweeter-shared/dist/model/domain/User";

export const PAGE_SIZE = 10;

export class FolloweePresenter extends UserItemPresenter{
    private service: FollowService;
    

    public constructor(view: UserItemView){
      super(view);
      this.service = new FollowService();
    }

    public async loadMoreItems (authToken: AuthToken, userAlias: string) {
      try {
        const [newItems, hasMore] = await this.service.loadMoreFollowees(
          authToken!,
          userAlias,
          PAGE_SIZE,
          this.lastItem
        );
  
        this.hasMoreItems = hasMore;
        this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null as User | null;
        this.view.addItems(newItems);
      } catch (error) {
        this.view.displayErrorMessage(
          `Failed to load followees because of exception: ${error}`
        );
      }
    };
}