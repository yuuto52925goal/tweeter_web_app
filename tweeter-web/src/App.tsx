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
import UserItemScroller from "./components/userItem/UserItemScroller";
import StatusItemScroller from "./components/statusItem/StatusItemScroller";
import { FolloweePresenter } from "./presenter/pageItem/userItem/each/FolloweePresenter";
import { FollowerPresenter } from "./presenter/pageItem/userItem/each/FollowerPresenter";
import { FeedPresenter } from "./presenter/pageItem/status/each/FeedPresenter";
import { StoryPresenter } from "./presenter/pageItem/status/each/StoryPresenter";

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

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route path="feed/:displayedUser" element={
          <StatusItemScroller
            key={`feed-${displayedUser!.alias}`}
            itemDescription="feed"
            presenterFactory={(view) => new FeedPresenter(view)}
          />
        } />
        <Route path="story/:displayedUser" element={
          <StatusItemScroller
            key={`story-${displayedUser!.alias}`}
            itemDescription="story"
            presenterFactory={(view) => new StoryPresenter(view)}
          />
        } />
        <Route path="followees/:displayedUser" element={
          <UserItemScroller
            key={`followees-${displayedUser!.alias}`}
            itemDescription="followees"
            presenterFactory={(view) => new FolloweePresenter(view)}
          />
        } />
        <Route path="followers/:displayedUser" element={
          <UserItemScroller
            key={`followers-${displayedUser!.alias}`}
            itemDescription="followers"
            presenterFactory={(view) => new FollowerPresenter(view)}
          />
        } />
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
