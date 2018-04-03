var width = 960; 
var height = 600; 
var svg = d3.select("svg");
svg.attr("width", width).attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

d3.json("top100.json", function(error, graph) {
  if (error) throw error;

  var lines = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { 
      return Math.sqrt(d.value); 
    });

  var circles = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", function(d) { 
      return color(d.group); 
    });

  // When hovering a node, show its id 
  circles.append("title")
      .text(function(d) { return d.id; });

  var linkForce = d3.forceLink()
    .links(graph.links)
    .id(function(d) { 
      return d.id; 
    });

  var simulation = d3.forceSimulation(graph.nodes)
      .force("link", linkForce)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);
      
  function ticked() {
    circles
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    lines
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }
});