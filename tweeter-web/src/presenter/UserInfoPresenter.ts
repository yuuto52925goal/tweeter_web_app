import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView{
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView>{
  private followService: FollowService;

  public constructor(view: UserInfoView) {
    super(view)
    this.followService = new FollowService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(authToken, currentUser, displayedUser)
        );
      }
    }, "determine follower status")
  }

  public async setNumbFollowees(
    authToken: AuthToken,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      this.view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser)
      );
    }, "get followees count")
  }

  public async setNumbFollowers(
    authToken: AuthToken,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      this.view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser)
      );
    }, "get followers count")
  }

  public async followDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      const followingUserToast = this.view.displayInfoMessage(
        `Following ${displayedUser.name}...`,
        0
      );
      const [followerCount, followeeCount] = await this.followService.follow(
        authToken,
        displayedUser
      );
      this.view.setIsFollower(true);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
      this.view.deleteMessage(followingUserToast);
    }, "follow user", () => this.view.setIsLoading(false))
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      const unfollowingUserToast = this.view.displayInfoMessage(
        `Unfollowing ${displayedUser.name}...`,
        0
      );
      const [followerCount, followeeCount] = await this.followService.unfollow(
        authToken,
        displayedUser
      );
      this.view.setIsFollower(false);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
      this.view.deleteMessage(unfollowingUserToast);
    }, "unfollow user", () => this.view.setIsLoading(false))
  }
}
