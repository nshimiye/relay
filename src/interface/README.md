## description
A protocol that all relay implementations should follow.
Each relay implementation should
* provide a Factory class with a `static method relay`
* This `relay method` return an instance of a custom class that extends the `relay class` (<package>/src/interface/relay.js)
* This interface is there to make sure that
  * send method is available
  * broadcast method is available
