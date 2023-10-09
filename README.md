 # RDF Data Packaging Syntax


## Metadata options

* Signatures ( requires canonization of RDF Surfaces )
* Usage Control Policies
* Provenance
* Content descriptions (type, shape, ...)
* Other metadata over full content graph

### Packaging format possibilities

A package is some sort of information resource
In the same way that EXIF provides key-value pairs for an image, forming the triples
```
<image path/name> <width> <800px>.
<image path/name> <height> <400px>.
```

We want to be able to add metadata to graphs of data.
Currently, this can already be found using Web resources.

E.g. a profile document at `<URL1>` can contain the following data:

```
<URL1> a foaf:ProfileDocument
<URL1> foaf:primaryTopic <URL1#me>

<URL1#me> a foaf:Person.
```

And may have a metadata document at `<URL1.meta>` that has additional statements about `<URL1>`.

e.g.

```
<URL1> prov:createdAt "2022-05-03"^^xsd:date
```

What we see in this example, is a bit of a multi-layer packaging approach.

**quotation**

```
() pack:onPackageSurface { 
    << (_:b0) pack:onContentSurface { _:b0 <b> <c> } >> :p1 :o1; :p2 :o2.
} 
```
**OR mabye idea for later** 
```
() pack:onPackageSurface { 
    { () pack:onContentSurface {<a> <b> <c>} } :p1 :o1; :p2 :o2.
} 

```

The quoted version implies the following equal formatting

```
() pack:onPackageSurface {
    <<() pack:onContentSurface { ... }>> :p1 :o1.
    <<() pack:onContentSurface { ... }>> :p2 :o2.
}.
```

We can nest this approach nested

```
() pack:onPackageSurface {
    <<() pack:onContentSurface { 
        () pack:onPackageSurface {
            <<() pack:onContentSurface { ... }>> :a1 :b1.
            <<() pack:onContentSurface { ... }>> :a2 :b2.
        }.
     }>> :p1 :o1.
    <<() pack:onContentSurface { 
        () pack:onPackageSurface {
            <<() pack:onContentSurface { ... }>> :a1 :b1.
            <<() pack:onContentSurface { ... }>> :a2 :b2.
        }.
     }>> :p2 :o2.
}.
```

which can be simplified to

```
() pack:onPackageSurface {
    <<() pack:onContentSurface { 
        () pack:onPackageSurface {
            <<() pack:onContentSurface { ... }>> :a1 :b1; :a2 :b2.
        }.
     }>> :p1 :o1; :p2 :o2.
}.
```


#### Signature
Note: We first need to figure out how we can do canonization of RDF Surfaces notation. Maybe by reducing it to quads?

We base ourselves on the Verifiable credentials data model 2.0 for this

A small example of how it could look like:
```
() pack:onPackageSurface {
    <<() pack:onContentSurface { ... }>> sign:hasSignature [
        sign:proof { ... };
        sign:credentialsSubject pack:onPackageSurfaceContent;
    ].
}
```

#### Usage Control Policy
**Thought: should we store policies as their ODRL variant, or as their compiled RDF Surfaces form?**

A small example of how it could look like:
```
() pack:onPackageSurface {
    << 
        () pack:onContentSurface {
            <a> <b> <c>.
            <z> <y> <x>.
        } 
    >> policy:hasUsagePolicy [
        <http://purl.org/dc/terms/creator> <https://web.id/sender/#me> ;
        <http://purl.org/dc/terms/description> "The Duration-restricted Data Usage policy restricts the usage of the data to a specific period." ;
        <http://purl.org/dc/terms/issued> "2022-05-19T12:00" ;
        <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/odrl/2/Agreement> ;
        <http://www.w3.org/ns/odrl/2/permission> [
            <http://www.w3.org/ns/odrl/2/action> <http://www.w3.org/ns/odrl/2/use> ;
            <http://www.w3.org/ns/odrl/2/assignee> <https://web.id/receiver/#me> ;
            <http://www.w3.org/ns/odrl/2/assigner> <https://web.id/sender/#me> ;
            <http://www.w3.org/ns/odrl/2/constraint> [
                <http://www.w3.org/ns/odrl/2/leftOperand> <http://www.w3.org/ns/odrl/2/elapsedTime> ;
                <http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> ;
                <http://www.w3.org/ns/odrl/2/rightOperand> "P3M"^^<http://www.w3.org/2001/XMLSchema#duration> ;
            ];
        ];
    ].
}.
```
#### Provenance

```
() pack:onPackageSurface {
    << () pack:onContentSurface { ... } >> 
        pack:packagedBy <https://web.id/person1/#me>;
        pack:packagedFrom <https://data.pod/person1/data/>;
        pack:packagedAt "2022-07-04"^^xsd:date.
}
```


#### Other metadata

```
() pack:onPackageSurface {
    << () pack:onContentSurface { ... } >> project:partOf project:BuildingProject1.
}
```

## Limitations - Problems:

* What about non-rdf content? If we want to create something that can emulate a **Hybrid** Contextualized Knowledge Graph, we need to have support for the packaging of non-rdf content as well.
* What about external references? E.g. packaging a url reference instead of the resource itself? I would consider this out of scope and bad practice? As then we cannot really reason about the contents itself?
* What about signatures? Signatures gives a multitude of problems:
  * RDF Surfaces does not have a canonicalization algorithm yet (N3 neither afaik).
  * If we allow any kind of content, we need to be able to serialize and sign these contents? Do we sign straight on the content binary format? e.g. gzipped http packages?
* We need to standardize a small subset of metadata
  * e.g. standardized HTTP headers: Content-Type, Accept, Host, ...
  * Extensible with own metadata (HTTP allows custom headers)
* Non-RDF data can only be part of the LEAF nodes of a package structure, you cannot e.g. nest a package in a JSON body
* Should this be its own Content Type, or an Application Profile of an existing serialization (e.g. *N3* serialization with *rdf+package* application profile)
* Should we have standardized processing mechanisms?
* In any case, this mechanism is designed for the **storage** and **transfer** of (hybrid) contextualized knowledge graphs. To work with the data, we first need to flatten the data back to its base RDF / other data types. To do this, we first need to filter the relevant parts of the message into usable data (RDF, ...).