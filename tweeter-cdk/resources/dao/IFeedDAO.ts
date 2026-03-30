import { StatusDto } from "tweeter-shared";

export interface IFeedDAO {
  /** Write a single feed item for one recipient. */
  putFeedItem(recipientAlias: string, status: StatusDto): Promise<void>;

  /** Batch-write feed items for many recipients (fan-out on postStatus). */
  putFeedItems(recipientAliases: string[], status: StatusDto): Promise<void>;

  /** Paginated list of feed items for a recipient, newest first. */
  getPageOfFeedItems(
    recipientAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[StatusDto[], boolean]>;
}
