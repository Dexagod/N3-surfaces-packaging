# rdf+package server demo

## Install server

```
npm install
```


## Retrieve document

**Requesting a packaged document**
```
curl -H "Accept: text/rdf+package" http://localhost:3000/document3
```

**Requesting the same document as RDF**
```
curl -H "Accept: application/ld+json" http://localhost:3000/document3
```


## Add your own documents

Add your own documents to the `/documents` folder, and request them via the url `http://localhost:<port>/<documentname>`