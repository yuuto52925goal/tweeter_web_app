import { AuthTokenDto, FakeData, Status, StatusDto } from "tweeter-shared";

export class StatusService {
  public async getFeedItems(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    const lastStatus = lastItem ? Status.fromDto(lastItem) : null;
    const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
    return [statuses.map((s) => s.toDto()), hasMore];
  }

  public async getStoryItems(
    authToken: AuthTokenDto,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    const lastStatus = lastItem ? Status.fromDto(lastItem) : null;
    const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(lastStatus, pageSize);
    return [statuses.map((s) => s.toDto()), hasMore];
  }

  public async postStatus(
    authToken: AuthTokenDto,
    newStatus: StatusDto
  ): Promise<void> {
    // No-op for now — just acknowledge
  }
}
