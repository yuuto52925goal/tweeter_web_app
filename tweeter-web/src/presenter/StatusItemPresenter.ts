import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";

export interface StatusItemView {
  addItems: (newItems: Status[]) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class StatusItemPresenter {
  private _view: StatusItemView;
  private _hasMoreItems: boolean = true;
  private _lastItem: Status | null = null;
  private userService: UserService;

  protected constructor(view: StatusItemView) {
    this._view = view;
    this.userService = new UserService();
  }

  public get view(): StatusItemView {
    return this._view;
  }

  reset() {
    this._hasMoreItems = true;
    this._lastItem = null;
  }

  public get hasMoreItems(): boolean {
    return this._hasMoreItems;
  }

  public get lastItem(): Status | null {
    return this._lastItem;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected set lastItem(value: Status | null) {
    this._lastItem = value;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return await this.userService.getUser(authToken, alias);
  }
}
