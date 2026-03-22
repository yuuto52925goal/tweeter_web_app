import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../service/FollowService";

const service = new FollowService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: PagedUserItemRequest = JSON.parse(event.body);
    const [items, hasMore] = await service.getFollowees(
      req.authToken, req.userAlias, req.pageSize, req.lastItem
    );
    const response: PagedUserItemResponse = { success: true, message: null, items, hasMore };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: PagedUserItemResponse = { success: false, message: (error as Error).message, items: null, hasMore: false };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
