const fs = require('fs');
const readline = require('readline');
const spacing = "    "

exports.default = function moveToSurface(path, options) {   
    return new Promise((resolve, reject) => {
        let parsingPrefixes = true;
        let prefixString = ""
        let contentsString = ""

        const file = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            terminal: false
        });
        
        file.on('line', (line) => {
            if (line.trim() !== "" && !line.trim().startsWith("@prefix")) {
                parsingPrefixes = false;
            } 
            
            if (parsingPrefixes) prefixString += line + `\n`
            else contentsString += spacing + line + `\n`
        });

        file.on('close', () => { 
            let result =
    `${prefixString.trim()}
@prefix log: <http://www.w3.org/2000/10/swap/log#> .

() log:${options.surfaceName || "onNeutralSurface"} {
${contentsString.trimEnd()}
}.`   
            resolve(result);
        })        
    })
};
