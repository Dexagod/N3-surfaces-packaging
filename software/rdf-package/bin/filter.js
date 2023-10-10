const program = require('commander')  
const { filterPackagesFromFile } = require('../');

program
    .description('filter')
    .argument('<string>', 'path of file to evaluate filter over')
    .option('--packaged-by <string>', 'Filter on packaging actor <URL>')
    .option('--packaged-from <string>', 'Filter on data origin <URL>')
    .option('--purpose <string>', 'Filter on useage purpose <URL>')
    .action(async (path, options) => { 
        
        let result = await filterPackagesFromFile(path, options)
        console.log(result)

    });

program.parse(process.argv)
