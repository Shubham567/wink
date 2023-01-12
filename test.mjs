#!/usr/bin/env zx

$.verbose = false

const dotenv = require("dotenv");
const { imageBucket } = require("./gsc");
dotenv.config();

imageBucket.file("downloaded/test.txt").createWriteStream().end("test");

