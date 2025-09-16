export async function listChannelsTool(slack) {
    return { channels: slack.listAllowedChannels() };
}
