import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";
import { Presenter, PresenterView } from "./Presenter";

export interface RegisterView extends PresenterView {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export class RegisterPresenter extends Presenter<RegisterView>{
  private userService: UserService;

  public constructor(view: RegisterView) {
    super(view)
    this.userService = new UserService();
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
    this.doFailureReportingOperation(async () =>{
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
    }, "register user")
  }
}
