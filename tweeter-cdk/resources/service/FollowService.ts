import { AuthTokenDto, FakeData, User, UserDto } from "tweeter-shared";

export class FollowService {
  public async getFollowers(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    const lastUser = lastItem ? User.fromDto(lastItem) : null;
    const [users, hasMore] = FakeData.instance.getPageOfUsers(lastUser, pageSize, userAlias);
    return [users.map((u) => u.toDto()), hasMore];
  }

  public async getFollowees(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    const lastUser = lastItem ? User.fromDto(lastItem) : null;
    const [users, hasMore] = FakeData.instance.getPageOfUsers(lastUser, pageSize, userAlias);
    return [users.map((u) => u.toDto()), hasMore];
  }

  public async getIsFollowerStatus(
    authToken: AuthTokenDto,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    return FakeData.instance.isFollower();
  }

  public async getFollowerCount(
    authToken: AuthTokenDto,
    targetUser: UserDto
  ): Promise<number> {
    return FakeData.instance.getFollowerCount(targetUser.alias) as number;
  }

  public async getFolloweeCount(
    authToken: AuthTokenDto,
    targetUser: UserDto
  ): Promise<number> {
    return FakeData.instance.getFolloweeCount(targetUser.alias) as number;
  }

  public async follow(
    authToken: AuthTokenDto,
    userToFollow: UserDto
  ): Promise<[number, number]> {
    const followerCount = await this.getFollowerCount(authToken, userToFollow);
    const followeeCount = await this.getFolloweeCount(authToken, userToFollow);
    return [followerCount, followeeCount];
  }

  public async unfollow(
    authToken: AuthTokenDto,
    userToUnfollow: UserDto
  ): Promise<[number, number]> {
    const followerCount = await this.getFollowerCount(authToken, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(authToken, userToUnfollow);
    return [followerCount, followeeCount];
  }
}
