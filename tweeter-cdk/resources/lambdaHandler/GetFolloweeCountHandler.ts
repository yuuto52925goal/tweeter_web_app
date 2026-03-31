import { FollowCountRequest, FollowCountResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";
import { makeHandler } from "./HandlerUtils";

const service = new FollowService(getDAOFactory());
const err = (message: string): FollowCountResponse => ({ success: false, message, count: 0 });

export const handler = makeHandler<FollowCountRequest, FollowCountResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.targetUser) return "Target user is required";
    return null;
  },
  async (req) => {
    const count = await service.getFolloweeCount(req.authToken, req.targetUser);
    return { success: true, message: null, count };
  }
);
