import {
  AuthToken,
  AuthTokenDto,
  AuthenticationResponse,
  FollowCountRequest,
  FollowCountResponse,
  FollowRequest,
  FollowResponse,
  GetUserRequest,
  GetUserResponse,
  IsFollowerStatusRequest,
  IsFollowerStatusResponse,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  PostStatusRequest,
  PostStatusResponse,
  RegisterRequest,
  Status,
  StatusDto,
  UnfollowRequest,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL =
    "https://jqeka2k6w0.execute-api.us-east-1.amazonaws.com/prod";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  // --- User ---

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const req: LoginRequest = { alias, password };
    const resp = await this.clientCommunicator.doPost<
      LoginRequest,
      AuthenticationResponse
    >(req, "/user/login");
    return this.extractUserAndToken(resp, "login");
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const req: RegisterRequest = {
      firstName,
      lastName,
      alias,
      password,
      userImageBytes,
      imageFileExtension,
    };
    const resp = await this.clientCommunicator.doPost<
      RegisterRequest,
      AuthenticationResponse
    >(req, "/user/register");
    return this.extractUserAndToken(resp, "register");
  }

  public async logout(authToken: AuthToken): Promise<void> {
    const req: LogoutRequest = { authToken: authToken.toDto() };
    const resp = await this.clientCommunicator.doPost<
      LogoutRequest,
      LogoutResponse
    >(req, "/user/logout");
    if (!resp.success) throw new Error(resp.message ?? "Logout failed");
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    const req: GetUserRequest = { authToken: authToken.toDto(), alias };
    const resp = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(req, "/user/get");
    if (!resp.success) throw new Error(resp.message ?? "Get user failed");
    return resp.user ? User.fromDto(resp.user) : null;
  }

  // --- Follow ---

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const resp = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follower/list");
    return this.extractPagedUsers(resp, "get followers");
  }

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const resp = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/followee/list");
    return this.extractPagedUsers(resp, "get followees");
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const req: IsFollowerStatusRequest = {
      authToken: authToken.toDto(),
      user: user.toDto(),
      selectedUser: selectedUser.toDto(),
    };
    const resp = await this.clientCommunicator.doPost<
      IsFollowerStatusRequest,
      IsFollowerStatusResponse
    >(req, "/follower/isfollower");
    if (!resp.success) throw new Error(resp.message ?? "Is follower check failed");
    return resp.isFollower;
  }

  public async getFollowerCount(
    authToken: AuthToken,
    targetUser: User
  ): Promise<number> {
    const req: FollowCountRequest = {
      authToken: authToken.toDto(),
      targetUser: targetUser.toDto(),
    };
    const resp = await this.clientCommunicator.doPost<
      FollowCountRequest,
      FollowCountResponse
    >(req, "/follower/count");
    if (!resp.success) throw new Error(resp.message ?? "Get follower count failed");
    return resp.count;
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    targetUser: User
  ): Promise<number> {
    const req: FollowCountRequest = {
      authToken: authToken.toDto(),
      targetUser: targetUser.toDto(),
    };
    const resp = await this.clientCommunicator.doPost<
      FollowCountRequest,
      FollowCountResponse
    >(req, "/followee/count");
    if (!resp.success) throw new Error(resp.message ?? "Get followee count failed");
    return resp.count;
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[number, number]> {
    const req: FollowRequest = {
      authToken: authToken.toDto(),
      userToFollow: userToFollow.toDto(),
    };
    const resp = await this.clientCommunicator.doPost<
      FollowRequest,
      FollowResponse
    >(req, "/follower/follow");
    if (!resp.success) throw new Error(resp.message ?? "Follow failed");
    return [resp.followerCount, resp.followeeCount];
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[number, number]> {
    const req: UnfollowRequest = {
      authToken: authToken.toDto(),
      userToUnfollow: userToUnfollow.toDto(),
    };
    const resp = await this.clientCommunicator.doPost<
      UnfollowRequest,
      FollowResponse
    >(req, "/follower/unfollow");
    if (!resp.success) throw new Error(resp.message ?? "Unfollow failed");
    return [resp.followerCount, resp.followeeCount];
  }

  // --- Status ---

  public async getMoreFeedItems(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const resp = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/feed/list");
    return this.extractPagedStatuses(resp, "get feed items");
  }

  public async getMoreStoryItems(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const resp = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/story/list");
    return this.extractPagedStatuses(resp, "get story items");
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    const req: PostStatusRequest = {
      authToken: authToken.toDto(),
      newStatus: newStatus.toDto(),
    };
    const resp = await this.clientCommunicator.doPost<
      PostStatusRequest,
      PostStatusResponse
    >(req, "/status/post");
    if (!resp.success) throw new Error(resp.message ?? "Post status failed");
  }

  // --- Helpers ---

  private extractUserAndToken(
    resp: AuthenticationResponse,
    operation: string
  ): [User, AuthToken] {
    if (!resp.success || !resp.user || !resp.authToken) {
      throw new Error(resp.message ?? `${operation} failed`);
    }
    const user = User.fromDto(resp.user);
    const authToken = AuthToken.fromDto(resp.authToken);
    if (!user || !authToken) throw new Error(`${operation} returned invalid data`);
    return [user, authToken];
  }

  private extractPagedUsers(
    resp: PagedUserItemResponse,
    operation: string
  ): [User[], boolean] {
    if (!resp.success) throw new Error(resp.message ?? `${operation} failed`);
    const items = resp.items
      ? resp.items.map((dto: UserDto) => User.fromDto(dto) as User)
      : [];
    return [items, resp.hasMore];
  }

  private extractPagedStatuses(
    resp: PagedStatusItemResponse,
    operation: string
  ): [Status[], boolean] {
    if (!resp.success) throw new Error(resp.message ?? `${operation} failed`);
    const items = resp.items
      ? resp.items.map((dto: StatusDto) => Status.fromDto(dto) as Status)
      : [];
    return [items, resp.hasMore];
  }
}
