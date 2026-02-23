import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";
import { Presenter, PresenterView } from "./Presenter";
import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";

export interface PageItemView<T> extends PresenterView{
  addItems: (newItems: T[]) => void;
}

export abstract class PageItemPresenter<T> extends Presenter<PageItemView<T>> {
  private _hasMoreItems: boolean = true;
  private _lastItem: T | null = null;
  private userService: UserService = new UserService();

  reset() {
    this._hasMoreItems = true;
    this._lastItem = null;
  }

  public get hasMoreItems(): boolean {
    return this._hasMoreItems;
  }

  public get lastItem(): T | null {
    return this._lastItem;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected set lastItem(value: T | null) {
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
