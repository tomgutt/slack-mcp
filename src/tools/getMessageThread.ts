import type { SlackClient } from "../slack/client.js";

export type GetMessageThreadParams = {
  channelId: string;
  ts: string;
  threadCount?: number;
};

export async function getMessageThreadTool(slack: SlackClient, params: GetMessageThreadParams) {
  const { channelId, ts } = params;
  if (!channelId || !ts) throw new Error("channelId and ts are required");
  const threadCount = params.threadCount ?? 50;

  const replies = await slack.sdk.conversations.replies({ channel: channelId, ts: ts, limit: threadCount });
  const originalMessage = replies.messages?.[0];
  const lightReplies = (replies.messages ?? [])
    .slice(1)
    .filter(r => (r as any).text && (r as any).text.trim() !== '')
    .map(r => ({
      text: (r as any).text,
      authorUserId: (r as any).user,
      // threadTs: (r as any).ts
    }));
  const totalReplies = originalMessage?.reply_count ?? lightReplies.length;

  return {
    allRepliesFetched: replies.has_more ? false : true,
    fetchedReplies: threadCount,
    totalReplies: totalReplies,
    repliesForMessageTS: ts,
    repliesForMessageChannel: channelId,
    replies: lightReplies
  };
}
