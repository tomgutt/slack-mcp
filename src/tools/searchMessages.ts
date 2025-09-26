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
  let sanitizedMessageCount = 0;
  let foundMessagesForQuery = 0;

  const aggregated: any[] = [];
  for (let page = 1; aggregated.length < messageCount; page += 1) {
    sanitizedMessageCount = Math.min(messageCount - aggregated.length, 100); // Slack search API has a limit of 100 messages per page and will reset to a count of 20 if a higher count is requested
    const res = await slack.sdk.search.messages({ query: finalQuery, count: sanitizedMessageCount, page, sort: highlight, sort_dir: sortDir });
    if (!res.ok || !res.messages) break;
    const matches = res.messages.matches ?? [];
    foundMessagesForQuery = res.messages.total!;

    for (const m of matches) {
      const anyMatch = m as any;
      const light = {
        text: anyMatch.text,
        authorUserId: anyMatch.user,
        authorUserName: anyMatch.username,
        ts: anyMatch.ts,
        channelName: anyMatch.channel?.name,
        channelId: anyMatch.channel?.id,
        linkToMessage: anyMatch.permalink
      };
      aggregated.push(light);

      if (includeThreads && anyMatch.ts) {
        // fetch limited thread replies lightweightly
        const replies = await slack.sdk.conversations.replies({ channel: anyMatch.channel?.id, ts: anyMatch.ts, limit: threadCount });
        const lightReplies = (replies.messages ?? [])
          .slice(1)
          .filter(r => (r as any).text && (r as any).text.trim() !== '')
          .map(r => ({
            text: (r as any).text,
            authorUserId: (r as any).user,
            // threadTs: (r as any).ts
          }));
        (light as any).replies = lightReplies;
      }
    }

    const paging = res.messages.paging;
    if (!paging || (paging.page ?? 0) >= (paging.pages ?? 0)) break;
  }

  return { 
    usedSanitizedQuery: sanitizedQuery,
    foundMessagesForQuery: foundMessagesForQuery,
    queriedMessages: messageCount,
    fetchedMessages: aggregated.length,
    messages: aggregated
   };
}
