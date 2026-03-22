import { StatusDto } from "../domain/Status";
import { TweeterResponse } from "./TweeterResponse";

export interface PagedStatusItemResponse extends TweeterResponse {
  items: StatusDto[] | null;
  hasMore: boolean;
}

export interface PostStatusResponse extends TweeterResponse {}
