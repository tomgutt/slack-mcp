#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { searchMessagesTool } from "./tools/searchMessages.js";
import { getMessageDetailsTool } from "./tools/getMessageDetails.js";
import { slackClient } from "./slack/client.js";

async function main() {
  const slack = slackClient;

  const server = new Server({
    name: "slack-mcp",
    version: "0.1.0"
  }, {
    capabilities: {
      tools: {}
    }
  });


  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_messages",
          description: "Search Slack messages across allowed channels. Returns lightweight results.",
          inputSchema: {
            type: "object",
            properties: {
              query: { 
                type: "string",
                description: "The query to search for."
              },
              includeThreads: { 
                type: "boolean",
                description: "Whether to include thread replies."
              },
              pageLimit: { 
                type: "number",
                description: "The maximum number of results to return.",
                default: 20
              },
              channels: { 
                type: "array", 
                items: { type: "string" },
                description: "The channels to search in."
              },
              sort: { 
                type: "string",
                enum: ["mostRelevant", "latest"],
                description: "The sort order of the results. Either by the most relevant results or the latest results.",
                default: "mostRelevant"
              }
            },
            required: ["query"]
          }
        },
        {
          name: "get_message_details",
          description: "Get details of a specific Slack message, optionally including thread replies.",
          inputSchema: {
            type: "object",
            properties: {
              channel: { 
                type: "string",
                description: "The channel to get the message details for."
              },
              ts: { 
                type: "string",
                description: "The timestamp of the message to get the details for."
              },
              includeThread: { 
                type: "boolean",
                description: "Whether to include thread replies."
              }
            },
            required: ["channel", "ts"]
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = (req.params.arguments as any) ?? {};

    try {
      if (name === "search_messages") {
        const result = await searchMessagesTool(slack, args);
        return { content: [{ type: "json", data: result }] } as any;
      }
      if (name === "get_message_details") {
        const result = await getMessageDetailsTool(slack, args);
        return { content: [{ type: "json", data: result }] } as any;
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error: ${err.message || String(err)}` }] } as any;
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});