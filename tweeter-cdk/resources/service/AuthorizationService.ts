import { AuthTokenDto } from "tweeter-shared";
import { DAOFactory } from "../dao/DAOFactory";
import { IAuthTokenDAO } from "../dao/IAuthTokenDAO";

export class AuthorizationService {
  private readonly authTokenDAO: IAuthTokenDAO;

  constructor(factory: DAOFactory) {
    this.authTokenDAO = factory.getAuthTokenDAO();
  }

  /**
   * Validates the token and returns the alias of the token owner.
   * Throws if the token is missing, expired, or unknown.
   */
  async validateAuthToken(authToken: AuthTokenDto): Promise<string> {
    if (!authToken?.token) {
      throw new Error("[Unauthorized] Auth token is required");
    }
    const alias = await this.authTokenDAO.getAuthTokenAlias(authToken.token);
    if (!alias) {
      throw new Error("[Unauthorized] Invalid or expired auth token");
    }
    return alias;
  }
}
