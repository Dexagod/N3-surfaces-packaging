const packageFileContent = require('..').packageFileContent
const program = require('commander')
const fs = require('fs')

program
    .description('Package RDF graph')
    .argument('<string>', 'path of file to package')
    
    .option('--document-uri <string>', 'document uri')
    
    // Provenance options
    .option('--packaged-by <string>', 'Provenance: packaging actor')
    .option('--packaged-from <string>', 'Provenance: data origin')
    // .option('-a, --packaged-at <string>', 'Time of packaging')

    // Signature options
    .option('--sign <string>', 'Sigatures: sign package for a given WebID')

    // Policy options
    .option('--duration <string>', 'Add duration requirement to policy')
    .option('--purpose <string>', 'Add required purpose to policy')

    // Content description options
    .option('--content-type <string>', 'Content description: content type of package contents')
    .option('--shape <string>', 'Content description: URL of a SHACL shape file')

    // Other metadata options
    .option('--context-graph <string>', 'Other metadata: path of a document containing a metadata graph')

    .option('-o, --out <string>', 'output document')
    .action(async (path, options) => {
        let packageString = await packageFileContent(path, options)
        if (options.out) {
            fs.writeFileSync(options.out, packageString)
        } else { 
            console.log(packageString)
        }
    });

program.parse(process.argv)
