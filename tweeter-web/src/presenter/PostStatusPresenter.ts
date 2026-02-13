import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { User } from "tweeter-shared/dist/model/domain/User";
import { StatusService } from "../model.service/StatusService";

export interface PostStatusView {
  setIsLoading: (isLoading: boolean) => void;
  displayInfoMessage: (message: string, duration: number) => string;
  displayErrorMessage: (message: string) => void;
  deleteMessage: (id: string) => void;
  setPost: (post: string) => void;
}

export class PostStatusPresenter {
  private _view: PostStatusView;
  private statusService: StatusService;

  public constructor(view: PostStatusView) {
    this._view = view;
    this.statusService = new StatusService();
  }

  public get view(): PostStatusView {
    return this._view;
  }

  public async submitPost(
    authToken: AuthToken,
    post: string,
    currentUser: User
  ): Promise<void> {
    try {
      this.view.setIsLoading(true);
      const postingStatusToastId = this.view.displayInfoMessage("Posting status...", 0);

      const status = new Status(post, currentUser, Date.now());

      await this.statusService.postStatus(authToken, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
      this.view.deleteMessage(postingStatusToastId);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      );
    } finally {
      this.view.setIsLoading(false);
    }
  }
}
