import { UnfollowRequest, FollowResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";
import { makeHandler } from "./HandlerUtils";

const service = new FollowService(getDAOFactory());
const err = (message: string): FollowResponse => ({ success: false, message, followerCount: 0, followeeCount: 0 });

export const handler = makeHandler<UnfollowRequest, FollowResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.userToUnfollow) return "User to unfollow is required";
    return null;
  },
  async (req) => {
    const [followerCount, followeeCount] = await service.unfollow(req.authToken, req.userToUnfollow);
    return { success: true, message: null, followerCount, followeeCount };
  }
);
