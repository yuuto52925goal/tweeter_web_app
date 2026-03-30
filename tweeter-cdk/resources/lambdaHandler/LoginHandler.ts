import { LoginRequest, AuthenticationResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { UserService } from "../service/UserService";

const service = new UserService(getDAOFactory());

export const handler = async (event: any): Promise<any> => {
  try {
    const req: LoginRequest = JSON.parse(event.body);

    if (!req.alias || req.alias.trim() === "") {
      const response: AuthenticationResponse = { success: false, message: "Alias is required", user: null, authToken: null };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }
    if (!req.password || req.password.trim() === "") {
      const response: AuthenticationResponse = { success: false, message: "Password is required", user: null, authToken: null };
      return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
    }

    const [user, authToken] = await service.login(req.alias, req.password);
    const response: AuthenticationResponse = { success: true, message: null, user, authToken };
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  } catch (error) {
    const response: AuthenticationResponse = { success: false, message: (error as Error).message, user: null, authToken: null };
    return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(response) };
  }
};
