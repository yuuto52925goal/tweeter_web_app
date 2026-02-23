import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";
import { Presenter } from "./Presenter";
import { PageItemPresenter, PageItemView } from "./PageItemPresenter";

export abstract class UserItemPresenter extends PageItemPresenter<User> {
  
}