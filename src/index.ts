import Bree from "bree";
import Graceful from "@ladjs/graceful";
import Cabin from "cabin";
import path from "path";

//
// we recommend using Cabin as it is security-focused
// and you can easily hook in Slack webhooks and more
// <https://cabinjs.com>
//
const logger = new Cabin();
console.log("job:", path.join(__dirname, "jobs", "autoscale"));

const bree = new Bree({
  logger,
  jobs: [
    {
      name: "autoscale",
      // interval: "1m",
      interval: "3s",
      path: path.join(__dirname, "jobs", "autoscale"),
    },
  ],
});

// handle graceful reloads, pm2 support, and events like SIGHUP, SIGINT, etc.
const graceful = new Graceful({ brees: [bree] });
graceful.listen();

// start all jobs (this is the equivalent of reloading a crontab):
bree.start();
