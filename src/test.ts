import { slackClient } from "./slack/client.js";
import { searchMessagesTool } from "./tools/searchMessages.js";



async function main() {
    // get slack client
    const slack = slackClient;
    // const allowedChannels = slack.listAllowedChannels();
    // console.log(allowedChannels);

    // call search messages tool
    const result = await searchMessagesTool(slack, { query: "langfuse", pageLimit:1 });
    console.log(JSON.stringify(result, null, 2));
}

main();