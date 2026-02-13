import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { StatusService } from "../model.service/StatusService";
import { StatusItemPresenter, StatusItemView } from "./StatusItemPresenter";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { PAGE_SIZE } from "./FeedPresenter";

export class StoryPresenter extends StatusItemPresenter {
    private service: StatusService;

    public constructor(view: StatusItemView) {
      super(view);
      this.service = new StatusService();
    }

    public async loadMoreItems(authToken: AuthToken, userAlias: string) {
      try {
        const [newItems, hasMore] = await this.service.loadMoreStoryItems(
          authToken!,
          userAlias,
          PAGE_SIZE,
          this.lastItem
        );

        this.hasMoreItems = hasMore;
        this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null as Status | null;
        this.view.addItems(newItems);
      } catch (error) {
        this.view.displayErrorMessage(
          `Failed to load story items because of exception: ${error}`
        );
      }
    }
}
