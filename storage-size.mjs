#!/usr/bin/env zx

import {imageBucket} from "./gsc.js";

$.verbose = false

const [metadata] = await imageBucket.getMetadata();

console.log(process.env.START_ID, process.env.END_ID);


console.log(JSON.stringify(metadata, null, 2))