import type { SlackClient } from "../slack/client.js";

export type SearchMessagesParams = {
  query: string;
  messageCount?: number;
  includeThreads?: boolean;
  threadCount?: number;
  sortMessages?: "mostRelevant" | "latest" | "oldest";
};


function sanitizeSlackQuery(userQuery: string): string {
  const sanitizedQuery = userQuery
    .replace(/\\/g, '"\\"')              // Escape backslashes first
    // .replace(/["']/g, '\\"')             // Escape quotes  
    // .replace(/[()[\]]/g, '\\$&')         // Escape grouping characters
    .replace(/[*?]/g, '"$&"')            // Escape wildcards
    .replace(/:/g, '":"')                // Escape colons
    .replace(/[@#]/g, '"$&"')            // Escape user/channel indicators
    .replace(/^-/g, '"-"')               // Escape leading dash
    .replace(/\s-/g, ' "-')             // Escape dashes after spaces
    .replace(/\b(from|to|in|has|before|after|during|on):/gi, '$1":"'); // Escape modifier words

  return sanitizedQuery;

}


function addChannelFilters(query: string, allowedChannels: string[]): string {
  const channelFilters = allowedChannels.map(c => `in:${c}`).join(" ");
  return [query, channelFilters].filter(Boolean).join(" ");
}


export async function searchMessagesTool(slack: SlackClient, params: SearchMessagesParams) {
  const query = params.query?.trim();
  if (!query) {
    throw new Error("query is required");
  }
  const includeThreads = params.includeThreads ?? false;
  const messageCount = params.messageCount ?? 20;
  const threadCount = params.threadCount ?? 10;
  const highlight = params.sortMessages === "latest" ? "timestamp" : "score";
  const sortDir = params.sortMessages === "oldest" ? "asc" : "desc";

  // Sanitize query
  const sanitizedQuery = sanitizeSlackQuery(query);

  // Get allowed channels and add them to the query
  const targetChannels = slack.listAllowedChannels();
  const finalQuery = addChannelFilters(sanitizedQuery, targetChannels);
  console.log("finalQuery: ", finalQuery);
  let sanitizedMessageCount = 0;

  const aggregated: any[] = [];
  for (let page = 1; aggregated.length < messageCount; page += 1) {
    sanitizedMessageCount = Math.min(messageCount - aggregated.length, 100); // Slack search API has a limit of 100 messages per page and will reset to a count of 20 if a higher count is requested
    console.log(`Fetching page ${page} to get ${messageCount} messages. I will now fetch ${sanitizedMessageCount} messages. I already fetched ${aggregated.length} messages.`);
    const res = await slack.sdk.search.messages({ query: finalQuery, count: sanitizedMessageCount, page, sort: highlight, sort_dir: sortDir });
    if (!res.ok || !res.messages) break;
    const matches = res.messages.matches ?? [];

    for (const m of matches) {
      const anyMatch = m as any;
      const light = {
        text: anyMatch.text,
        user: anyMatch.user,
        ts: anyMatch.ts,
        channel: anyMatch.channel?.name ?? anyMatch.channel?.id ?? anyMatch.channel,
        permalink: anyMatch.permalink,
        team: anyMatch.team,
        is_thread: Boolean(anyMatch.thread_ts && anyMatch.thread_ts !== anyMatch.ts),
        thread_ts: anyMatch.thread_ts
      };
      aggregated.push(light);

      if (includeThreads && anyMatch.thread_ts) {
        // fetch limited thread replies lightweightly
        const replies = await slack.sdk.conversations.replies({ channel: (anyMatch.channel?.id ?? anyMatch.channel)!, ts: anyMatch.thread_ts, limit: threadCount });
        const lightReplies = (replies.messages ?? []).slice(1).map(r => ({
          text: (r as any).text,
          user: (r as any).user,
          ts: (r as any).ts
        }));
        (light as any).replies = lightReplies;
      }
    }

    const paging = res.messages.paging;
    if (!paging || (paging.page ?? 0) >= (paging.pages ?? 0)) break;
  }

  console.log(`Done! I fetched ${aggregated.length} messages.`);
  return { messages: aggregated };
}
