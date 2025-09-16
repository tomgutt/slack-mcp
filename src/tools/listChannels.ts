import type { SlackClient } from "../slack/client.js";

export async function listChannelsTool(slack: SlackClient) {
  return { channels: slack.listAllowedChannels() };
}
