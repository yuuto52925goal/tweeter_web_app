import { TweeterRequest, TweeterResponse } from "tweeter-shared";

export class ClientCommunicator {
  private SERVER_URL: string;

  public constructor(SERVER_URL: string) {
    this.SERVER_URL = SERVER_URL;
  }

  public async doPost<REQ extends TweeterRequest, RES extends TweeterResponse>(
    req: REQ | undefined,
    endpoint: string,
    headers?: Headers
  ): Promise<RES> {
    if (headers && req) {
      headers.append("Content-type", "application/json");
    } else if (req) {
      headers = new Headers({ "Content-type": "application/json" });
    }

    const url = this.SERVER_URL + endpoint;
    const params: RequestInit = {
      method: "POST",
      headers,
      body: req ? JSON.stringify(req) : undefined,
    };

    try {
      const resp: Response = await fetch(url, params);
      if (resp.ok) {
        const response: RES = await resp.json();
        return response;
      } else {
        const error = await resp.json();
        throw new Error(error.message ?? error.errorMessage ?? "Request failed");
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        `Client communicator POST failed:\n${(error as Error).message}`
      );
    }
  }
}
