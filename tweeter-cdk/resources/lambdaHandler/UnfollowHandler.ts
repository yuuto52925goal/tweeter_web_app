import { UnfollowRequest, FollowResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";

const service = new FollowService(getDAOFactory());

export const handler = async (event: any): Promise<any> => {
  try {
    const req: UnfollowRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: FollowResponse = { success: false, message: "Auth token is required", followerCount: 0, followeeCount: 0 };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.userToUnfollow) {
      const response: FollowResponse = { success: false, message: "User to unfollow is required", followerCount: 0, followeeCount: 0 };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const [followerCount, followeeCount] = await service.unfollow(req.authToken, req.userToUnfollow);
    const response: FollowResponse = { success: true, message: null, followerCount, followeeCount };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: FollowResponse = { success: false, message: (error as Error).message, followerCount: 0, followeeCount: 0 };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
