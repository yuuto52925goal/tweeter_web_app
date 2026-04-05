/**
 * Queue 2 handler — triggered by the UpdateFeedQueue.
 *
 * Receives a message { status, followerAliases } (up to 100 aliases) and
 * batch-writes feed items to DynamoDB for each follower.
 */
import { SQSEvent } from "aws-lambda";
import { StatusDto } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { StatusService } from "../service/StatusService";

const service = new StatusService(getDAOFactory());

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const { status, followerAliases } = JSON.parse(record.body) as {
      status: StatusDto;
      followerAliases: string[];
    };
    await service.updateFeedForFollowers(status, followerAliases);
  }
};
