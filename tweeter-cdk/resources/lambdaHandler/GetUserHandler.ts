import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { UserService } from "../service/UserService";
import { makeHandler } from "./HandlerUtils";

const service = new UserService(getDAOFactory());
const err = (message: string): GetUserResponse => ({ success: false, message, user: null });

export const handler = makeHandler<GetUserRequest, GetUserResponse>(
  err,
  (req) => {
    if (!req.authToken) return "Auth token is required";
    if (!req.alias?.trim()) return "Alias is required";
    return null;
  },
  async (req) => {
    const user = await service.getUser(req.authToken, req.alias);
    return { success: true, message: null, user };
  }
);
