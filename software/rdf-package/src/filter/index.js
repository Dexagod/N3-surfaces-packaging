let createDateFilter = require('./filterUseDate').default
let createPurposeFilter = require('./filterPurpose').default
let createProvenanceFilter = require('./filterProvenance').default

const { n3reasoner } = require('eyereasoner');
const { moveContentToSurface } = require('../move-to-surface')
const fs = require('fs');

/**
 * @param {string} path // Path of file to filter packages from
 * @param {Object} options 
 * @param {string} options.packagedBy // Filter on actor that did the packaging
 * @param {string} options.packagedFrom // Filter on data origin
 * @param {string} options.purpose // Fitler on purpose of use
 * @returns 
 */
exports.filterPackagesFromFile = async function filterPackagesFromFile(path, options) {
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
exports.filterPackagesFromContent = async function filterPackagesFromContent(content, options) {
    return processContent(content, options)
}


/**
 * 
 * @param {string[]} lines // Lines of the content
 * @param {Object} options 
 * @param {string} options.surfaceName // name of the surface to move the content towards
 */
async function processContent(content, options) { 

    // Run1: filter on the duration if present
    let dateFilter = createDateFilter();
    content = await runFilter(content, dateFilter, "Filter packages on usage date")

    // Run1: filter on the purpose if argument for purpose was added
    if (options.purpose) { 
        let purposeFilter = createPurposeFilter(options.purpose);
        content = await runFilter(content, purposeFilter, "Filter packages on usage purpose")
    }

    // Run1: filter on the actor that packaged and/or the data origin
    if (options.packagedBy || options.packagedFrom) { 
        let provenanceFilter = createProvenanceFilter(options);
        content = await runFilter(content, provenanceFilter, "Filter packages on provenance information")
    }

    return content
}

async function runFilter(content, filter, reason) { 
    // Move the data to a log:onDataSurface, so the filter has bounds as to what to evaluate
    let contentSurface = await moveContentToSurface(content, { surfaceName: "onDataSurface" })
    // Run the filter in the reasoner
    const resultString = await n3reasoner(contentSurface, filter);

    return resultString
}