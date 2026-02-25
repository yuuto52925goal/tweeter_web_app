import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../../model.service/UserService";
import { Presenter, PresenterView } from "../Presenter";

export interface AuthView extends PresenterView {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export abstract class AuthenticationPresenter<V extends AuthView> extends Presenter<V> {
  protected userService: UserService = new UserService();

  protected async doAuthenticationOperation(
    rememberMe: boolean,
    authOperation: () => Promise<[User, AuthToken]>,
    navigateUrl: (user: User) => string,
    operationName: string
  ) {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      const [user, authToken] = await authOperation();
      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.view.navigate(navigateUrl(user));
    }, operationName, () => this.view.setIsLoading(false));
  }
}
