import { LogoutRequest, LogoutResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { UserService } from "../service/UserService";
import { makeHandler } from "./HandlerUtils";

const service = new UserService(getDAOFactory());
const err = (message: string): LogoutResponse => ({ success: false, message });

export const handler = makeHandler<LogoutRequest, LogoutResponse>(
  err,
  (req) => (!req.authToken ? "Auth token is required" : null),
  async (req) => {
    await service.logout(req.authToken);
    return { success: true, message: null };
  }
);
