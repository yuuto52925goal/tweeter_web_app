import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AuthToken, User } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useParams } from "react-router-dom";
import UserItem from "./UserItem";
import { UserItemPresenter, UserItemView } from "../../presenter/UserItemPresenter";

export const PAGE_SIZE = 10;

interface Props {
  itemDescription: string;
  presenterFactory: (view: UserItemView) => UserItemPresenter;
}

const UserItemScroller = ({ itemDescription, presenterFactory }: Props) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<User[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: UserItemView = {
    addItems: (newItems: User[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage,
  }

  const presenter = useRef<UserItemPresenter | null>(null);
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
          <div
            key={index}
            className="row mb-3 mx-0 px-0 border rounded bg-white"
          >
            <UserItem user={item} featurePath={`/${itemDescription}`} />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default UserItemScroller;
