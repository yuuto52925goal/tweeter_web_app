import { IsFollowerStatusRequest, IsFollowerStatusResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { FollowService } from "../service/FollowService";

const service = new FollowService(getDAOFactory());

export const handler = async (event: any): Promise<any> => {
  try {
    const req: IsFollowerStatusRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: IsFollowerStatusResponse = { success: false, message: "Auth token is required", isFollower: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.user) {
      const response: IsFollowerStatusResponse = { success: false, message: "User is required", isFollower: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.selectedUser) {
      const response: IsFollowerStatusResponse = { success: false, message: "Selected user is required", isFollower: false };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const isFollower = await service.getIsFollowerStatus(req.authToken, req.user, req.selectedUser);
    const response: IsFollowerStatusResponse = { success: true, message: null, isFollower };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: IsFollowerStatusResponse = { success: false, message: (error as Error).message, isFollower: false };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
