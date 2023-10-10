const program = require('commander')  
const { flattenPackagesFromFile } = require('../');

program
    .description('flatten')
    .argument('<string>', 'path of file to flatten')
    .action(async (path) => { 
        
        let result = await flattenPackagesFromFile(path)
        console.log(result)

    });

program.parse(process.argv)
