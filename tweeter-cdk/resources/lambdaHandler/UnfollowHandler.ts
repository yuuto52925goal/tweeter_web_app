import { UnfollowRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../service/FollowService";

const service = new FollowService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: UnfollowRequest = JSON.parse(event.body);
    const [followerCount, followeeCount] = await service.unfollow(req.authToken, req.userToUnfollow);
    const response: FollowResponse = { success: true, message: null, followerCount, followeeCount };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: FollowResponse = { success: false, message: (error as Error).message, followerCount: 0, followeeCount: 0 };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
