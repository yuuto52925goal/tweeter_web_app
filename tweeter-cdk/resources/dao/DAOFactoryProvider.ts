import { DAOFactory } from "./DAOFactory";
import { DynamoDBDAOFactory } from "./DynamoDBDAOFactory";

export function getDAOFactory(): DAOFactory {
  return new DynamoDBDAOFactory();
}
