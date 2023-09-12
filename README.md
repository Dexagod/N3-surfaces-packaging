# RDF Data Packaging Syntax



## Requirements


### 1. Packaged graphs should be identical to non-packaged graps
```
() :package {
  () :context {}.
  () :contents { ... }.
}
```
is functionally identical to
```
() log:onNeutralSurface { ... }
```

### 2. Packaging must work recursively
When we want to put context on a specific subgraph, we need to package that subgraph recursively.
We can sign a package, and embed it in a graph when we want to add additional context.
```
() :package {
  () :context {}.
  () :contents {
    <a> <b> <c>.
    <d> <e> <f>.
    () :package {
      () :context {}.
      () :contents {
        <g> <h> <i>.
      }.
    }.
  }.
}.
```

Example of signing

```
() :package {
  () :context {
    _:contentsGraph :retrieval [
      :origin :person2pod.
    ].
    _:contentsGraph :packagedBy :person1.
    _:contentsGraph :signature _:X.
    _:X :issuer :person1.
    _:X :hash   "12345".
  }.
  () :contents {
    () :package {
      () :context {
        _:contentsGraph :packagedBy :person2.
        _:contentsGraph :retrieval [
          :origin :person3pod.
        ]. 
      }.
      () :contents {
        <a> <b> <c>.
      }.
    }.
  }.
}.
```


* **The context field of a package MUST only reference the contents GRAPH of the package, and NEVER the package itself**
* **What about blank nodes in nested packages? Probably not a good idea?**