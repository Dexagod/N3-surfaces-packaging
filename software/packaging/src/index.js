const fs = require('fs');
const readline = require('readline');

const singleSpacing = "\t"
const doubleSpacing = "\t\t"
const tripleSpacing = "\t\t\t"

const headers = `
@prefix pack: <https://example.org/ns/package#>.
@prefix policy: <https://example.org/ns/policy#>.
@prefix sign: <https://example.org/ns/signature#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
`

exports.default = async function packageContent(path, options) {

    return new Promise((resolve, reject) => { 
        let parsingPrefixes = true;
        let prefixString = ""
        let contentsString = ""

        const file = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            terminal: false
        });
        
        file.on('line', (line) => {
            if (line.trim() !== "" && !line.trim().startsWith("@prefix")) {
                parsingPrefixes = false;
            } 
            
            if (parsingPrefixes) prefixString += line + `\n`
            else contentsString += tripleSpacing + line + `\n`
        });

        file.on('close', () => { 
            prefixString += `\n${headers}\n`
            let prefixes = prefixString.split('\n').map(x => x.trim())
            prefixes = prefixes.filter((v, i, a) => { return a.indexOf(v) === i })

  
            let blankNodes = Array.from(contentsString.matchAll(/_:[^\s;.]+/g)).map(x => x[0].trim())
            blankNodes = blankNodes.filter((v, i, a) => { return a.indexOf(v) === i })
            let graffitiString = blankNodes.length
                ? 
`${singleSpacing}<<
${doubleSpacing}(
${tripleSpacing}${blankNodes.join(`\n${doubleSpacing}`)}
${doubleSpacing}) pack:onContentSurface {`
                :
`${singleSpacing}<<
${doubleSpacing}() pack: onContentSurface {`


            let result =
`${prefixes.sort().join('\n').trim()}
() pack:onPackageSurface {
${graffitiString}
${contentsString.trimEnd()}
${doubleSpacing}}
${singleSpacing}>>
`
            result +=
                [].concat(
                    addProvenance(options, doubleSpacing)
                ).concat(
                    addSignature(options, doubleSpacing)
                ).concat(
                    addPolicy(options, doubleSpacing)
                ).concat(
                    addContentDescription(options, doubleSpacing)
                ).join(`;\n`) + ".\n"   
            
            result += `}.`
            resolve(result)
        })        
    })
};

function addProvenance(options, spacing) {
    let metadata = []
    if(options.packagedBy) metadata.push(`${spacing}pack:onPackageSurfaceContent pack:packagedBy <${options.packagedBy}>`)
    if(options.packagedFrom) metadata.push(`${spacing}pack:onPackageSurfaceContent pack:packagedFrom <${options.packagedFrom}>`)
    metadata.push(`${spacing}pack:onPackageSurfaceContent pack:packagedAt "${new Date().toISOString()}"^^xsd:dateTime`)
    return metadata;
}


function addPolicy(options, spacing) { 
    let metadata = []

    if (!options.duration && !options.purpose) return metadata;

    let constraints = []

    if (options.duration) {
        constraints.push(
`${spacing}${doubleSpacing}<http://www.w3.org/ns/odrl/2/constraint> [
${spacing}${tripleSpacing}<http://www.w3.org/ns/odrl/2/leftOperand> <http://www.w3.org/ns/odrl/2/elapsedTime> ;
${spacing}${tripleSpacing}<http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> ;
${spacing}${tripleSpacing}<http://www.w3.org/ns/odrl/2/rightOperand> "${options.duration}"^^<http://www.w3.org/2001/XMLSchema#duration> ;
${spacing}${doubleSpacing}]`)
    }
        
    if (options.purpose) {
        constraints.push(
`${spacing}${doubleSpacing}<http://www.w3.org/ns/odrl/2/constraint> [
${spacing}${tripleSpacing}<http://www.w3.org/ns/odrl/2/leftOperand> <https://w3id.org/oac#Purpose> ;
${spacing}${tripleSpacing}<http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> ;
${spacing}${tripleSpacing}<http://www.w3.org/ns/odrl/2/rightOperand> "${options.purpose}" ;
${spacing}${doubleSpacing}]`)
    }

    let policyBody =
`${spacing}policy:hasUsagePolicy [
${spacing}${singleSpacing}<http://purl.org/dc/terms/creator> <${options.packagedBy}> ;
${spacing}${singleSpacing}<http://purl.org/dc/terms/description> "Data Usage Policy" ;
${spacing}${singleSpacing}<http://purl.org/dc/terms/issued> "${new Date().toISOString()}"^^xsd:dateTime ;
${spacing}${singleSpacing}<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/odrl/2/Agreement> ;
${spacing}${singleSpacing}<http://www.w3.org/ns/odrl/2/permission> [
${spacing}${doubleSpacing}<http://www.w3.org/ns/odrl/2/action> <http://www.w3.org/ns/odrl/2/use> ;
${spacing}${doubleSpacing}<http://www.w3.org/ns/odrl/2/target> <${options.documentUri}> ;
${constraints.join(';\n')};\n
${spacing}${singleSpacing}];
${spacing}]`    
    
    return [policyBody];
}

function addSignature(options, spacing) {
    let metadata = []
    if (options.sign) {
        metadata.push(
`${spacing}sign:hasSignature [
${spacing}${singleSpacing}a sign:VerifiableCredential;
${spacing}${singleSpacing}sign:issuer <${options.sign}>;
${spacing}${singleSpacing}sign:credentialsSubject pack:onPackageSurfaceContent;
${spacing}${singleSpacing}sign:proof [
${spacing}${doubleSpacing}a sign:DataIntegrityProof;
${spacing}${doubleSpacing}sign:cryptosuite "NotImplementedException";
${spacing}${doubleSpacing}sign:created "${new Date().toISOString()}"^^xsd:dateTime;
${spacing}${doubleSpacing}sign:proofPurpose sign:assertionMethod;
${spacing}${doubleSpacing}sign:verificationMethod: "NotImplementedException";
${spacing}${doubleSpacing}sign:proofValue: "NotImplementedException";
${spacing}${singleSpacing}];
${spacing}]`)
    }
    return metadata;
}

function addContentDescription(options, spacing) { 
    let metadata = []
    if (options.contentType) metadata.push(`${spacing}pack:onPackageSurfaceContent pack:onContentSurfaceType "${options.contentType}"`)
    if (options.shape) metadata += (`${spacing}pack:onPackageSurfaceContent pack:shape <${options.shape}>`)
    return metadata;
}
