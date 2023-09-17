 # RDF Data Packaging Syntax


## Metadata options

* Signatures ( requires canonization of RDF Surfaces )
* Usage Control Policies
* Provenance
* Content descriptions (type, shape, ...)
* Other metadata over full content graph

### Examples
In the current version, we use `pack:packageSurfaceContent` as a constant URI to reference the content graph of the current package.

```
(_:PackageSurfaceContent) pack:packageSurface {
    () pack:contentSurface { ... }.
    () pack:contextSurface {
        pack:packageSurfaceContent :predicate :object.
    }.
}.
```

This may not be an ideal approach. 
We could opt for other solutions as well, such as:
**quotation**
```
() pack:packageSurface {
    () pack:contentSurface { ... } {| :predicate :object |}.
}.
```

**content graph reference**
```
(_:PackageSurfaceContent) pack:packageSurface {
    _:PackageSurfaceContent log:equalTo { ... }.
    () pack:contentSurface _:PackageSurfaceContent.
    () pack:contextSurface {
        _:PackageSurfaceContent :predicate :object.
    }.
}.
```


**Note on URLs**
We could also support remote RDF (package) resources as being a valid content graph:
```
(_:PackageSurfaceContent) pack:packageSurface {
    () pack:contentSurface <https://resource.url>.
    () pack:contextSurface {}.
}.
```

#### Signature
Note: We first need to figure out how we can do canonization of RDF Surfaces notation. Maybe by reducing it to quads?

We base ourselves on the Verifiable credentials data model 2.0 for this

A small example of how it could look like:
```
() pack:packageSurface {
    () pack:contextSurface {
        pack:packageSurfaceContent sign:hasSignature [
            sign:proof { ... };
            sign:credentialsSubject pack:packageSurfaceContent;
        ].
    }.
  () pack:contentSurface { ... }.
}
```

#### Usage Control Policy
**Thought: should we store policies as their ODRL variant, or as their compiled RDF Surfaces form?**

A small example of how it could look like:
```
() pack:packageSurface {
    () pack:contextSurface {
        pack:packageSurfaceContent policy:hasUsagePolicy [
            <http://purl.org/dc/terms/creator> <https://web.id/sender/#me> ;
            <http://purl.org/dc/terms/description> "The Duration-restricted Data Usage policy restricts the usage of the data to a specific period." ;
            <http://purl.org/dc/terms/issued> "2022-05-19T12:00" ;
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/odrl/2/Agreement> ;
            <http://www.w3.org/ns/odrl/2/permission> [
                <http://www.w3.org/ns/odrl/2/action> <http://www.w3.org/ns/odrl/2/use> ;
                <http://www.w3.org/ns/odrl/2/assignee> <https://web.id/receiver/#me> ;
                <http://www.w3.org/ns/odrl/2/assigner> <https://web.id/sender/#me> ;
                <http://www.w3.org/ns/odrl/2/target> <https://example.org/ns/package#packageSurfaceContent> ;
                <http://www.w3.org/ns/odrl/2/constraint> [
                    <http://www.w3.org/ns/odrl/2/leftOperand> <http://www.w3.org/ns/odrl/2/elapsedTime> ;
                    <http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> ;
                    <http://www.w3.org/ns/odrl/2/rightOperand> "P3M"^^<http://www.w3.org/2001/XMLSchema#duration> ;
                ];
            ];
        ].
    }.
    () pack:contentSurface { ... }.
}
```
#### Provenance

```
() pack:packageSurface {
    () pack:contextSurface {
        pack:packageSurfaceContent pack:packgedBy <https://web.id/person1/#me>.
        pack:packageSurfaceContent pack:packgedFrom <https://data.pod/person1/data/>.
        pack:packageSurfaceContent pack:packgedAt "2022-07-04"^^xsd:date.
    }.
    () pack:contentSurface { ... }.
}
```


#### Content descriptions
**Do we want this? I think this might be the clue to making a Hybrid Contextualized Knowledge Graph!**

In this case, we want to not use `pack:packageSurfaceContent` but `pack:packageSurfaceContent` or something else?

