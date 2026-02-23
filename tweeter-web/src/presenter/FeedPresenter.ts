import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { StatusService } from "../model.service/StatusService";
import { StatusItemPresenter, StatusItemView } from "./StatusItemPresenter";
import { Status } from "tweeter-shared/dist/model/domain/Status";

export const PAGE_SIZE = 10;

export class FeedPresenter extends StatusItemPresenter {
    private service: StatusService;

    public constructor(view: StatusItemView) {
      super(view);
      this.service = new StatusService();
    }

    public async loadMoreItems(authToken: AuthToken, userAlias: string) {
      this.doFailureReportingOperation(async () => {
        const [newItems, hasMore] = await this.service.loadMoreFeedItems(
          authToken!,
          userAlias,
          PAGE_SIZE,
          this.lastItem
        );
        this.hasMoreItems = hasMore;
        this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null as Status | null;
        this.view.addItems(newItems);
      }, "load more feed items");
    }
}
