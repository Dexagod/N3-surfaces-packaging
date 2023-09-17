const express = require('express')
const fs = require('fs')
const rdfParser = require("rdf-parse").default;
const rdfSerializer = require("rdf-serialize").default;
const stringifyStream = require('stream-to-string');
const { exec } = require('child_process');

const app = express()
const port = 3000

const programId = "https://rdf-packaging/demo-program/"

app.get('/', route)
app.get('/*', route)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function route (req, res) {
    let headers = req.headers;

    let contentType = (headers && headers.accept) || "text/turtle"
    let documentName = req.url.slice(1);
    
    let response = ""

    if (contentType === "text/rdf+package") {
        try {
            const dataOrigin = `http://localhost:${port}/${documentName}`
            
            // Package document
            await new Promise((resolve, reject) => { 
                let command = exec(`node ../software/package.js --packaged-by ${programId} --packaged-from ${dataOrigin}  documents/${documentName} > ./intermediate/packaged.n3`)
                command
                    .on('error', (e) => reject(e))
                    .on('exit', () => resolve())
            }) 

            // Return packaged document
            response = fs.readFileSync("./intermediate/packaged.n3", { encoding: "utf-8" })
            
        } catch (e) { 
            console.error(e)
        }

    } else { 
        response = await new Promise(async (resolve, reject) => { 
            try {
                // Put document on data surface
                await new Promise((resolve, reject) => { 
                    let command = exec(`node ../software/move-to-surface.js -s onDataSurface documents/${documentName} > ./intermediate/onsurface.n3`)
                    command
                        .on('error', (e) => reject(e))
                        .on('exit', () => resolve())
                }) 

                // Flatten document
                await new Promise((resolve, reject) => { 
                    let command = exec(`eye --quiet --nope --no-qnames ./intermediate/onsurface.n3 ../logic/flatten/* > intermediate/flattened.n3`)
                    command
                        .on('error', (e) => reject(e))
                        .on('exit', () => resolve())
                }) 

                // Return flattened RDF document
                let documentContent = fs.readFileSync(`./intermediate/flattened.n3`, { encoding: "utf-8" })
                let contentStream = require("streamify-string")(documentContent)
                let quadStream = rdfParser.parse(contentStream, { contentType: 'text/turtle', baseIRI: 'http://example.org' }).on('error', (error) => { reject(error) });
                const textStream = rdfSerializer.serialize(quadStream, { contentType: contentType });
                let result = await stringifyStream(textStream);
                resolve(result)
            } catch (e) {
                console.error(e)
                reject(e)
            } 
        })

    }
    
    res.send(response)
}