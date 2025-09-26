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

- `SLACK_AUTH_USER_TOKEN` (starts with `xoxp-`)
- `SLACK_SEARCH_CHANNELS` (comma-separated channel names without '#')

Example `.env`:

```ini
SLACK_AUTH_USER_TOKEN=xoxp-...
SLACK_SEARCH_CHANNELS=general
```

### Slack Scopes

Grant the following user auth scopes to your Slack app:

- `search:read`
- `channels:history` (public) and/or `groups:history` (private) (read messages and other content in a user’s public channels)
- `channels:read` / `groups:read` (view basic information about public channels in a workspace)
- `channels:history` (read messages and other content in a user’s public channels)
- `links:read` (view URLs in messages)
- `search:read` (search a workspace’s content)
- `search:read.private` (search a workspace's content in private channels)
- `search:read.public` (search a workspace's content in public channels)
- `search:read.users` (search a workspace's users)
- `users.profile:read` (view a user’s profile information)


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
        "SLACK_AUTH_USER_TOKEN": "xoxp-...",
        "SLACK_SEARCH_CHANNELS": "general,random"
      }
    }
  }
}
```

## NPX

If published, you can run it directly via NPX (example shown in the Claude configuration above).

## Run locally

Build:

```bash
npm run build
```

Use the mcp inspector:

```bash
npm run inspector
```

## Test a tool without inspector
ToDo: Add reference to run-test.sh:

```bash
./run-test.sh
```

## Tool Inputs

- `search_messages`: `{ query: string, includeThreads?: boolean, pageLimit?: number, channels?: string[] }`
- `get_message_details`: `{ channel: string, ts: string, includeThread?: boolean }`
- `list_channels`: no input

All tools restrict results to `SLACK_SEARCH_CHANNELS`.

## Changes to original

- Implements Slack message search with optional thread inclusion and paging
- Adds lightweight response shaping to reduce token usage
- Provides a channel allow-list via `SLACK_SEARCH_CHANNELS`

## License

This MCP server is licensed under the MIT License. See `LICENSE` for details.
