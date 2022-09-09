"use strict";
const fs = require("fs");
const path = require("path");
const { Console } = require("console");


class PurgeData {
  constructor(config, eventEmitter) {
    this.config = this.validateConfigs(config);
    this.eventEmitter = eventEmitter;

    const myLogger = new Console({
      stdout: fs.createWriteStream("purge-logs.txt"),
      stderr: fs.createWriteStream("purge-error-logs.txt"),
    });

    this.myLogger = myLogger;
  }

  purge() {
    let i = 0;
    if (this.config.debug) {
      this.myLogger.log(`Purge plugin started`);
    }
    fs.readdirSync(this.config.path).forEach((file) => {
      const filePath = path.join(this.config.path, file);
      const isOlder =
        this.getHoursDiff(fs.statSync(filePath).ctime) >= this.fileAge;

      if (
        isOlder &&
        (this.config.extensions === "*" ||
          this.config.extensions.includes(path.extname(file)))
      ) {
        this.myLogger.log(
          {
            dateTime: new Date(),
            filePath,
            fileTime: fs.statSync(filePath).ctime,
            fileAge: this.fileAge, lifetime: this.getHoursDiff(fs.statSync(filePath).ctime)
          });
        i++;
        fs.unlinkSync(filePath);
      }
    });

    if (this.config.debug)
      this.myLogger.log(`${i} old files are removed`);
  }

  start() {
    let self = this;

    this.purge = this.purge.bind(this);
    
    if (
      !!self.config.runAtStart ||
      typeof self.config.runAtStart === "undefined"
    )
      this.purge();

    this.intervalPurge = setInterval(
      this.purge,
      1000 * 60 * 60 * self.config.runEvery
    );

    if (self.config.debug) {
      console.log(`logagent-purge plugin started at path \"${self.config.path}\"`);
      console.log(`logagent-purge plugin will run after ${self.config.runEvery} hour(s)`);
    }
  }

  stop() {
    let self = this;
    clearInterval(this.intervalPurge);
    remove;
    if (self.config.debug) {
      console.log("logagent-purge plugin stopped");
    }
  }

  validateConfigs(config) {
    config.extensions ??= config.extensions = [".log"];
    config.days ??= 7;
    const fn = config.configFile.output.files.fileName;
    if (!config.path && fn) {
      let path = /(\w*\.\w*)$|(\w*)$/.test()
        ? fn.replace(/(\w*\.\w*)$|(\w*)$/, "")
        : ".";

      config.path = path;
    } else if (!config.path) config.path = ".";

    try {
      const unit = config.fileAge.slice(config.fileAge.length - 1);
      let hoursMultiplier;
      switch (unit) {
        case "d":
          hoursMultiplier = 24;
          break;
        case "w":
          hoursMultiplier = 24 * 7;
          break;
        default:
          hoursMultiplier = 1;
          break;
      }

      const fileAge = config.fileAge.slice(0, config.fileAge.length - 1);
      this.fileAge = parseFloat(fileAge) * hoursMultiplier;
    } catch (error) {
      this.fileAge = 15 * 24;

      console.log(error);
      console.log("Default is set for file age, 15 days.");
    }

    config.runEvery = !!config.runEvery ? parseFloat(config.runEvery) : 1;

    if(typeof config.debug !== "boolean")
      config.debug = false;

    return config;
  }

  getHoursDiff = (date) => Math.abs(new Date() - date) / 36e5;
}

module.exports = PurgeData;
