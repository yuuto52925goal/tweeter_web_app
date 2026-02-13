import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";

export interface LoginView {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export class LoginPresenter {
  private _view: LoginView;
  private userService: UserService;

  public constructor(view: LoginView) {
    this._view = view;
    this.userService = new UserService();
  }

  public get view(): LoginView {
    return this._view;
  }

  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string
  ) {
    try {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
    } finally {
      this.view.setIsLoading(false);
    }
  }
}
