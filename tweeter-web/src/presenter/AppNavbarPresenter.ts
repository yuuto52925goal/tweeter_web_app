import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { UserService } from "../model.service/UserService";
import { Presenter } from "./Presenter";

export interface AppNavbarView {
  displayInfoMessage: (message: string, duration: number) => string;
  displayErrorMessage: (message: string) => void;
  deleteMessage: (id: string) => void;
  clearUserInfo: () => void;
  navigate: (url: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
  private userService: UserService;

  public constructor(view: AppNavbarView) {
    super(view)
    this.userService = new UserService();
  }

  public async logOut(authToken: AuthToken): Promise<void> {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
    this.doFailureReportingOperation(async () => {
      await this.userService.logout(authToken);
      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    }, "log user out")
  }
}
