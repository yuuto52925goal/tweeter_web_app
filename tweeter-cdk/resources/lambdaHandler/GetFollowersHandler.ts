import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../service/FollowService";

const service = new FollowService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: PagedUserItemRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: PagedUserItemResponse = { success: false, message: "Auth token is required", items: null, hasMore: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.userAlias || req.userAlias.trim() === "") {
      const response: PagedUserItemResponse = { success: false, message: "User alias is required", items: null, hasMore: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.pageSize || req.pageSize <= 0) {
      const response: PagedUserItemResponse = { success: false, message: "Page size must be greater than 0", items: null, hasMore: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const [items, hasMore] = await service.getFollowers(req.authToken, req.userAlias, req.pageSize, req.lastItem);
    const response: PagedUserItemResponse = { success: true, message: null, items, hasMore };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: PagedUserItemResponse = { success: false, message: (error as Error).message, items: null, hasMore: false };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
