export interface IFollowDAO {
  putFollow(followerAlias: string, followeeAlias: string): Promise<void>;
  deleteFollow(followerAlias: string, followeeAlias: string): Promise<void>;
  isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;

  /** Paginated list of aliases that follow followeeAlias. */
  getFollowerAliases(
    followeeAlias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]>;

  /** Paginated list of aliases that followerAlias follows. */
  getFolloweeAliases(
    followerAlias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]>;

  getFollowerCount(followeeAlias: string): Promise<number>;
  getFolloweeCount(followerAlias: string): Promise<number>;

  /** All follower aliases — used for feed fan-out on postStatus. */
  getAllFollowerAliases(followeeAlias: string): Promise<string[]>;
}
