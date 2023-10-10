const { filterPackagesFromFile, flattenPackagesFromFile, packageFileContent, moveFileToSurface } = require('../');
const program = require('commander')  
const fs = require('fs')


program
    .command('filter')
    .description('filter')
    .argument('<string>', 'path of file to evaluate filter over')
    .option('--packaged-by <string>', 'Filter on packaging actor <URL>')
    .option('--packaged-from <string>', 'Filter on data origin <URL>')
    .option('--purpose <string>', 'Filter on useage purpose <URL>')
    .option('-o, --out <string>', 'Output file')
    .action(async (path, options) => { 
        let result = await filterPackagesFromFile(path, options)
        if (options.out) {
            fs.writeFileSync(options.out, result)
        } else { 
            console.log(result)
        }
    });


program
    .command('flatten')
    .description('flatten')
    .argument('<string>', 'path of file to flatten')
    .option('-o, --out <string>', 'Output file')
    .action(async (path) => { 
        let result = await flattenPackagesFromFile(path)
        if (options.out) {
            fs.writeFileSync(options.out, result)
        } else { 
            console.log(result)
        }
    });

program
    .command('package')
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
    .option('-o, --out <string>', 'output document')
    .action(async (path, options) => {
        let packageString = await packageFileContent(path, options)
        if (options.out) {
            fs.writeFileSync(options.out, packageString)
        } else { 
            console.log(packageString)
        }
    });

program
    .command('move-to-surface')
    .description('move-to-surface')
    .argument('<string>', 'path of file of which to move contents to surface')
    .option('-s, --surface-name <string>', 'Surface name')
    .option('-o, --out <string>', 'Output file')
    .action(async (path, options) => { 
        let string = await moveFileToSurface(path, options)
        if (options.out) {
            fs.writeFileSync(options.out, string)
        } else { 
            console.log(string)
        }
    });


program.parse(process.argv)
