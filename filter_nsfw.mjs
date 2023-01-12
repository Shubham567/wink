#!/usr/bin/env zx

$.verbose = false

const dotenv = require("dotenv");
dotenv.config();

import * as nsfwjs from "nsfwjs"
import fs from "fs"
import tf from "@tensorflow/tfjs-node"
import cliProgress from "cli-progress";
import colors from "ansi-colors"

const {imageFolder, nsfwFolder, cleanFolder, filterThresholds, pornFolder, hentaiFolder} = require('./constants');

const{ doClassificationFlattening } = require("./utils");

const nsfwjsModel = await nsfwjs.load();

const pwd = process.env.PWD;

const imagesFolder = process.argv[3] || imageFolder;

const folders = new Set(filterThresholds.map(filter => filter.folder));


for(let x = 0; x < folders.length; x++){
    await $`mkdir -p ${folders[x]}`
}

const fileListStr = (await $`ls ${imagesFolder}`).stdout;

const fileList = fileListStr.split("\n");

const cuncurrent = 25;


const counts = {
    nsfw : 0,
    clean : 0,
}


const progress = new cliProgress.SingleBar({
    format: 'NSFW Filtering |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});


progress.start(fileList.length)

for(let i = 0; i < fileList.length; i = i+cuncurrent){
   
        const promises = [];

        for(let j = 0; j < cuncurrent ; j++){
            if(i+j >= fileList.length){
                break;
            }
                
            const fileCleanPromise = new Promise(async (resolve, reject) => {

                const file = fileList[i+j];

                try{
        
                    const img = fs.readFileSync(`${imagesFolder}/${file}`)
                    const image = await tf.node.decodeImage(img,3)
                    const classification = await nsfwjsModel.classify(image)
                    const newClassification = doClassificationFlattening(classification);
            
                    let isMoved = false;

                    for(let filter of filterThresholds){

                        if(newClassification[filter.name] > filter.threshold ){
                        
                            await $`mv ${imagesFolder}/${file} ${filter.folder}`                        
                            
                            isMoved = true;
                            counts.nsfw++;
                            break;
                        }

                    }
                    

                    if(!isMoved){
                        await $`mv ${imagesFolder}/${file} ${cleanFolder}`
                        counts.clean++;
                    }
                    
                }
                catch(e){
                    chalk.red("File not proper", file);
                }
                finally{
                    progress.increment();
                    resolve();
                }

            })

            promises.push(fileCleanPromise);
        }

        await Promise.all(promises);
        promises.length = 0;

}

progress.stop()

console.log("NSFW: ", counts.nsfw)
console.log("Clean: ", counts.clean)