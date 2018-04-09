const {events, Job} = require("brigadier");

events.on("app_mention", (e, p) => {
    console.log(e.payload)
})