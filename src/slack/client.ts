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

// Check env variables
if (!process.env.SLACK_AUTH_BOT_TOKEN) {
  throw new Error("SLACK_AUTH_BOT_TOKEN environment variable is not set");
}
if (!process.env.SLACK_CHANNELS) {
  throw new Error("SLACK_CHANNELS environment variable is not set");
}

// Split channels by comma
const channels = process.env.SLACK_CHANNELS.split(",");

// Check if channel count is greater than 0
if (channels.length !> 0) {
  throw new Error("SLACK_CHANNELS must contain at least one channel");
}

export const slackClient = new SlackClient(process.env.SLACK_AUTH_BOT_TOKEN, channels);