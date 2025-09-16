import { slackClient } from "./slack/client.js";
import { searchMessagesTool } from "./tools/searchMessages.js";



async function main() {
  // get slack client
  const slack = slackClient;
  
  // call search messages tool
  const result = await searchMessagesTool(slack, { query: "Hello, world!" });
  // print result as json
  console.log(JSON.stringify(result, null, 2));
}

main();