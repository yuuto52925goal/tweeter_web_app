import { AuthTokenDto } from "../domain/AuthToken";
import { TweeterRequest } from "./TweeterRequest";

export interface LoginRequest extends TweeterRequest {
  alias: string;
  password: string;
}

export interface RegisterRequest extends TweeterRequest {
  firstName: string;
  lastName: string;
  alias: string;
  password: string;
  userImageBytes: string; // base64 encoded
  imageFileExtension: string;
}

export interface LogoutRequest extends TweeterRequest {
  authToken: AuthTokenDto;
}

export interface GetUserRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  alias: string;
}
