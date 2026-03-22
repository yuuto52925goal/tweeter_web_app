import { PagedStatusItemRequest, PagedStatusItemResponse } from "tweeter-shared";
import { StatusService } from "../service/StatusService";

const service = new StatusService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: PagedStatusItemRequest = JSON.parse(event.body);
    const [items, hasMore] = await service.getStoryItems(
      req.authToken, req.userAlias, req.pageSize, req.lastItem
    );
    const response: PagedStatusItemResponse = { success: true, message: null, items, hasMore };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: PagedStatusItemResponse = { success: false, message: (error as Error).message, items: null, hasMore: false };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
