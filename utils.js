
const fs = require('fs').promises;

const {imageFolder, filterThresholds, nsfwFolder, pornFolder,cleanFolder, hentaiFolder} = require('./constants');

const uniqueFolders = [...new Set([...filterThresholds.map(({folder}) => folder), nsfwFolder, pornFolder, cleanFolder, hentaiFolder, imageFolder])];


 function doClassificationFlattening(classification){
    const newClassification = {};

    classification.forEach(element => {
        newClassification[element.className] = element.probability;
    });

    return newClassification;
}

 const checkFileExists = async path => !!(await fs.stat(path).catch(e => false));

 async function isFileDownloaded(file, pwd){
    
    let fileExists = false;

    for(let i = 0; i < uniqueFolders.length; i++){
        fileExists = await checkFileExists(`${pwd}/${uniqueFolders[i]}/${file}.png`);
        if(fileExists){
            break;
        }
    }


    return fileExists;
}



module.exports = {
    doClassificationFlattening,
    isFileDownloaded,
    checkFileExists
}