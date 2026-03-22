import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { StatusService } from "../service/StatusService";

const service = new StatusService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: PostStatusRequest = JSON.parse(event.body);
    await service.postStatus(req.authToken, req.newStatus);
    const response: PostStatusResponse = { success: true, message: null };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: PostStatusResponse = { success: false, message: (error as Error).message };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
