import { StatusDto } from "tweeter-shared";

export interface IStatusDAO {
  putStatus(status: StatusDto): Promise<void>;

  /** Paginated list of statuses for a user's story, newest first. */
  getPageOfStatuses(
    senderAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[StatusDto[], boolean]>;
}
