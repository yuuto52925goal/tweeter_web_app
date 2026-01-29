import { AuthToken, FakeData, User } from "tweeter-shared";
import UserItemScroller from "../userItem/UserItemScroller";

const FollowersScroller = () => {
  const loadMoreFollowers = async (
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastFollower: User | null
  ): Promise<[User[], boolean]> => {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getPageOfUsers(lastFollower, pageSize, userAlias);
  };

  return (
    <UserItemScroller itemDescription="followers" loadItems={loadMoreFollowers} />
  );
};

export default FollowersScroller;
