const { Storage } = require("@google-cloud/storage");

const dotenv = require("dotenv");
dotenv.config();


const storage = new Storage();

const imageBucket = storage.bucket("vincio-images");

module.exports = {imageBucket,storage};

