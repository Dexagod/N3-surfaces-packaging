const fs = require('fs');
const readline = require('readline');
const program = require('commander')  

const spacing = "    "

program
    .description('move-to-surface')
    .argument('<string>', 'path of file of which to move contents to surface')
    .option('-s, --surface-name <string>', 'Surface name')
    .action((path, options) => {        
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
}.
`   
            if (options.out) {
                fs.writeFileSync(options.out, result, { encoding: "utf-8" })
            } else { 
                console.log(result)
            }
        })        
    });

program.parse(process.argv)