import type { SlackClient } from "../slack/client.js";
export type GetMessageDetailsParams = {
    channel: string;
    ts: string;
    includeThread?: boolean;
};
export declare function getMessageDetailsTool(slack: SlackClient, params: GetMessageDetailsParams): Promise<{
    text: any;
    user: any;
    ts: any;
    blocks: any;
    files: any;
}>;
