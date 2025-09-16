## slack-mcp

Lightweight MCP server exposing Slack search tools, inspired by `tg-productboard-mcp`.

### Install

```bash
npm install
```

### Configure

Set required environment variables (or use a `.env` file):

- SLACK_AUTH_BOT_TOKEN: Slack bot token (starts with xoxb-)
- SLACK_CHANNELS: Comma-separated channel identifiers (IDs or names like #general). Prefer channel IDs.

Optional: You may also set `LOG_LEVEL` if you extend logging.

Create `.env` file:

```bash
cp .env.example .env
# edit .env
```

`.env.example`:

```ini
SLACK_AUTH_BOT_TOKEN=
SLACK_CHANNELS=#general,#random
```

### Slack app scopes

Ensure your app has scopes appropriate for search and conversation history:
- search:read
- channels:history (for public channels) and/or groups:history (for private channels the bot is in)
- channels:read / groups:read (if you later add resolution from names to IDs)

The bot must be a member of the channels you want to search.

### Run

Dev (stdio):

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start built server (stdio):

```bash
npm start
```

### Tools

- search_messages: `{ query: string, includeThreads?: boolean, pageLimit?: number, channels?: string[] }`
- get_message_details: `{ channel: string, ts: string, includeThread?: boolean }`
- list_channels: no input

All tools restrict to `SLACK_CHANNELS`.

### Notes

- Results are minimized for LLM consumption. Threads are optional.
- Channel names in `SLACK_CHANNELS` assume Slack search `in:` filter accepts them; prefer IDs to avoid ambiguity.
