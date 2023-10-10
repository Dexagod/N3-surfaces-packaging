const program = require('commander')  
const { moveFileToSurface } = require('../');

program
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