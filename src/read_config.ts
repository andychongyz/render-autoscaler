import fs from "fs";

export type Config = {
  email: string;
  password: string;
  interval: string;
  ownerId: string;
  services: {
    name: string;
    waitTimeAfterScaling: number;
    scaleUpPercentage: number;
    upStep: number;
    maxInstanceCount: number;
    scaleDownPercentage: number;
    minInstanceCount: number;
    downStep: number;
  }[];
};

export default function readConfig(): Config {
  const rawdata = fs.readFileSync("config.json");
  return JSON.parse(rawdata.toString());
}
