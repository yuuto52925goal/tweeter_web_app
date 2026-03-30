import { UserDto } from "tweeter-shared";

export interface IUserDAO {
  putUser(user: UserDto, hashedPassword: string): Promise<void>;
  getUser(alias: string): Promise<UserDto | null>;
  getPasswordHash(alias: string): Promise<string | null>;
  getUsersByAliases(aliases: string[]): Promise<UserDto[]>;
}
