import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { StatusService } from "../service/StatusService";

const service = new StatusService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: PostStatusRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: PostStatusResponse = { success: false, message: "Auth token is required" };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.newStatus) {
      const response: PostStatusResponse = { success: false, message: "Status is required" };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.newStatus.post || req.newStatus.post.trim() === "") {
      const response: PostStatusResponse = { success: false, message: "Status post content is required" };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    await service.postStatus(req.authToken, req.newStatus);
    const response: PostStatusResponse = { success: true, message: null };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: PostStatusResponse = { success: false, message: (error as Error).message };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
