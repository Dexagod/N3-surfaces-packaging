const fs = require('fs');
const readline = require('readline');
const spacing = "    "

/**
 * 
 * @param {string} path // path of the file to move towards a different surface
 * @param {Object} options 
 * @param {string} options.surfaceName // name of the surface to move the content towards
 * @returns 
 */
exports.moveFileToSurface = async function moveFileToSurface(path, options) {
    let lines = await new Promise((resolve, reject) => {
        let lines = []

        const file = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            terminal: false
        });
        
        file.on('line', (line) => {
            lines.push(line);
        })
        file.on('close', () => { resolve(lines) })
    })
    return processContent(lines, options)
}

/**
 * 
 * @param {string} content // content to move on the given surface
 * @param {Object} options 
 * @param {string} options.surfaceName // name of the surface to move the content towards
 * @returns 
 */
exports.moveContentToSurface = function moveContentToSurface(content, options) {
    let lines = content.split('\n').map(line => line)
    return processContent(lines, options)
}


/**
 * 
 * @param {string[]} lines // Lines of the content
 * @param {Object} options 
 * @param {string} options.surfaceName // name of the surface to move the content towards
 */
function processContent(lines, options) { 
    let parsingPrefixes = true;
    let prefixString = ""
    let contentsString = ""

    for (let line of lines){
        if (line.trim() !== "" && !line.trim().startsWith("@prefix")) {
            parsingPrefixes = false;
        } 
        
        if (parsingPrefixes) prefixString += line + `\n`
        else contentsString += spacing + line + `\n`
    };

    let result =
`${prefixString.trim()}
@prefix log: <http://www.w3.org/2000/10/swap/log#> .

() log:${options.surfaceName || "onNeutralSurface"} {
${contentsString.trimEnd()}
}.`   
    return result;
}