import bcrypt from "bcryptjs";
import { AuthToken, AuthTokenDto, UserDto } from "tweeter-shared";
import { DAOFactory } from "../dao/DAOFactory";
import { IAuthTokenDAO } from "../dao/IAuthTokenDAO";
import { IS3DAO } from "../dao/IS3DAO";
import { IUserDAO } from "../dao/IUserDAO";
import { BaseService } from "./BaseService";

const SALT_ROUNDS = 10;

export class UserService extends BaseService {
  private readonly userDAO: IUserDAO;
  private readonly authTokenDAO: IAuthTokenDAO;
  private readonly s3DAO: IS3DAO;

  constructor(factory: DAOFactory) {
    super(factory);
    this.userDAO = factory.getUserDAO();
    this.authTokenDAO = factory.getAuthTokenDAO();
    this.s3DAO = factory.getS3DAO();
  }

  async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
    const hash = await this.userDAO.getPasswordHash(alias);
    if (!hash || !(await bcrypt.compare(password, hash))) {
      throw new Error("Invalid alias or password");
    }
    const user = await this.userDAO.getUser(alias);
    if (!user) throw new Error("User not found");

    const authToken = AuthToken.Generate().toDto();
    await this.authTokenDAO.putAuthToken(authToken, alias);
    return [user, authToken];
  }

  async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const existing = await this.userDAO.getUser(alias);
    if (existing) throw new Error("Alias already taken");

    const imageUrl = await this.s3DAO.putImage(
      `${alias}.${imageFileExtension}`,
      userImageBytes
    );

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user: UserDto = { alias, firstName, lastName, imageUrl };
    await this.userDAO.putUser(user, hashedPassword);

    const authToken = AuthToken.Generate().toDto();
    await this.authTokenDAO.putAuthToken(authToken, alias);
    return [user, authToken];
  }

  async logout(authToken: AuthTokenDto): Promise<void> {
    await this.authTokenDAO.deleteAuthToken(authToken.token);
  }

  async getUser(authToken: AuthTokenDto, alias: string): Promise<UserDto | null> {
    await this.authService.validateAuthToken(authToken);
    return this.userDAO.getUser(alias);
  }
}
