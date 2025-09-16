import type { SlackClient } from "../slack/client";

export async function listChannelsTool(slack: SlackClient) {
  return { channels: slack.listAllowedChannels() };
}
