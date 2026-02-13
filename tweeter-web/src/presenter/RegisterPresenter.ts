import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";

export interface RegisterView {
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

export class RegisterPresenter {
  private _view: RegisterView;
  private userService: UserService;

  public constructor(view: RegisterView) {
    this._view = view;
    this.userService = new UserService();
  }

  public get view(): RegisterView {
    return this._view;
  }

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) {
    try {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.userService.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension
      );

      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.view.navigate(`/feed/${user.alias}`);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to register user because of exception: ${error}`
      );
    } finally {
      this.view.setIsLoading(false);
    }
  }
}
