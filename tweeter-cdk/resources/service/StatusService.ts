import { AuthTokenDto, StatusDto } from "tweeter-shared";
import { DAOFactory } from "../dao/DAOFactory";
import { IFeedDAO } from "../dao/IFeedDAO";
import { IFollowDAO } from "../dao/IFollowDAO";
import { IStatusDAO } from "../dao/IStatusDAO";
import { BaseService } from "./BaseService";

export class StatusService extends BaseService {
  private readonly statusDAO: IStatusDAO;
  private readonly feedDAO: IFeedDAO;
  private readonly followDAO: IFollowDAO;

  constructor(factory: DAOFactory) {
    super(factory);
    this.statusDAO = factory.getStatusDAO();
    this.feedDAO = factory.getFeedDAO();
    this.followDAO = factory.getFollowDAO();
  }

  async getFeedItems(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    await this.authService.validateAuthToken(authToken);
    return this.feedDAO.getPageOfFeedItems(userAlias, pageSize, lastItem?.timestamp ?? null);
  }

  async getStoryItems(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    await this.authService.validateAuthToken(authToken);
    return this.statusDAO.getPageOfStatuses(userAlias, pageSize, lastItem?.timestamp ?? null);
  }

  async postStatus(authToken: AuthTokenDto, newStatus: StatusDto): Promise<void> {
    const alias = await this.authService.validateAuthToken(authToken);
    const status: StatusDto = { ...newStatus, user: { ...newStatus.user, alias } };

    await this.statusDAO.putStatus(status);

    const followerAliases = await this.followDAO.getAllFollowerAliases(alias);
    if (followerAliases.length > 0) {
      await this.feedDAO.putFeedItems(followerAliases, status);
    }
  }
}
