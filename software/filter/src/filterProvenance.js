
/**
 * 
 * @param {Object} options 
 * @param {string} options.packagedBy // Filter on actor that did the packaging
 * @param {string} options.packagedFrom // Filter on data origin
 * @returns 
 */
exports.default = function createProvenanceFilter(options) { 

    let filteroptions = []
    
    if (options.packagedBy) { 
        filteroptions.push(`pack:packagedBy <${ options.packagedBy }>`)
    }
    if (options.packagedFrom) { 
        filteroptions.push(`pack:packagedFrom <${ options.packagedFrom }>`)
    }

    let filterString = filteroptions.map(
    optionData => { return(
`                << _:Graffiti2 pack:onContentSurface _:PackageSurfaceContentGraph >> ${optionData}.`
    )}).join('\n')

    return(`
@prefix : <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix pack: <https://example.org/ns/package#>.

@prefix graph: <http://www.w3.org/2000/10/swap/graph#>.
@prefix log: <http://www.w3.org/2000/10/swap/log#> .
@prefix time: <http://www.w3.org/2000/10/swap/time#> .
@prefix func: <http://www.w3.org/2007/rif-builtin-function#>.
@prefix math: <http://www.w3.org/2000/10/swapcontent/math#>.


# Filter on pack:packagedBy
(
    _:DataSurfaceGraffiti _:DataSurface
    _:Graffiti _:Graffiti2 _:Graffiti3
    _:PackageGraph
    _:PackageSurfaceContextGraph
    _:PackageSurfaceContentGraph
    _:SCOPE
    _:AssertedGraph
    _:X _:Y
) log:onNegativeSurface {
    
    _:DataSurfaceGraffiti log:onDataSurface _:DataSurface.
    _:DataSurface log:includes {    
        _:Graffiti pack:onPackageSurface _:PackageGraph.
    }.
    _:PackageGraph log:includes {
        << _:Graffiti2 pack:onContentSurface _:PackageSurfaceContentGraph >> _:X _:Y.
    }.
    
    (
        {
            _:PackageGraph log:includes {
${filterString}
            }.
        } {
            # Add full package to results
            _:AssertedGraph log:equalTo {
                () pack:onResultSurface _:PackageSurfaceContentGraph.
            }.
        } {
            # Dive deeper into the contents to look for packages we can return
            _:AssertedGraph log:equalTo {
                () log:onDataSurface _:PackageSurfaceContentGraph.
            }
        }
    ) log:ifThenElseIn _:SCOPE.

    () log:onNegativeSurface _:AssertedGraph.
}.


(_:G) log:onQuestionSurface {
    () pack:onResultSurface _:G.
    () log:onAnswerSurface _:G.
}.
    `)
}