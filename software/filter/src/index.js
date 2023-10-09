let createDateFilter = require('./filterUseDate').default
let createPurposeFilter = require('./filterPurpose').default
let createProvenanceFilter = require('./filterProvenance').default

const program = require('commander') 
const { moveContentToSurface } = require('../../move-to-surface/')
const { exec } = require("child_process");
const fs = require('fs');

/**
 * @param {string} path // Path of file to filter packages from
 * @param {Object} options 
 * @param {string} options.packagedBy // Filter on actor that did the packaging
 * @param {string} options.packagedFrom // Filter on data origin
 * @param {string} options.purpose // Fitler on purpose of use
 * @returns 
 */
exports.filterPackagesFromFile = function filterPackagesFromFile(path, options) {
    let content = fs.readFileSync(path, {encoding: "utf-8"})
    return processContent(content, options)
}

/**
 * 
 * @param {string} content // content to move on the given surface
 * @param {Object} options 
 * @param {string} options.packagedBy // Filter on actor that did the packaging
 * @param {string} options.packagedFrom // Filter on data origin
 * @param {string} options.purpose // Fitler on purpose of use
 * @returns 
 */
exports.filterPackagesFromContent = function filterPackagesFromContent(content, options) {
    return processContent(content, options)
}


/**
 * 
 * @param {string[]} lines // Lines of the content
 * @param {Object} options 
 * @param {string} options.surfaceName // name of the surface to move the content towards
 */
async function processContent(content, options) { 

    let dateFilter = createDateFilter();
    content = await runFilter(content, dateFilter, "Filter packages on usage date")

    if (options.purpose) { 
        let purposeFilter = createPurposeFilter(options.purpose);
        content = await runFilter(content, purposeFilter, "Filter packages on usage purpose")
    }

    if (options.packagedBy || options.packagedFrom) { 
        let provenanceFilter = createProvenanceFilter(options);
        content = await runFilter(content, provenanceFilter, "Filter packages on provenance information")
    }

    return content
    
}

async function runFilter(content, filter, reason) { 
    console.error(`Executing filter: ${reason}`)
    let contentSurface = await moveContentToSurface(content, { surfaceName: "onDataSurface" })
    let combinedDocuments = `${contentSurface}\n${filter}`
    console.log(combinedDocuments)

    var result = await execPromise(`echo '${combinedDocuments}' | eye --quiet --nope --blogic -`);
    return result
}


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