import { PagedStatusItemRequest, PagedStatusItemResponse } from "tweeter-shared";
import { StatusService } from "../service/StatusService";

const service = new StatusService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: PagedStatusItemRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: PagedStatusItemResponse = { success: false, message: "Auth token is required", items: null, hasMore: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.userAlias || req.userAlias.trim() === "") {
      const response: PagedStatusItemResponse = { success: false, message: "User alias is required", items: null, hasMore: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.pageSize || req.pageSize <= 0) {
      const response: PagedStatusItemResponse = { success: false, message: "Page size must be greater than 0", items: null, hasMore: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const [items, hasMore] = await service.getStoryItems(req.authToken, req.userAlias, req.pageSize, req.lastItem);
    const response: PagedStatusItemResponse = { success: true, message: null, items, hasMore };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: PagedStatusItemResponse = { success: false, message: (error as Error).message, items: null, hasMore: false };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
