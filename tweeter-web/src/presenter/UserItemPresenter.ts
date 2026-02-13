import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";

export interface UserItemView{
  addItems: (newItems: User[]) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class UserItemPresenter {
  private _view: UserItemView;
  private _hasMoreItems: boolean = true;
  private _lastItem: User | null = null;
  private userService: UserService;

  protected constructor(view: UserItemView){
    this._view = view;
    this.userService = new UserService();
  }

  public get view(): UserItemView {
    return this._view;
  }

  reset() {
    this._hasMoreItems = true;
    this._lastItem = null;
  }

  public get hasMoreItems(): boolean {
    return this._hasMoreItems;
  }

  public get lastItem(): User | null {
    return this._lastItem;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected set lastItem(value: User | null) {
    this._lastItem = value;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;

  public async getUser (
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return await this.userService.getUser(authToken, alias);
  };
}