import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AuthTokenDto, StatusDto } from "tweeter-shared";
import { DAOFactory } from "../dao/DAOFactory";
import { IFeedDAO } from "../dao/IFeedDAO";
import { IFollowDAO } from "../dao/IFollowDAO";
import { IStatusDAO } from "../dao/IStatusDAO";
import { BaseService } from "./BaseService";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

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

  /**
   * Writes to the story table immediately, then dispatches an SQS message for
   * async fan-out to all followers (so the author's POST returns in <1s).
   */
  async postStatus(authToken: AuthTokenDto, newStatus: StatusDto): Promise<void> {
    const alias = await this.authService.validateAuthToken(authToken);
    const status: StatusDto = { ...newStatus, user: { ...newStatus.user, alias } };

    // Write to story table synchronously
    await this.statusDAO.putStatus(status);

    // Kick off async fan-out via SQS
    const queueUrl = process.env.POST_STATUS_QUEUE_URL!;
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({ status, senderAlias: alias }),
      })
    );
  }

  /**
   * Called by the PostStatusQueueHandler to fan-out to all followers.
   * Splits follower aliases into batches and enqueues one UpdateFeedQueue
   * message per batch so Lambda can process them in parallel.
   */
  async fanOutStatusToFollowers(
    status: StatusDto,
    senderAlias: string,
    updateFeedQueueUrl: string
  ): Promise<void> {
    const followerAliases = await this.followDAO.getAllFollowerAliases(senderAlias);
    if (followerAliases.length === 0) return;

    const BATCH = 100; // followers per Queue-2 message
    for (let i = 0; i < followerAliases.length; i += BATCH) {
      const batch = followerAliases.slice(i, i + BATCH);
      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: updateFeedQueueUrl,
          MessageBody: JSON.stringify({ status, followerAliases: batch }),
        })
      );
    }
  }

  /**
   * Called by the UpdateFeedQueueHandler to write feed items for a batch
   * of follower aliases.
   */
  async updateFeedForFollowers(
    status: StatusDto,
    followerAliases: string[]
  ): Promise<void> {
    await this.feedDAO.putFeedItems(followerAliases, status);
  }
}
