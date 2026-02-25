import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";
import { Presenter, PresenterView } from "./Presenter";

export interface UserNavigationView extends PresenterView {
  setDisplayedUser: (user: User) => void;
  navigate: (url: string) => void;
}

export class UserNavigationPresenter extends Presenter<UserNavigationView> {
  private userService: UserService;

  public constructor(view: UserNavigationView) {
    super(view);
    this.userService = new UserService();
  }

  public async navigateToUser(
    authToken: AuthToken,
    alias: string,
    displayedUser: User,
    featurePath: string
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      const toUser = await this.userService.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }
}
