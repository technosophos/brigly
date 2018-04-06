const {events, Job} = require("brigadier");

events.on("slack_app_mention", (e, p) => {
    console.log(e.payload)
})