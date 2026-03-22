import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { UserService } from "../service/UserService";

const service = new UserService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: GetUserRequest = JSON.parse(event.body);

    if (!req.authToken) {
      const response: GetUserResponse = { success: false, message: "Auth token is required", user: null };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.alias || req.alias.trim() === "") {
      const response: GetUserResponse = { success: false, message: "Alias is required", user: null };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const user = await service.getUser(req.authToken, req.alias);
    const response: GetUserResponse = { success: true, message: null, user };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: GetUserResponse = { success: false, message: (error as Error).message, user: null };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
