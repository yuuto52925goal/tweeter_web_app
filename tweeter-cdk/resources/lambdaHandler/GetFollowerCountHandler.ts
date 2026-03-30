import { FollowCountRequest, FollowCountResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";

const service = new FollowService(getDAOFactory());

export const handler = async (event: any): Promise<any> => {
  try {
    const req: FollowCountRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: FollowCountResponse = { success: false, message: "Auth token is required", count: 0 };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.targetUser) {
      const response: FollowCountResponse = { success: false, message: "Target user is required", count: 0 };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const count = await service.getFollowerCount(req.authToken, req.targetUser);
    const response: FollowCountResponse = { success: true, message: null, count };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: FollowCountResponse = { success: false, message: (error as Error).message, count: 0 };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
