import { LoginRequest, AuthenticationResponse } from "tweeter-shared";
import { UserService } from "../service/UserService";

const service = new UserService();

export const handler = async (event: any): Promise<any> => {
  try {
    const req: LoginRequest = JSON.parse(event.body);
    const [user, authToken] = await service.login(req.alias, req.password);
    const response: AuthenticationResponse = { success: true, message: null, user, authToken };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: AuthenticationResponse = { success: false, message: (error as Error).message, user: null, authToken: null };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
