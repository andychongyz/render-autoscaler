import Bree from "bree";
import Graceful from "@ladjs/graceful";
import Cabin from "cabin";
import path from "path";
import readConfig from "./read_config";

//
// we recommend using Cabin as it is security-focused
// and you can easily hook in Slack webhooks and more
// <https://cabinjs.com>
//
const logger = new Cabin();

const bree = new Bree({
  root: false,
  // logger,
  jobs: [
    {
      name: "autoscale",
      interval: readConfig().interval,
      path: path.join(__dirname, "jobs", "autoscale.js"),
    },
  ],
});

// handle graceful reloads, pm2 support, and events like SIGHUP, SIGINT, etc.
const graceful = new Graceful({ brees: [bree] });
graceful.listen();

// start all jobs (this is the equivalent of reloading a crontab):
bree.start();
