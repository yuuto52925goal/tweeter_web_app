import { AuthToken, AuthTokenDto, FakeData, User, UserDto } from "tweeter-shared";

export class UserService {
  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const user = FakeData.instance.firstUser;
    if (user === null) {
      throw new Error("Invalid alias or password");
    }
    return [user.toDto(), FakeData.instance.authToken.toDto()];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const user = FakeData.instance.firstUser;
    if (user === null) {
      throw new Error("Invalid registration");
    }
    return [user.toDto(), FakeData.instance.authToken.toDto()];
  }

  public async logout(authToken: AuthTokenDto): Promise<void> {
    // No-op for now
  }

  public async getUser(
    authToken: AuthTokenDto,
    alias: string
  ): Promise<UserDto | null> {
    const user = FakeData.instance.findUserByAlias(alias);
    return user ? user.toDto() : null;
  }
}
