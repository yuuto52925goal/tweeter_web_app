import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";
import { Presenter } from "./Presenter";

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

export class LoginPresenter extends Presenter<LoginView> {
  private userService: UserService;

  public constructor(view: LoginView) {
    super(view)
    this.userService = new UserService();
  }

  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string
  ) {
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      const [user, authToken] = await this.userService.login(alias, password);
      this.view.updateUserInfo(user, user, authToken, rememberMe);
      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    }, "log user in")
  }
}
