import { WebClient, LogLevel } from "@slack/web-api";

export class SlackClient {
  private web: WebClient;
  private allowedChannels: Set<string>;

  constructor(token: string, allowedChannels: string[]) {
    this.web = new WebClient(token, { logLevel: LogLevel.ERROR });
    this.allowedChannels = new Set(allowedChannels);
  }

  get sdk(): WebClient {
    return this.web;
  }

  isChannelAllowed(channelIdOrName: string): boolean {
    return this.allowedChannels.has(channelIdOrName);
  }

  listAllowedChannels(): string[] {
    return Array.from(this.allowedChannels);
  }
}
