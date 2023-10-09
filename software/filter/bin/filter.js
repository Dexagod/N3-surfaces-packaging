const program = require('commander')  
const createFilterLogicPackagedBy = require('../').default;
const { exec } = require("child_process");

program
    .description('filter')
    .argument('<string>', 'path of file to evaluate filter over')
    .option('--packaged-by <string>', 'Filter on packaged by <URL>')
    .action(async (path, options) => { 
        let filterLogic = createFilterLogicPackagedBy(options.packagedBy)
        try {
            var result = await execPromise(`eye --quiet --nope --blogic ${path} $ "${filterLogic}"`);
            console.log(result)
        } catch (e) {
            console.error(e.message);
        }
    });

program.parse(process.argv)

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}