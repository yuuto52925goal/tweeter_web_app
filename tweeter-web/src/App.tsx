import "./App.css";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useOutletContext,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout, { MainLayoutContext } from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import ItemScroller from "./components/mainLayout/ItemScroller";
import StatusItem from "./components/statusItem/StatusItem";
import UserItem from "./components/userItem/UserItem";
import { FolloweePresenter } from "./presenter/pageItem/userItem/each/FolloweePresenter";
import { FollowerPresenter } from "./presenter/pageItem/userItem/each/FollowerPresenter";
import { FeedPresenter } from "./presenter/pageItem/status/each/FeedPresenter";
import { StoryPresenter } from "./presenter/pageItem/status/each/StoryPresenter";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { User } from "tweeter-shared/dist/model/domain/User";
import { StatusService } from "./model.service/StatusService";
import { FollowService } from "./model.service/FollowService";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

// Route wrappers that read MainLayout's Outlet context and include the
// relevant counter in the ItemScroller key so it remounts on change.

const StoryRoute = () => {
  const { statusPostedAt } = useOutletContext<MainLayoutContext>();
  const { displayedUser } = useUserInfo();
  return (
    <ItemScroller<Status, StatusService>
      key={`story-${displayedUser!.alias}-${statusPostedAt}`}
      itemDescription="story"
      presenterFactory={(view) => new StoryPresenter(view)}
      renderItem={(item: Status) => <StatusItem item={item} featurePath="/story" />}
    />
  );
};

const FollowersRoute = () => {
  const { followChangedAt } = useOutletContext<MainLayoutContext>();
  const { displayedUser } = useUserInfo();
  return (
    <ItemScroller<User, FollowService>
      key={`followers-${displayedUser!.alias}-${followChangedAt}`}
      itemDescription="followers"
      presenterFactory={(view) => new FollowerPresenter(view)}
      renderItem={(item: User) => (
        <div className="row mb-3 mx-0 px-0 border rounded bg-white">
          <UserItem user={item} featurePath="/followers" />
        </div>
      )}
    />
  );
};

const FolloweesRoute = () => {
  const { followChangedAt } = useOutletContext<MainLayoutContext>();
  const { displayedUser } = useUserInfo();
  return (
    <ItemScroller<User, FollowService>
      key={`followees-${displayedUser!.alias}-${followChangedAt}`}
      itemDescription="followees"
      presenterFactory={(view) => new FolloweePresenter(view)}
      renderItem={(item: User) => (
        <div className="row mb-3 mx-0 px-0 border rounded bg-white">
          <UserItem user={item} featurePath="/followees" />
        </div>
      )}
    />
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const renderStatusItem = (item: Status, path: string) => (
    <StatusItem item={item} featurePath={path} />
  );

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller<Status, StatusService>
              key={`feed-${displayedUser!.alias}`}
              itemDescription="feed"
              presenterFactory={(view) => new FeedPresenter(view)}
              renderItem={(item: Status) => renderStatusItem(item, "/feed")}
            />
          }
        />
        <Route path="story/:displayedUser" element={<StoryRoute />} />
        <Route path="followees/:displayedUser" element={<FolloweesRoute />} />
        <Route path="followers/:displayedUser" element={<FollowersRoute />} />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
