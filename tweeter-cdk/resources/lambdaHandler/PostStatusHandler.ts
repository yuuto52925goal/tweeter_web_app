import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { StatusService } from "../service/StatusService";
import { makeHandler } from "./HandlerUtils";

const service = new StatusService(getDAOFactory());
const err = (message: string): PostStatusResponse => ({ success: false, message });

export const handler = makeHandler<PostStatusRequest, PostStatusResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.newStatus) return "Status is required";
    if (!req.newStatus.post?.trim()) return "Status post content is required";
    return null;
  },
  async (req) => {
    await service.postStatus(req.authToken, req.newStatus);
    return { success: true, message: null };
  }
);
