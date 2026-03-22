import { UserDto } from "../domain/User";
import { TweeterResponse } from "./TweeterResponse";

export interface PagedUserItemResponse extends TweeterResponse {
  items: UserDto[] | null;
  hasMore: boolean;
}

export interface IsFollowerStatusResponse extends TweeterResponse {
  isFollower: boolean;
}

export interface FollowCountResponse extends TweeterResponse {
  count: number;
}

export interface FollowResponse extends TweeterResponse {
  followerCount: number;
  followeeCount: number;
}
