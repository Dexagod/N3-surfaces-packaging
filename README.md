 # RDF Data Packaging Syntax


## Metadata options

* Signatures ( requires canonization of RDF Surfaces )
* Usage Control Policies
* Provenance
* Content descriptions (type, shape, ...)
* Other metadata over full content graph

### Examples
In the current version, we use `pack:packageContent` as a constant URI to reference the content graph of the current package.

```
(_:PackageContent) pack:package {
    () pack:content { ... }.
    () pack:context {
        pack:packageContent :predicate :object.
    }.
}.
```

This may not be an ideal approach. 
We could opt for other solutions as well, such as:
**quotation**
```
() pack:package {
    () pack:content { ... } {| :predicate :object |}.
}.
```

**content graph reference**
```
(_:PackageContent) pack:package {
    _:PackageContent log:equalTo { ... }.
    () pack:content _:PackageContent.
    () pack:context {
        _:PackageContent :predicate :object.
    }.
}.
```


**Note on URLs**
We could also support remote RDF (package) resources as being a valid content graph:
```
(_:PackageContent) pack:package {
    () pack:content <https://resource.url>.
    () pack:context {}.
}.
```

#### Signature
Note: We first need to figure out how we can do canonization of RDF Surfaces notation. Maybe by reducing it to quads?

We base ourselves on the Verifiable credentials data model 2.0 for this

A small example of how it could look like:
```
() pack:package {
    () pack:context {
        pack:packageContent sign:hasSignature {
            sign:proof { ... }sign:
            sign:credentialsSubject pack:packageContent.
        }
    }.
  () pack:content { ... }.
}
```

#### Usage Control Policy
**Thought: should we store policies as their ODRL variant, or as their compiled RDF Surfaces form?**

A small example of how it could look like:
```
() pack:package {
    () pack:context {
        pack:packageContent policy:hasUsagePolicy [
            <http://purl.org/dc/terms/creator> <https://web.id/sender/#me> .
            <http://purl.org/dc/terms/description> "The Duration-restricted Data Usage policy restricts the usage of the data to a specific period." .
            <http://purl.org/dc/terms/issued> "2022-05-19T12:00" .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/odrl/2/Agreement> .
            <http://www.w3.org/ns/odrl/2/permission> [
                <http://www.w3.org/ns/odrl/2/action> <http://www.w3.org/ns/odrl/2/use> .
                <http://www.w3.org/ns/odrl/2/assignee> <https://web.id/receiver/#me> .
                <http://www.w3.org/ns/odrl/2/assigner> <https://web.id/sender/#me> .
                <http://www.w3.org/ns/odrl/2/target> pack:packageContent .
                <http://www.w3.org/ns/odrl/2/constraint> [
                    <http://www.w3.org/ns/odrl/2/leftOperand> <http://www.w3.org/ns/odrl/2/elapsedTime> .
                    <http://www.w3.org/ns/odrl/2/operator> <http://www.w3.org/ns/odrl/2/eq> .
                    <http://www.w3.org/ns/odrl/2/rightOperand> "P3M"^^<http://www.w3.org/2001/XMLSchema#duration> .
                ].
            ].
        ].
    }.
    () pack:content { ... }.
}
```
#### Provenance

```
() :package {
    () pack:context {
        pack:packageContent pack:packagedBy <https://web.id/person1/#me>.
        pack:packageContent pack:packagedFrom <https://data.pod/person1/data/>.
        pack:packageContent pack:packagedAt "2022-07-04"^^xsd:date.
    }.
    () pack:content { ... }.
}
```


#### Content descriptions
**Do we want this? I think this might be the clue to making a Hybrid Contextualized Knowledge Graph!**

In this case, we want to not use `pack:packageContent` but `pack:packageContent` or something else?

```
() :package {
    () pack:context {
        pack:packageContent pack:contentType "text/rdf-package".
    }.
    () pack:content { 
        () :package {
            () pack:context {
                pack:packageContent pack:contentType "text/html".
            }.
            () pack:content "<h1> This is a HTML document </h1>".
        }
    }.
}
```

Maybe we do not want to allow non-graphs as a object in a surface triple, and should do it as follows:

```
() :package {
    () pack:context {
        pack:packageContent pack:contentType "text/rdf-package".
    }.
    () pack:content { 
        () pack:package {
            () pack:context {
                pack:packageContent pack:contentType "text/html".
            }.
            pack:packageContent log:equalTo "<h1> This is a HTML document </h1>".
        }
    }.
}
```
```
() pack:content {
    [] pack:binaryContent "<h1> This is a HTML document </h1>".
}
```

#### Other metadata

```
() pack:content { 
    () :package {
        () pack:context {
            pack:packageContent project:partOf project:BuildingProject1.
        }.
        () pack:content { ... }.
    }
}.
```



<!-- 
* **The context field of a package MUST only reference the content of the package, and NEVER the package itself or specific identifiers inside the content of the package!**
* **What about blank nodes in nested packages? Probably not a good idea?**
* **If I'd want to say that the content graph is NOT correct, could I do it by saying "() log:onNegativeSurface pack:packageContent" in the context?**

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





#### RDF Surfaces Canonization

For purposes such as  -->