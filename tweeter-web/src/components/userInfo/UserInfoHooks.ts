import { useContext } from "react";
import { UserInfoContext, UserInfoActionsContext } from "./UserInfoContexts";
import { UserInfo } from "./UserInfo";

export const useUserInfo = (): UserInfo => {
  return useContext(UserInfoContext);
};

interface UserInfoActions {
  updateUserInfo: (
    currentUser: import("tweeter-shared").User,
    displayedUser: import("tweeter-shared").User | null,
    authToken: import("tweeter-shared").AuthToken,
    remember: boolean
  ) => void;
  clearUserInfo: () => void;
  setDisplayedUser: (user: import("tweeter-shared").User) => void;
}

export const useUserInfoActions = (): UserInfoActions => {
  return useContext(UserInfoActionsContext);
};
