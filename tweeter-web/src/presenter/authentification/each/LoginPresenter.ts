import { AuthView, AuthenticationPresenter } from "../AuthenticationPresenter";

export class LoginPresenter extends AuthenticationPresenter<AuthView> {
  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string
  ) {
    this.doAuthenticationOperation(
      rememberMe,
      () => this.userService.login(alias, password),
      (user) => originalUrl ?? `/feed/${user.alias}`,
      "log user in"
    );
  }
}
