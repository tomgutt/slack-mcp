import type { SlackClient } from "../slack/client.js";
export type SearchMessagesParams = {
    query: string;
    includeThreads?: boolean;
    pageLimit?: number;
    channels?: string[];
};
export declare function searchMessagesTool(slack: SlackClient, params: SearchMessagesParams): Promise<{
    items: any[];
}>;
