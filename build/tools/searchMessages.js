export async function searchMessagesTool(slack, params) {
    const query = params.query?.trim();
    if (!query) {
        throw new Error("query is required");
    }
    const includeThreads = params.includeThreads ?? false;
    const pageLimit = params.pageLimit ?? 20;
    const highlight = params.sort === "latest" ? "timestamp" : "score";
    // Slack search supports channel: filter; we restrict to allowed channels
    const targetChannels = (params.channels && params.channels.length > 0)
        ? params.channels.filter(c => slack.isChannelAllowed(c))
        : slack.listAllowedChannels();
    const channelFilters = targetChannels.map(c => `in:${c}`).join(" ");
    const finalQuery = [query, channelFilters].filter(Boolean).join(" ");
    console.log(finalQuery);
    const aggregated = [];
    for (let page = 1; page <= pageLimit; page += 1) {
        const res = await slack.sdk.search.messages({ query: finalQuery, count: 20, page, sort: highlight });
        if (!res.ok || !res.messages)
            break;
        const matches = res.messages.matches ?? [];
        for (const m of matches) {
            const anyMatch = m;
            const light = {
                text: anyMatch.text,
                user: anyMatch.user,
                ts: anyMatch.ts,
                channel: anyMatch.channel?.id ?? anyMatch.channel?.name ?? anyMatch.channel,
                permalink: anyMatch.permalink,
                team: anyMatch.team,
                is_thread: Boolean(anyMatch.thread_ts && anyMatch.thread_ts !== anyMatch.ts),
                thread_ts: anyMatch.thread_ts
            };
            aggregated.push(light);
            if (includeThreads && anyMatch.thread_ts) {
                // fetch limited thread replies lightweightly
                const replies = await slack.sdk.conversations.replies({ channel: (anyMatch.channel?.id ?? anyMatch.channel), ts: anyMatch.thread_ts, limit: 10 });
                const lightReplies = (replies.messages ?? []).slice(1).map(r => ({
                    text: r.text,
                    user: r.user,
                    ts: r.ts
                }));
                light.replies = lightReplies;
            }
        }
        const paging = res.messages.paging;
        if (!paging || (paging.page ?? 0) >= (paging.pages ?? 0))
            break;
    }
    return { items: aggregated };
}
