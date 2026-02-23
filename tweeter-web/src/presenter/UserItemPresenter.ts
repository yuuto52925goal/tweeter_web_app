import { User } from "tweeter-shared/dist/model/domain/User";
import { PageItemPresenter, PageItemView } from "./PageItemPresenter";
import { FollowService } from "../model.service/FollowService";

export abstract class UserItemPresenter extends PageItemPresenter<User, FollowService> {
  protected serviceFactory(): FollowService {
    return new FollowService()
  }
}