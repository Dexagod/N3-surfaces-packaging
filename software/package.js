const fs = require('fs');
const readline = require('readline');
const program = require('commander')  

const spacing = "        "

program
    .description('Package RDF graph')
    .argument('<string>', 'path of file to package')
    .option('-b, --packaged-by <string>', 'Packaging actor')
    .option('-f, --packaged-from <string>', 'Origin of contents')
    // .option('-a, --packaged-at <string>', 'Time of packaging')
    .option('-o, --out <string>', 'output document')
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
@prefix pack: <https://example.org/ns/package#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

() pack:package {
    () pack:context {
`
if(options.packagedBy) result += spacing + `pack:packageContent pack:packagedBy <${options.packagedBy}>.\n`
if(options.packagedFrom) result += spacing + `pack:packageContent pack:packagedFrom <${options.packagedFrom}>.\n`
result += spacing + `pack:packageContent pack:packagedAt "${new Date().toISOString()}"^^xsd:dateTime.\n`
result +=
`    }.
    pack:content {
${contentsString.trimEnd()}
    }.
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