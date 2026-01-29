import { AuthToken, FakeData, User } from "tweeter-shared";
import UserItemScroller from "../userItem/UserItemScroller";

const FolloweesScroller = () => {
  const loadMoreFollowees = async (
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastFollowee: User | null
  ): Promise<[User[], boolean]> => {
    // TODO: Replace with the result of calling server
    return FakeData.instance.getPageOfUsers(lastFollowee, pageSize, userAlias);
  };

  return (
    <UserItemScroller itemDescription="followees" loadItems={loadMoreFollowees} />
  );
};

export default FolloweesScroller;
