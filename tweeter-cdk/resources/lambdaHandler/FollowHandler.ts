import { FollowRequest, FollowResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";
import { makeHandler } from "./HandlerUtils";

const service = new FollowService(getDAOFactory());
const err = (message: string): FollowResponse => ({ success: false, message, followerCount: 0, followeeCount: 0 });

export const handler = makeHandler<FollowRequest, FollowResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.userToFollow) return "User to follow is required";
    return null;
  },
  async (req) => {
    const [followerCount, followeeCount] = await service.follow(req.authToken, req.userToFollow);
    return { success: true, message: null, followerCount, followeeCount };
  }
);
