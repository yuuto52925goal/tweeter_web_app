import { LoginRequest, AuthenticationResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { UserService } from "../service/UserService";
import { makeHandler } from "./HandlerUtils";

const service = new UserService(getDAOFactory());
const err = (message: string): AuthenticationResponse => ({ success: false, message, user: null, authToken: null });

export const handler = makeHandler<LoginRequest, AuthenticationResponse>(
  err,
  (req) => {
    if (!req.alias?.trim()) return "Alias is required";
    if (!req.password?.trim()) return "Password is required";
    return null;
  },
  async (req) => {
    const [user, authToken] = await service.login(req.alias, req.password);
    return { success: true, message: null, user, authToken };
  }
);
