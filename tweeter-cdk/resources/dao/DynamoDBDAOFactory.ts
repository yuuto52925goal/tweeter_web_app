import { DAOFactory } from "./DAOFactory";
import { IAuthTokenDAO } from "./IAuthTokenDAO";
import { IFeedDAO } from "./IFeedDAO";
import { IFollowDAO } from "./IFollowDAO";
import { IS3DAO } from "./IS3DAO";
import { IStatusDAO } from "./IStatusDAO";
import { IUserDAO } from "./IUserDAO";
import { DynamoDBUserDAO } from "./dynamodb/DynamoDBUserDAO";
import { DynamoDBAuthTokenDAO } from "./dynamodb/DynamoDBAuthTokenDAO";
import { DynamoDBFollowDAO } from "./dynamodb/DynamoDBFollowDAO";
import { DynamoDBStatusDAO } from "./dynamodb/DynamoDBStatusDAO";
import { DynamoDBFeedDAO } from "./dynamodb/DynamoDBFeedDAO";
import { S3DAOImpl } from "./dynamodb/S3DAOImpl";

export class DynamoDBDAOFactory implements DAOFactory {
  getUserDAO(): IUserDAO {
    return new DynamoDBUserDAO();
  }

  getAuthTokenDAO(): IAuthTokenDAO {
    return new DynamoDBAuthTokenDAO();
  }

  getFollowDAO(): IFollowDAO {
    return new DynamoDBFollowDAO();
  }

  getStatusDAO(): IStatusDAO {
    return new DynamoDBStatusDAO();
  }

  getFeedDAO(): IFeedDAO {
    return new DynamoDBFeedDAO();
  }

  getS3DAO(): IS3DAO {
    return new S3DAOImpl();
  }
}
