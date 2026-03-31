import { IsFollowerStatusRequest, IsFollowerStatusResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";
import { makeHandler } from "./HandlerUtils";

const service = new FollowService(getDAOFactory());
const err = (message: string): IsFollowerStatusResponse => ({ success: false, message, isFollower: false });

export const handler = makeHandler<IsFollowerStatusRequest, IsFollowerStatusResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.user) return "User is required";
    if (!req.selectedUser) return "Selected user is required";
    return null;
  },
  async (req) => {
    const isFollower = await service.getIsFollowerStatus(req.authToken, req.user, req.selectedUser);
    return { success: true, message: null, isFollower };
  }
);
