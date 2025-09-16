#!/usr/bin/env node
import { loadEnv } from "./config/env.js";
import { SlackClient } from "./slack/client.js";
import { searchMessagesTool } from "./tools/searchMessages.js";
import { getMessageDetailsTool } from "./tools/getMessageDetails.js";
import { listChannelsTool } from "./tools/listChannels.js";

async function main() {
  const [,, toolName, rawArgs] = process.argv;
  if (!toolName || toolName === "-h" || toolName === "--help") {
    console.log("Usage:");
    console.log("  npm run tool -- <toolName> '<jsonArgs>'");
    console.log("");
    console.log("Examples:");
    console.log("  npm run tool -- search_messages '{\"query\":\"foo\",\"pageLimit\":1}'");
    console.log("  npm run tool -- get_message_details '{\"channel\":\"C0123456\",\"ts\":\"1726479999.000100\"}'");
    console.log("  npm run tool -- list_channels");
    process.exit(0);
  }

  const env = loadEnv();
  const slack = new SlackClient(env.SLACK_AUTH_BOT_TOKEN, env.parsedChannels);

  let args: any = {};
  if (rawArgs) {
    try {
      args = JSON.parse(rawArgs);
    } catch (e) {
      console.error("Invalid JSON for args. Provide a JSON string as the second argument.");
      process.exit(1);
    }
  }

  try {
    let result: any;
    switch (toolName) {
      case "search_messages":
        result = await searchMessagesTool(slack, args);
        break;
      case "get_message_details":
        result = await getMessageDetailsTool(slack, args);
        break;
      case "list_channels":
        result = await listChannelsTool(slack);
        break;
      default:
        console.error(`Unknown tool: ${toolName}`);
        process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error(`Error: ${err?.message || String(err)}`);
    process.exit(1);
  }
}

main();


