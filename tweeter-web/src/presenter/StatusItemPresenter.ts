import { Status } from "tweeter-shared/dist/model/domain/Status";
import { PageItemPresenter, PageItemView } from "./PageItemPresenter";
import { StatusService } from "../model.service/StatusService";

export abstract class StatusItemPresenter extends PageItemPresenter<Status, StatusService> {
  protected serviceFactory(): StatusService {
      return new StatusService()
  }
}
