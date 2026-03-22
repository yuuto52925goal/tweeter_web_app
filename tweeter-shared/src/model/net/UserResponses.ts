import { AuthTokenDto } from "../domain/AuthToken";
import { UserDto } from "../domain/User";
import { TweeterResponse } from "./TweeterResponse";

export interface AuthenticationResponse extends TweeterResponse {
  user: UserDto | null;
  authToken: AuthTokenDto | null;
}

export interface LogoutResponse extends TweeterResponse {}

export interface GetUserResponse extends TweeterResponse {
  user: UserDto | null;
}
