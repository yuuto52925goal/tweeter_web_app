import { LogoutRequest, LogoutResponse } from "tweeter-shared";
import { UserService } from "../service/UserService";

const service = new UserService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: LogoutRequest = JSON.parse(event.body);
    await service.logout(req.authToken);
    const response: LogoutResponse = { success: true, message: null };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: LogoutResponse = { success: false, message: (error as Error).message };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
