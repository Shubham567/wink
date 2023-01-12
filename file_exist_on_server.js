const { imageBucket } = require("./gsc");
const { uniqueFolders } = require("./utils");

async function checkFileExists(file) {
  return !!(await imageBucket.file(`${file}`).exists())[0];
}

async function isFileDownloaded(file,pwd) {
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
    isFileDownloaded,
    checkFileExists
}

