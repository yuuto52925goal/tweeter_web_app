import { AuthTokenDto } from "../domain/AuthToken";
import { UserDto } from "../domain/User";
import { TweeterRequest } from "./TweeterRequest";

export interface PagedUserItemRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  userAlias: string;
  pageSize: number;
  lastItem: UserDto | null;
}

export interface IsFollowerStatusRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  user: UserDto;
  selectedUser: UserDto;
}

export interface FollowCountRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  targetUser: UserDto;
}

export interface FollowRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  userToFollow: UserDto;
}

export interface UnfollowRequest extends TweeterRequest {
  authToken: AuthTokenDto;
  userToUnfollow: UserDto;
}
