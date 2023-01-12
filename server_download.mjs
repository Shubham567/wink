#!/usr/bin/env zx

$.verbose = false


const dotenv = require("dotenv");
const { filterThresholds } = require("./constants");
dotenv.config();

import * as nsfwjs from "nsfwjs"
import tf from "@tensorflow/tfjs-node"
import cliProgress from "cli-progress";
import colors from "ansi-colors"
const { isFileDownloaded } =  require("./file_exist_on_server");

const {doClassificationFlattening} = require("./utils");

const nsfwjsModel = await nsfwjs.load();

const DOWNLOAD_BASE_PATH = process.env.DOWNLOAD_BASE_PATH || "downloaded"

const concurrent = +process.env.CUNCURRENT || 3;

const { imageBucket } = require("./gsc");

const counts = {
    downloaded : 0,
    failed : 0,
    ignored : 0,
}

const startId = process.argv[3] || 300000;
// const endId = 1100000;
const endId = startId * 4;

const progress = new cliProgress.SingleBar({
    format: 'Downloading Files |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

const totalFiles = Math.abs(startId - endId)

progress.start(totalFiles)


for(let i = startId; i <= endId; i += concurrent){

    const promises = [];

    for(let j = 0; j < concurrent; j++){
        if(i+j >= endId){
            break;
        }

        const file = i+j;

        const filePromise = new Promise(async (resolve, reject) => {
            let ignored = false;
            try{

                const fileExists = await isFileDownloaded(file, DOWNLOAD_BASE_PATH);


                if(fileExists){
                    counts.ignored++;
                    ignored = true;
                    throw new Error("File exists");
                }

                let data = await fetch(`https://stablediffusionapi.com/api/v3/dreambooth/fetch/${file}`, {    
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        key: process.env.API_KEY
                    })
                });

                let dataObject = await data.json();
        
                try{
                    if(!!dataObject.output?.[0]){
                        // await $`curl ${dataObject.output?.[0]} --output ${pwd}/${imageFolder}/${file}.png`
                        const res = await fetch(dataObject.output?.[0]);
                        const img = await res.buffer();

                        const image = await tf.node.decodeImage(img,3)
                        const classification = await nsfwjsModel.classify(image)
                        const newClassification = doClassificationFlattening(classification);

                        const imageFilter = filterThresholds.find(filter => newClassification[filter.name] >= filter.threshold);
                        
                        if(imageFilter){
                            // console.log("Image Filtered: ", imageFilter.name);
                            await imageBucket.file(`${DOWNLOAD_BASE_PATH}/${imageFilter.folder}/${file}.png`).save(img);

                        }
                        else{
                            await imageBucket.file(`${DOWNLOAD_BASE_PATH}/clean/${file}.png`).save(img);
                        }

                        counts.downloaded++;
                    }
                }
                catch(e){
                    // console.log(e);
                    throw new Error("Something went wrong");
                    counts.failed++;
                    // throw e;
                }
                
            }
            catch(e){
                if(!ignored){
                    counts.failed++;
                    console.log(e.message);
                }
                // throw e;
            }
            finally{
                progress.increment();
                resolve();
            }
        });

        promises.push(filePromise);
    }

    await Promise.all(promises);
    promises.length = 0;

}

progress.stop()

console.log("Total Files: ", totalFiles);
console.log("Downloaded Files: ", counts.downloaded);
console.log("Ignored Files :", counts.ignored);