import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { User } from "tweeter-shared/dist/model/domain/User";
import { StatusService } from "../model.service/StatusService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView {
  setIsLoading: (isLoading: boolean) => void;
  setPost: (post: string) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private statusService: StatusService;

  public constructor(view: PostStatusView) {
    super(view)
    this.statusService = new StatusService();
  }

  public async submitPost(
    authToken: AuthToken,
    post: string,
    currentUser: User
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      const postingStatusToastId = this.view.displayInfoMessage("Posting status...", 0);
      const status = new Status(post, currentUser, Date.now());
      await this.statusService.postStatus(authToken, status);
      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
      this.view.deleteMessage(postingStatusToastId);
    }, "post the status")
  }
}
