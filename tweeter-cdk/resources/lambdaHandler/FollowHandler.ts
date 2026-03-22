import { FollowRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../service/FollowService";

const service = new FollowService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: FollowRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: FollowResponse = { success: false, message: "Auth token is required", followerCount: 0, followeeCount: 0 };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.userToFollow) {
      const response: FollowResponse = { success: false, message: "User to follow is required", followerCount: 0, followeeCount: 0 };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const [followerCount, followeeCount] = await service.follow(req.authToken, req.userToFollow);
    const response: FollowResponse = { success: true, message: null, followerCount, followeeCount };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: FollowResponse = { success: false, message: (error as Error).message, followerCount: 0, followeeCount: 0 };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
