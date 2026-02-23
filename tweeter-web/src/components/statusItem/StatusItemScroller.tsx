import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthToken, Status, User } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useParams } from "react-router-dom";
import StatusItem from "./StatusItem";
import { StatusItemPresenter } from "../../presenter/pageItem/status/StatusItemPresenter";
import { PageItemView } from "../../presenter/pageItem/PageItemPresenter";

export const PAGE_SIZE = 10;

interface Props {
  itemDescription: string;
  presenterFactory: (view: PageItemView<Status>) => StatusItemPresenter;
}

const StatusItemScroller = ({ itemDescription, presenterFactory }: Props) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<Status[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PageItemView<Status> = {
    addItems: (newItems: Status[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage,
  }

  const presenter = useRef<StatusItemPresenter | null>(null);
  if (!presenter.current) {
    presenter.current = presenterFactory(listener);
  }

  const getUser = async (
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> => {
    return await presenter.current!.getUser(authToken, alias);
  };

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam != displayedUser!.alias
    ) {
      getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenter.current!.reset();
  };

  const loadMoreItems = async () => {
    presenter.current!.loadMoreItems(authToken!, displayedUser!.alias);
  };

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
          <StatusItem
            key={index}
            item={item}
            featurePath={`/${itemDescription}`}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default StatusItemScroller;
