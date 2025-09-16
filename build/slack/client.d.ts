import { WebClient } from "@slack/web-api";
export declare class SlackClient {
    private web;
    private allowedChannels;
    constructor(token: string, allowedChannels: string[]);
    get sdk(): WebClient;
    isChannelAllowed(channelIdOrName: string): boolean;
    listAllowedChannels(): string[];
}
