/**
 * Queue 1 handler — triggered by the PostStatusQueue.
 *
 * Receives a message { status, senderAlias }, fetches all follower aliases
 * from DynamoDB, and enqueues one UpdateFeedQueue message per batch of 100
 * followers so they can be processed in parallel by UpdateFeedQueueHandler.
 */
import { SQSEvent } from "aws-lambda";
import { StatusDto } from "tweeter-shared";
import { getDAOFactory } from "../dao/DAOFactoryProvider";
import { StatusService } from "../service/StatusService";

const service = new StatusService(getDAOFactory());

export const handler = async (event: SQSEvent): Promise<void> => {
  const updateFeedQueueUrl = process.env.UPDATE_FEED_QUEUE_URL!;

  for (const record of event.Records) {
    const { status, senderAlias } = JSON.parse(record.body) as {
      status: StatusDto;
      senderAlias: string;
    };
    await service.fanOutStatusToFollowers(status, senderAlias, updateFeedQueueUrl);
  }
};
