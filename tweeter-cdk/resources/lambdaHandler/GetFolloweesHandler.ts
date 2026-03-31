import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";
import { makeHandler } from "./HandlerUtils";

const service = new FollowService(getDAOFactory());
const err = (message: string): PagedUserItemResponse => ({ success: false, message, items: null, hasMore: false });

export const handler = makeHandler<PagedUserItemRequest, PagedUserItemResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.userAlias?.trim()) return "User alias is required";
    if (!req.pageSize || req.pageSize <= 0) return "Page size must be greater than 0";
    return null;
  },
  async (req) => {
    const [items, hasMore] = await service.getFollowees(req.authToken, req.userAlias, req.pageSize, req.lastItem);
    return { success: true, message: null, items, hasMore };
  }
);
