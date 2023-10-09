const program = require('commander')  
const { flattenPackagesFromFile } = require('../');

program
    .description('filter')
    .argument('<string>', 'path of file to evaluate filter over')
    .action(async (path) => { 
        
        let result = await flattenPackagesFromFile(path)
        console.log(result)

    });

program.parse(process.argv)