```
() :package {
    () pack:contextSurface {
        pack:packageSurfaceContent pack:contentSurfaceType "text/rdf+package".
    }.
    () pack:contentSurface { 
        () :package {
            () pack:contextSurface {
                pack:packageSurfaceContent pack:contentSurfaceType "text/html".
            }.
            () pack:contentSurface "<h1> This is a HTML document </h1>".
        }
    }.
}
```

Maybe we do not want to allow non-graphs as a object in a surface triple, and should do it as follows:

```
() :package {
    () pack:contextSurface {
        pack:packageSurfaceContent pack:contentSurfaceType "text/rdf+package".
    }.
    () pack:contentSurface { 
        () pack:packageSurface {
            () pack:contextSurface {
                pack:packageSurfaceContent pack:contentSurfaceType "text/html".
            }.
            pack:packageSurfaceContent log:equalTo "<h1> This is a HTML document </h1>".
        }
    }.
}
```
```
() pack:contentSurface {
    [] pack:binaryContent "<h1> This is a HTML document </h1>".
}
```

#### Other metadata

```
() :package {
    () pack:contextSurface {
        pack:packageSurfaceContent project:partOf project:BuildingProject1.
    }.
    () pack:contentSurface { ... }.
}.
```



<!-- 
* **The context field of a package MUST only reference the content of the package, and NEVER the package itself or specific identifiers inside the content of the package!**
* **What about blank nodes in nested packages? Probably not a good idea?**
* **If I'd want to say that the content graph is NOT correct, could I do it by saying "() log:onNegativeSurface pack:packageSurfaceContent" in the context?**

* We can reference signatures as a form of packaging as well
* Packaging as a basis for *P r o v e n a n c e*
* Look at LDES / TREE problems?



### Parts of a HTTP Package

#### HTTP Request

* **The specific version of HTTP followed.** HTTP and HTTP/2 are the two versions.
* **A URL.** This points to the resource on the web.
* **An HTTP method.** This indicates the specific action the request expects to receive from the server in its response.
* **HTTP request headers.** This includes data such as what type of browser is being used and what data the request is seeking from the server. It can also include cookies, which show information previously sent from the server handling the request.
* **An HTTP body.** This is optional information the server needs from the request, such as user forms -- username/password logins, short responses and file uploads -- that are being submitted to the website.

#### HTTP Response

  * **HTTP status code**, which indicates the status of the request to the client device. Responses may indicate success, an informational response, a redirect, or errors on the server or client side.
  * **HTTP response headers**, which send information about the server and requested resources.
  * **An HTTP body (optional)**. If a request is successful, this contains the requested data in the form of HTML code, which is translated into a web page by the client browser.






For purposes such as  -->

### RDF Package Canonicalization


#### N3
We could represent our RDF Packages using Notation 3 as well:

```
[
    a pack:Package;
    pack:contextGraph {
        ...
    };
    pack:contentGraph {

    }
]
```

**Problems:**
* scoping of blank-nodes
* ... ?


#### N-Quads
We could represent the N3 graph-based approach easily as N-Quads,
however we can also make a canonicalization of the RDF Surfaces approach using N-Quads:

```
() pack:packageSurface {
    () pack:contextSurface {
        pack:packageSurfaceContent pack:packgedBy <https://web.id/person1/#me>.
        pack:packageSurfaceContent pack:packgedFrom <https://data.pod/person1/data/>.
        pack:packageSurfaceContent pack:packgedAt "2022-07-04"^^xsd:date.
    }.
    ( _:b0 ) pack:contentSurface { 
        <a> <b> _:b0.
        _:b0 <x> <y>.
    }.
}.
```

**Becomes:**
```
_:g0 a surf:Graffiti.
_:g0 pack:packageSurface _:s0.

_:g1 a surf:Graffiti _:s0.
_:g1 pack:contextSurface _:s1 _:s0.

pack:packageSurfaceContent pack:packgedBy <https://web.id/person1/#me> _:s1.
pack:packageSurfaceContent pack:packgedFrom <https://data.pod/person1/data/> _:s1.
pack:packageSurfaceContent pack:packgedAt "2022-07-04"^^xsd:date _:s1.

_:g2 a surf:Graffiti _:s0.
_:g2 surf:contains _:b0.
_:g2 pack:contentSurface _:s2 _:s0.

<a> <b> _:b0 _:s2.
_:b0 <x> <y> _:s2.
```
