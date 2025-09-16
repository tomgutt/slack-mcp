import type { SlackClient } from "../slack/client.js";
export declare function listChannelsTool(slack: SlackClient): Promise<{
    channels: string[];
}>;
