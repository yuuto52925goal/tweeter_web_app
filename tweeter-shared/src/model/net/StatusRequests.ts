import { AuthTokenDto } from "../domain/AuthToken";
import { StatusDto } from "../domain/Status";
import { TweeterRequest } from "./TweeterRequest";

export interface PagedStatusItemRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  userAlias: string;
  pageSize: number;
  lastItem: StatusDto | null;
}

export interface PostStatusRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  newStatus: StatusDto;
}
