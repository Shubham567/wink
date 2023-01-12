 const imageFolder = "images"
 const nsfwFolder = "nsfw"
 const pornFolder = "porn"
 const hentaiFolder = "hentai"
 const cleanFolder = "clean"
 const drawingFolder = "drawing"

 const key = "zQM5b4C6Ebb6BqW8439JPWomNI5jILLswNRxD7w4ytU52Nbb5JQfULA87NR7";

 const filterThresholds = [
    {
        name: "Hentai",
        threshold: 0.1,
        folder : hentaiFolder
    },
    {
        name: "Drawing",
        threshold: 0.3,
        folder : drawingFolder
    },
    {
        name: "Porn",
        threshold: 0.2,
        folder : pornFolder
    },
    {
        name: "Sexy",
        threshold: 0.5,
        folder : nsfwFolder
    },
    
]

module.exports = {
    imageFolder,
    nsfwFolder,
    pornFolder,
    hentaiFolder,
    cleanFolder,
    drawingFolder,
    key,
    filterThresholds
}