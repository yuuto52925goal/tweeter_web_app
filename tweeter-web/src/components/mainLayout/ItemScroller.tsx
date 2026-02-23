import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthToken, User } from "tweeter-shared";
import { useParams } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { PageItemPresenter, PageItemView } from "../../presenter/pageItem/PageItemPresenter";
import React from "react";
import { Service } from "../../model.service/Service";

export interface ItemScrollerProps<T, U extends Service> {
  itemDescription: string;
  presenterFactory: (view: PageItemView<T>) => PageItemPresenter<T, U>;
  renderItem: (item: T, index: number) => ReactNode;
}

export default function ItemScroller<T, U extends Service>({
  itemDescription,
  presenterFactory,
  renderItem,
}: ItemScrollerProps<T, U>) {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PageItemView<T> = {
    addItems: (newItems: T[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage,
  };

  const presenter = useRef<PageItemPresenter<T, U> | null>(null);
  if (!presenter.current) {
    presenter.current = presenterFactory(listener);
  }

  const getUser = useCallback(
    async (token: AuthToken, alias: string): Promise<User | null> => {
      return await presenter.current!.getUser(token, alias);
    },
    []
  );

  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam !== displayedUser!.alias
    ) {
      getUser(authToken, displayedUserAliasParam).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [authToken, displayedUser, displayedUserAliasParam, getUser, setDisplayedUser]);

  const reset = useCallback(() => {
    setItems([]);
    presenter.current!.reset();
  }, []);

  const loadMoreItems = useCallback(() => {
    presenter.current!.loadMoreItems(authToken!, displayedUser!.alias);
  }, [authToken, displayedUser]);

  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser, loadMoreItems, reset]);

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={() => loadMoreItems()}
        hasMore={presenter.current!.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))}
      </InfiniteScroll>
    </div>
  );
}