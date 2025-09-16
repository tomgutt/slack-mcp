import { WebClient, LogLevel } from "@slack/web-api";
export class SlackClient {
    web;
    allowedChannels;
    constructor(token, allowedChannels) {
        this.web = new WebClient(token, { logLevel: LogLevel.ERROR });
        this.allowedChannels = new Set(allowedChannels);
    }
    get sdk() {
        return this.web;
    }
    isChannelAllowed(channelIdOrName) {
        return this.allowedChannels.has(channelIdOrName);
    }
    listAllowedChannels() {
        return Array.from(this.allowedChannels);
    }
}
