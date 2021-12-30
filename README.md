# SVG Graph Library

Vanilla Javascript implementation for a graph drawing library. The library has three layouts: force, spring, and random. The actual rendering is done with SVG. 

![SVG Graph Examle](/assets/svg-graph-example.png)

## Technical details

Codebase is Javascript with SVG for rendering. There's a sample graph if you open ontology_browser.svg.

**Code structure**
* edge.js - Represents an edge in a graph.
* edgelabel.js - Represents a label on an edge in the graph.
* geometry.js - Utility functions used by graph layouts.
* node.js - Represents an node in a graph.
* nodelabel.js - Represents a label on a node in the graph.
* forcelayout.js - Utilizes repulsive and attractive forces to create a layout where nodes mostly won't overlap.
* randomlayout.js - Completely random locations for nodes. Attempts to not overlap nodes.
* springlayout.js - Creates forces between attached nodes represented as a spring and attempts to layout nodes without overlap and not too far apart.
* util.js - Generates a sample graph and sets example graph constants.
