import { AuthTokenDto, UserDto } from "tweeter-shared";
import { DAOFactory } from "../dao/DAOFactory";
import { IFollowDAO } from "../dao/IFollowDAO";
import { IUserDAO } from "../dao/IUserDAO";
import { BaseService } from "./BaseService";

export class FollowService extends BaseService {
  private readonly followDAO: IFollowDAO;
  private readonly userDAO: IUserDAO;

  constructor(factory: DAOFactory) {
    super(factory);
    this.followDAO = factory.getFollowDAO();
    this.userDAO = factory.getUserDAO();
  }

  async getFollowers(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authService.validateAuthToken(authToken);
    const [aliases, hasMore] = await this.followDAO.getFollowerAliases(
      userAlias, pageSize, lastItem?.alias ?? null
    );
    const users = await this.userDAO.getUsersByAliases(aliases);
    return [users, hasMore];
  }

  async getFollowees(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authService.validateAuthToken(authToken);
    const [aliases, hasMore] = await this.followDAO.getFolloweeAliases(
      userAlias, pageSize, lastItem?.alias ?? null
    );
    const users = await this.userDAO.getUsersByAliases(aliases);
    return [users, hasMore];
  }

  async getIsFollowerStatus(
    authToken: AuthTokenDto,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    await this.authService.validateAuthToken(authToken);
    return this.followDAO.isFollower(user.alias, selectedUser.alias);
  }

  async getFollowerCount(authToken: AuthTokenDto, targetUser: UserDto): Promise<number> {
    await this.authService.validateAuthToken(authToken);
    return this.followDAO.getFollowerCount(targetUser.alias);
  }

  async getFolloweeCount(authToken: AuthTokenDto, targetUser: UserDto): Promise<number> {
    await this.authService.validateAuthToken(authToken);
    return this.followDAO.getFolloweeCount(targetUser.alias);
  }

  async follow(authToken: AuthTokenDto, userToFollow: UserDto): Promise<[number, number]> {
    const followerAlias = await this.authService.validateAuthToken(authToken);
    await this.followDAO.putFollow(followerAlias, userToFollow.alias);
    const [followerCount, followeeCount] = await Promise.all([
      this.followDAO.getFollowerCount(userToFollow.alias),
      this.followDAO.getFolloweeCount(userToFollow.alias),
    ]);
    return [followerCount, followeeCount];
  }

  async unfollow(authToken: AuthTokenDto, userToUnfollow: UserDto): Promise<[number, number]> {
    const followerAlias = await this.authService.validateAuthToken(authToken);
    await this.followDAO.deleteFollow(followerAlias, userToUnfollow.alias);
    const [followerCount, followeeCount] = await Promise.all([
      this.followDAO.getFollowerCount(userToUnfollow.alias),
      this.followDAO.getFolloweeCount(userToUnfollow.alias),
    ]);
    return [followerCount, followeeCount];
  }
}
