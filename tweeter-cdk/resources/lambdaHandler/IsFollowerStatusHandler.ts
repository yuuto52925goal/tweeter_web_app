import { IsFollowerStatusRequest, IsFollowerStatusResponse } from "tweeter-shared";
import { FollowService } from "../service/FollowService";

const service = new FollowService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: IsFollowerStatusRequest = JSON.parse(event.body);
    const isFollower = await service.getIsFollowerStatus(req.authToken, req.user, req.selectedUser);
    const response: IsFollowerStatusResponse = { success: true, message: null, isFollower };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: IsFollowerStatusResponse = { success: false, message: (error as Error).message, isFollower: false };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
