export { Follow } from "./model/domain/Follow";
export { PostSegment, Type } from "./model/domain/PostSegment";
export { Status } from "./model/domain/Status";
export type { StatusDto } from "./model/domain/Status";
export { User } from "./model/domain/User";
export type { UserDto } from "./model/domain/User";
export { AuthToken } from "./model/domain/AuthToken";
export type { AuthTokenDto } from "./model/domain/AuthToken";
export { FakeData } from "./util/FakeData";

// Net - base
export type { TweeterRequest } from "./model/net/TweeterRequest";
export type { TweeterResponse } from "./model/net/TweeterResponse";

// Net - user requests/responses
export type { LoginRequest, RegisterRequest, LogoutRequest, GetUserRequest } from "./model/net/UserRequests";
export type { AuthenticationResponse, LogoutResponse, GetUserResponse } from "./model/net/UserResponses";

// Net - follow requests/responses
export type { PagedUserItemRequest, IsFollowerStatusRequest, FollowCountRequest, FollowRequest, UnfollowRequest } from "./model/net/FollowRequests";
export type { PagedUserItemResponse, IsFollowerStatusResponse, FollowCountResponse, FollowResponse } from "./model/net/FollowResponses";

// Net - status requests/responses
export type { PagedStatusItemRequest, PostStatusRequest } from "./model/net/StatusRequests";
export type { PagedStatusItemResponse, PostStatusResponse } from "./model/net/StatusResponses";
