const fs = require('fs');
const readline = require('readline');
const program = require('commander')  

const spacing = "        "
const spacingt1 = "        "
const spacingt2 = "            "
const spacingt3 = "                "

const headers = `
@prefix pack: <https://example.org/ns/package#>.
@prefix policy: <https://example.org/ns/policy#>.
@prefix sign: <https://example.org/ns/signature#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
`

program
    .description('Package RDF graph')
    .argument('<string>', 'path of file to package')
    
    .option('--document-uri <string>', 'document uri')
    
    // Provenance options
    .option('--packaged-by <string>', 'Provenance: packaging actor')
    .option('--packaged-from <string>', 'Provenance: data origin')
    // .option('-a, --packaged-at <string>', 'Time of packaging')

    // Signature options
    .option('--sign <string>', 'Sigatures: sign package for a given WebID')

    // Policy options
    .option('--duration <string>', 'Add duration requirement to policy')
    .option('--purpose <string>', 'Add required purpose to policy')

    // Content description options
    .option('--content-type <string>', 'Content description: content type of package contents')
    .option('--shape <string>', 'Content description: URL of a SHACL shape file')

    // Other metadata options
    .option('--context-graph <string>', 'Other metadata: path of a document containing a metadata graph')

    .option('-o, --out <string>', 'output document')
    .action((path, options) => {
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
            else contentsString += spacing + line + `\n`
        });

        file.on('close', () => { 
            prefixString += `\n${headers}\n`
            let prefixes = prefixString.split('\n').map(x => x.trim())
            prefixes = prefixes.filter((v, i, a) => { return a.indexOf(v) === i })
            
            let result =
`${prefixes.sort().join('\n').trim()}
() pack:packageSurface {
    () pack:contextSurface {
`
            
            result += addProvenance(options)
            result += addSignature(options)
            result += addPolicy(options)
            result += addContentDescription(options)
            result += addContextGraph(options)
                
            let blankNodes = Array.from(contentsString.matchAll(/_:[^\s;.]+/g)).map(x => x[0].trim())
            blankNodes = blankNodes.filter((v, i, a) => { return a.indexOf(v) === i })

            let graffitiString = blankNodes.length
                ? 
`    (
        ${blankNodes.join('\n        ')}
    ) pack:contentSurface {`
                : `    () pack: contentSurface {`
            
result +=
`    };
${graffitiString}
${contentsString.trimEnd()}
    }.
}.
`
            if (options.out) {
                fs.writeFileSync(options.out, result, { encoding: "utf-8" })
            } else { 
                console.log(result)
            }
        })        
    });

program.parse(process.argv)

function addProvenance(options) { 
    let result = ``
    if(options.packagedBy) result += spacing + `pack:packageSurfaceContent pack:packagedBy <${options.packagedBy}>.\n`
    if(options.packagedFrom) result += spacing + `pack:packageSurfaceContent pack:packagedFrom <${options.packagedFrom}>.\n`
    result += spacing + `pack:packageSurfaceContent pack:packagedAt "${new Date().toISOString()}"^^xsd:dateTime.\n`
    return result;
}


function addPolicy (options) { 
    if (!options.duration && !options.purpose) return '';
    let constraints = []

    if (options.duration) {
        constraints.push(`${spacingt3}<http://www.w3.org/ns/odrl/2/constraint> [
${spacingt3}    <http://www.w3.org/ns/odrl/2/leftOperand> <http://www.w3.org/ns/odrl/2/elapsedTime> ;
${spacingt3}    <http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> ;
${spacingt3}    <http://www.w3.org/ns/odrl/2/rightOperand> "${options.duration}"^^<http://www.w3.org/2001/XMLSchema#duration> ;
${spacingt3}];`)
    }
        
    if (options.purpose) {
        constraints.push(`${spacingt3}<http://www.w3.org/ns/odrl/2/constraint> [
${spacingt3}    <http://www.w3.org/ns/odrl/2/leftOperand> <https://w3id.org/oac#Purpose> ;
${spacingt3}    <http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> ;
${spacingt3}    <http://www.w3.org/ns/odrl/2/rightOperand> "${options.purpose}" ;
${spacingt3}];`)
    }

    let policyBody = `[
${spacingt2}<http://purl.org/dc/terms/creator> <${options.packagedBy}> ;
${spacingt2}<http://purl.org/dc/terms/description> "Data Usage Policy" ;
${spacingt2}<http://purl.org/dc/terms/issued> "${new Date().toISOString()}"^^xsd:dateTime ;
${spacingt2}<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/odrl/2/Agreement> ;
${spacingt2}<http://www.w3.org/ns/odrl/2/permission> [
${spacingt2}    <http://www.w3.org/ns/odrl/2/action> <http://www.w3.org/ns/odrl/2/use> ;
${spacingt2}    <http://www.w3.org/ns/odrl/2/target> <${options.documentUri}> ;
${constraints.join('\n')}
${spacingt2}];
${spacingt1}].`
    
    let result = `\n${spacingt1}pack:packageSurfaceContent policy:hasUsagePolicy ${policyBody}\n`
    
    return result;
}

function addSignature(options) { 
    let result = ``
    if (options.sign) { 
        result += `\n
${spacing} pack:packageSurfaceContent sign:hasSignature [
  a sign:VerifiableCredential;
  sign:issuer <${options.sign}>;
  sign:credentialsSubject pack:packageSurfaceContent;
  sign:proof [
    a sign:DataIntegrityProof;
    sign:cryptosuite "NotImplementedException";
    sign:created "${new Date().toISOString()}"^^xsd:dateTime;
    sign:proofPurpose sign:assertionMethod;
    sign:verificationMethod: "NotImplementedException";
    sign:proofValue: "NotImplementedException";
  ];
].\n
`
    }
    return result;
}

function addContentDescription(options) { 
    let result = ``
    if (options.contentType) result += spacing + `pack:packageSurfaceContent pack:contentSurfaceType "${options.contentType}".\n`
    if (options.shape) result += spacing + `pack:packageSurfaceContent pack:shape <${options.shape}>.\n`
    return result;
}

function addContextGraph(options) { 
    let result = ``
    if (options.contextGraph) { 
        let contextGraph = fs.readFileSync(options.contextGraph, { encoding: "utf-8" })
        result += `\n${contextGraph}\n`
    }
    return result;
}