## Slack MCP Server

Integrate the Slack Web API into agentic workflows via MCP. Inspired by the structure of the Productboard MCP server. See the reference README for layout and usage style: [tg-productboard-mcp README](https://github.com/tomgutt/tg-productboard-mcp/blob/main/README.md).

## Tools

1. `search_messages`
2. `get_message_details`
3. `list_channels`

## Setup

### Access Token

Create a Slack app and obtain a Bot User OAuth Token (starts with `xoxb-`). Invite the bot to the channels you want to search.

Required environment variables (can be set in your shell or a `.env` file):

- `SLACK_AUTH_BOT_TOKEN`
- `SLACK_CHANNELS` (comma-separated channel IDs or names without '#', prefer IDs)

Example `.env`:

```ini
SLACK_AUTH_BOT_TOKEN=xoxb-...
SLACK_CHANNELS=general,random
```

### Slack Scopes

Grant the following scopes to your Slack app:

- `search:read`
- `channels:history` (public) and/or `groups:history` (private)
- `channels:read` / `groups:read` (recommended if you later resolve names to IDs)

The bot must be a member of the channels you want to search.

## Usage with Claude Desktop

To use this with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": [
        "-y",
        "@tomgutt/slack-mcp"
      ],
      "env": {
        "SLACK_AUTH_BOT_TOKEN": "xoxb-...",
        "SLACK_CHANNELS": "C0123456,C0654321"
      }
    }
  }
}
```

## NPX

If published, you can run it directly via NPX (example shown in the Claude configuration above).

## Run locally

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

## Tool Inputs

- `search_messages`: `{ query: string, includeThreads?: boolean, pageLimit?: number, channels?: string[] }`
- `get_message_details`: `{ channel: string, ts: string, includeThread?: boolean }`
- `list_channels`: no input

All tools restrict results to `SLACK_CHANNELS`.

## Changes to original

- Implements Slack message search with optional thread inclusion and paging
- Adds lightweight response shaping to reduce token usage
- Provides a channel allow-list via `SLACK_CHANNELS`

## License

This MCP server is licensed under the MIT License. See `LICENSE` for details.
