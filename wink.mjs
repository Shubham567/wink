#!/usr/bin/env zx

$.verbose = false

const dotenv = require("dotenv");
dotenv.config();

import cliProgress from "cli-progress";
import colors from "ansi-colors"

const {imageFolder, key} = require('./constants');
const { isFileDownloaded } = require("./utils");

const pwd = process.env.PWD;

const concurrent = 5;

await $`mkdir -p ${imageFolder}`

const counts = {
    downloaded : 0,
    failed : 0,
    ignored : 0,
}

const startId = process.argv[3] || 760000
const endId = startId - 5000

const progress = new cliProgress.SingleBar({
    format: 'Downloading Files |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

const totalFiles = Math.abs(startId - endId)

progress.start(totalFiles)


for(let i = startId; i >= endId; i -= concurrent){

    const promises = [];

    for(let j = 0; j < concurrent; j++){
        if(i-j <= endId){
            break;
        }

        const file = i-j;

        const filePromise = new Promise(async (resolve, reject) => {
            let ignored = false;
            try{

                const fileExists = await isFileDownloaded(file, pwd);

                if(fileExists){
                    // chalk.yellow(`File ${i}.png exists. Ignoring.`)
                    counts.ignored++;
                    ignored = true;
                    throw new Error("File exists");
                }
        
                const data = await $`curl --location --request POST 'https://stablediffusionapi.com/api/v3/dreambooth/fetch/${file}' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "key": "${key}"
                }'`
        
                const hopefullyJs = data.stdout;
                let dataObject = null;
        
                try{
                    dataObject = JSON.parse(hopefullyJs);
                    if(!!dataObject.output){
                        await $`curl ${dataObject.output?.[0]} --output ${pwd}/${imageFolder}/${file}.png`

                        await $`cd ${pwd}`
                        counts.downloaded++;
                    }
                }
                catch(e){
                    throw new Error("Failed to parse JSON");
                }
                
            }
            catch(e){
                chalk.red(e.message);
                if(!ignored){
                    counts.failed++;
                    console.log(e.message);
                }
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
console.log("Failed Files: ", counts.failed);

$.verbose = true;
await $`zx filter_nsfw.mjs`

