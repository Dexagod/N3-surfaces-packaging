const { filterPackagesFromFile, filterPackagesFromContent } = require('./filter');
const { moveFileToSurface, moveContentToSurface } = require('./move-to-surface');   
const { flattenPackagesFromFile, flattenPackagesFromContent } = require('./flatten');
const { packageContent, packageFileContent } = require('./package');

module.exports = {
    filterPackagesFromFile,
    filterPackagesFromContent,
    moveFileToSurface, 
    moveContentToSurface,
    flattenPackagesFromFile,
    flattenPackagesFromContent,
    packageFileContent,
    packageContent
}
