import { RegisterRequest, AuthenticationResponse } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { UserService } from "../service/UserService";
import { makeHandler } from "./HandlerUtils";

const service = new UserService(getDAOFactory());
const err = (message: string): AuthenticationResponse => ({ success: false, message, user: null, authToken: null });

export const handler = makeHandler<RegisterRequest, AuthenticationResponse>(
  err,
  (req) => {
    if (!req.firstName?.trim()) return "First name is required";
    if (!req.lastName?.trim()) return "Last name is required";
    if (!req.alias?.trim()) return "Alias is required";
    if (!req.password?.trim()) return "Password is required";
    return null;
  },
  async (req) => {
    const [user, authToken] = await service.register(
      req.firstName, req.lastName, req.alias, req.password,
      req.userImageBytes, req.imageFileExtension
    );
    return { success: true, message: null, user, authToken };
  }
);
