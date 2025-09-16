import type { SlackClient } from "../slack/client";

export type GetMessageDetailsParams = {
  channel: string;
  ts: string;
  includeThread?: boolean;
};

export async function getMessageDetailsTool(slack: SlackClient, params: GetMessageDetailsParams) {
  const { channel, ts, includeThread } = params;
  if (!channel || !ts) throw new Error("channel and ts are required");
  if (!slack.isChannelAllowed(channel)) throw new Error("Channel not allowed");

  const history = await slack.sdk.conversations.history({ channel, latest: ts, inclusive: true, limit: 1 });
  const message = history.messages?.[0];
  if (!message) throw new Error("Message not found");

  const base = {
    text: (message as any).text,
    user: (message as any).user,
    ts: (message as any).ts,
    blocks: (message as any).blocks,
    files: (message as any).files?.map((f: any) => ({ id: f.id, name: f.name, url_private: f.url_private }))
  };

  if (includeThread && (message as any).thread_ts) {
    const replies = await slack.sdk.conversations.replies({ channel, ts: (message as any).thread_ts, limit: 50 });
    const lightReplies = (replies.messages ?? []).slice(1).map(r => ({ text: (r as any).text, user: (r as any).user, ts: (r as any).ts }));
    (base as any).replies = lightReplies;
  }

  return base;
}
