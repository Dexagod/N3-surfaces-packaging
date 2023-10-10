const { moveContentToSurface } = require("../move-to-surface");
const fs = require('fs')
const { n3reasoner } = require('eyereasoner');

/**
 * @param {string} path // Path of file to filter packages from
 * @param {Object} options 
 * @param {string} options.packagedBy // Filter on actor that did the packaging
 * @param {string} options.packagedFrom // Filter on data origin
 * @param {string} options.purpose // Fitler on purpose of use
 * @returns 
 */
exports.flattenPackagesFromFile = async function flattenPackagesFromFile(path) {
    let content = fs.readFileSync(path, {encoding: "utf-8"})
    return processContent(content)
}


/**
 * 
 * @param {string} content // content to move on the given surface
 * @returns 
 */
exports.flattenPackagesFromContent = async function filterPackagesFromContent(content) {
    return processContent(content)
}


async function processContent(content) { 
    return await runFilter(content, flattenRule, "")
}

let flattenRule = `
@prefix log: <http://www.w3.org/2000/10/swap/log#> .
@prefix pack: <https://example.org/ns/package#>.


# Filter on pack:packagedBy
(
    _:DataSurfaceGraffiti _:DataSurface
    _:S _:P _:O
    _:Graffiti _:Surface
    _:Graffiti1
    _:SCOPE
    _:AssertedGraph
    _:ContentGraph
    _:X _:Y
) log:onNegativeSurface {


    _:DataSurfaceGraffiti log:onDataSurface _:DataSurface.
    _:DataSurface log:includes {    
        _:S _:P _:O.
    }.

    (
        {
            _:P log:equalTo pack:onPackageSurface.
            _:O log:includes {
                << _:Graffiti1 pack:onContentSurface _:ContentGraph >> _:X _:Y.
            }.
        } 
        {
            _:AssertedGraph log:equalTo {
                () log:onDataSurface _:ContentGraph.
            }.
        } 
        {
            _:AssertedGraph log:equalTo {
                () pack:onResultSurface {
                    _:S _:P _:O.
                }.
            }.
        }
    ) log:ifThenElseIn _:SCOPE.
    
    () log:onNegativeSurface _:AssertedGraph.
}.

(_:G) log:onQuestionSurface {
    () pack:onResultSurface _:G.
    () log:onAnswerSurface _:G.
}.
`

async function runFilter(content, filter, reason) { 
    // Move the data to a log:onDataSurface, so the filter has bounds as to what to evaluate
    let contentSurface = await moveContentToSurface(content, { surfaceName: "onDataSurface" })
    // Run the filter in the reasoner
    const resultString = await n3reasoner(contentSurface, filter);

    return resultString
}