import { DAOFactory } from "../dao/DAOFactory";
import { AuthorizationService } from "./AuthorizationService";

export abstract class BaseService {
  protected readonly factory: DAOFactory;
  protected readonly authService: AuthorizationService;

  constructor(factory: DAOFactory) {
    this.factory = factory;
    this.authService = new AuthorizationService(factory);
  }
}
