const http = require("http");
const express = require("express");
const { createSlackEventAdapter } = require("@slack/events-api");
const { WebClient } = require('@slack/client');
const bodyParser = require("body-parser");

const port = 3000;

const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN)

// My main app
const app = express();
app.use(bodyParser.json());
app.use("/v1/events", slackEvents.expressMiddleware());
app.use("/slack/events", slackEvents.expressMiddleware());
app.get("/healthz", (req, res)=> {
    console.log("healthz")
    res.send("OK");
})

// Configure events
slackEvents.on("error", console.error);
slackEvents.on("app_mention", e => {
    console.log("Got app_mention!")
    console.log(e)
    cmd = findCommand(e.text)
    slackClient.chat.postMessage({
        channel: e.channel,
        text: `Hello <@${ e.user }> :wave: Did you want me to "${cmd}"?`
    })
    .then( (res) => {
        console.log(res)
    }).catch( err => {
        console.error(err)
    })
    
})
/*
slackEvents.on("message", e => {
    console.log("Got a message!")
    console.log(e)
})
*/

http.createServer(app).listen(port, () => {
    console.log("This is Dr. Frazier Crane, and I'm listening... on port " + port)
})

const userid = /<@U([A-Z0-9]{8})>/
function findCommand(plaintext) {
  parts = plaintext.split(" ", 12);
  i = 0
  if (userid.test(parts[i])) {
      i++
  }
  cmd = parts[i]
  return cmd
}