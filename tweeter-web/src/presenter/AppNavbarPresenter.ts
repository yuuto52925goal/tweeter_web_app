import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { UserService } from "../model.service/UserService";

export interface AppNavbarView {
  displayInfoMessage: (message: string, duration: number) => string;
  displayErrorMessage: (message: string) => void;
  deleteMessage: (id: string) => void;
  clearUserInfo: () => void;
  navigate: (url: string) => void;
}

export class AppNavbarPresenter {
  private _view: AppNavbarView;
  private userService: UserService;

  public constructor(view: AppNavbarView) {
    this._view = view;
    this.userService = new UserService();
  }

  public get view(): AppNavbarView {
    return this._view;
  }

  public async logOut(authToken: AuthToken): Promise<void> {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

    try {
      await this.userService.logout(authToken);

      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user out because of exception: ${error}`
      );
    }
  }
}
