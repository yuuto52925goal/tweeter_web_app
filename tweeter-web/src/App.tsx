import "./App.css";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
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

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const renderStatusItem = (item: Status, path: string) => (
      <StatusItem item={item} featurePath={path} />
  )

  const renderUserItem = (item: User, path: string) => (
    <div className="row mb-3 mx-0 px-0 border rounded bg-white">
      <UserItem user={item} featurePath={path} />
    </div>
  )

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
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller<Status, StatusService>
              key={`story-${displayedUser!.alias}`}
              itemDescription="story"
              presenterFactory={(view) => new StoryPresenter(view)}
              renderItem={(item: Status) => renderStatusItem(item, '/story')}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller<User, FollowService>
              key={`followees-${displayedUser!.alias}`}
              itemDescription="followees"
              presenterFactory={(view) => new FolloweePresenter(view)}
              renderItem={(item: User) => renderUserItem(item, "/followees")}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller<User, FollowService>
              key={`followers-${displayedUser!.alias}`}
              itemDescription="followers"
              presenterFactory={(view) => new FollowerPresenter(view)}
              renderItem={(item: User) => renderUserItem(item, "/followers")}
            />
          }
        />
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
