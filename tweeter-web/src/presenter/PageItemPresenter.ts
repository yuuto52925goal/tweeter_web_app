import { User } from "tweeter-shared/dist/model/domain/User";
import { UserService } from "../model.service/UserService";
import { Presenter, PresenterView } from "./Presenter";
import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { Service } from "../model.service/Service";

export const PAGE_SIZE = 10;

export interface PageItemView<T> extends PresenterView{
  addItems: (newItems: T[]) => void;
}

export abstract class PageItemPresenter<T, U extends Service> extends Presenter<PageItemView<T>> {
  private _hasMoreItems: boolean = true;
  private _lastItem: T | null = null;
  private userService: UserService = new UserService();
  private _service: U;

  protected constructor(view: PageItemView<T>){
    super(view)
    this._service = this.serviceFactory()
  }

  reset() {
    this._hasMoreItems = true;
    this._lastItem = null;
  }

  protected get service(){
    return this._service
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

  public async getUser (
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return await this.userService.getUser(authToken, alias);
  };

  public async loadMoreItems (authToken: AuthToken, userAlias: string) {
    this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.getMoreItem(authToken, userAlias)
      this.hasMoreItems = hasMore;
      this.lastItem = newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, this.itemDescription());
  };

  protected abstract itemDescription(): string
  protected abstract serviceFactory(): U
  protected abstract getMoreItem(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>
}
