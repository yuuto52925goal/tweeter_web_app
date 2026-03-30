import { IAuthTokenDAO } from "./IAuthTokenDAO";
import { IFeedDAO } from "./IFeedDAO";
import { IFollowDAO } from "./IFollowDAO";
import { IS3DAO } from "./IS3DAO";
import { IStatusDAO } from "./IStatusDAO";
import { IUserDAO } from "./IUserDAO";

export interface DAOFactory {
  getUserDAO(): IUserDAO;
  getAuthTokenDAO(): IAuthTokenDAO;
  getFollowDAO(): IFollowDAO;
  getStatusDAO(): IStatusDAO;
  getFeedDAO(): IFeedDAO;
  getS3DAO(): IS3DAO;
}
