import { AuthView, AuthenticationPresenter } from "../AuthenticationPresenter";

export class RegisterPresenter extends AuthenticationPresenter<AuthView> {
  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) {
    this.doAuthenticationOperation(
      rememberMe,
      () => this.userService.register(firstName, lastName, alias, password, imageBytes, imageFileExtension),
      (user) => `/feed/${user.alias}`,
      "register user"
    );
  }
}
