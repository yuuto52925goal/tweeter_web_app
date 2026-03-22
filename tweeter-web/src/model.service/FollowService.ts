import { AuthToken, User } from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";
import { Service } from "./Service";

export class FollowService implements Service {
  private facade = new ServerFacade();

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.facade.getMoreFollowees({
      authToken: authToken.toDto(),
      userAlias,
      pageSize,
      lastItem: lastItem ? lastItem.toDto() : null,
    });
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    return this.facade.getMoreFollowers({
      authToken: authToken.toDto(),
      userAlias,
      pageSize,
      lastItem: lastItem ? lastItem.toDto() : null,
    });
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return this.facade.getIsFollowerStatus(authToken, user, selectedUser);
  }

  public async getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
    return this.facade.getFolloweeCount(authToken, user);
  }

  public async getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
    return this.facade.getFollowerCount(authToken, user);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.facade.follow(authToken, userToFollow);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.facade.unfollow(authToken, userToUnfollow);
  }
}
