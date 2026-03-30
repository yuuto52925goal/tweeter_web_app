import { AuthTokenDto } from "tweeter-shared";

export interface IAuthTokenDAO {
  /** Store a token mapped to its owner's alias. */
  putAuthToken(authToken: AuthTokenDto, alias: string): Promise<void>;
  /** Return the alias that owns the token, or null if expired/missing. */
  getAuthTokenAlias(token: string): Promise<string | null>;
  deleteAuthToken(token: string): Promise<void>;
}
