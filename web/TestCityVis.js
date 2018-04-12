var svg = d3.select("svg");

  var margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      svgWidth=960,
      svgHeight=600;


svg.attr("width", svgWidth).attr("height", svgHeight);

// setup x 
var xScale = d3.scaleLinear().range([0, width]), 
    xAxis = d3.axisBottom(xScale);

// setup y
var yScale = d3.scaleLinear().range([height, 0]), 
    yAxis = d3.axisLeft(yScale);



var color = d3.scaleOrdinal(d3.schemeCategory20);


xScale.domain([28,44]);
yScale.domain([0, 100]);

var group = svg.append('g');//.attr('transform', "translate(" + (width+margin.left+margin.right) + "," + 500 + ")");


  // x-axis
var axis=group.append("g")
  .attr("transform", "translate(0," + yScale(0) + ")")
  .call(xAxis);

var rollover=group.append('text').style("text-anchor", "left").style("font-size", "25px").style("width",100).attr('transform', "translate(" + 50 + "," + 100 + ")");


d3.json("../data/capital_data.json", drawPoints);
function drawPoints(error, points){
  var capitals = points["capitals"];


  console.log(points);

  svg.selectAll('circle')
    .data(capitals).enter()
    .append('circle')
    .attr('cx', function(d,i) {
      //console.log("age" + d.age);
      //console.log("i" + i);
     
      return xScale(d.age);
         
    })
    .attr('cy', function(d,i) {
      return yScale(Math.random() * 100);
    })
    .attr('r', function(d,i) {
      return Math.log(d.pop/1000);//Math.log(d.pop);
    })
    .attr('fill', 'steelblue')
    .attr('stroke', 'black')
    .on('mouseover', function(d) {      
      rollover.text("Rolled Over: " + d.name);
      //group.style("fill", color[d.label]);

      //fillRectangle(d.id);  
    })
    .on('mouseleave', function(d) {      
      rollover.text("");
      //group.style("fill", "white");
      //group.style("background-color", "blue");

      //fillWhiteRectangle();
    });
}


function readJson(category,max,min){
  xScale.domain([min,max]);
  yScale.domain([0, 100]);


    // x-axis
  axis.call(xAxis);



  d3.json("../data/capital_data.json", drawPoints);
  function drawPoints(error, points){
    var capitals = points["capitals"];


    console.log(points);

    svg.selectAll('circle')
      .transition()

      .attr('cx', function(d,i) {
        //console.log("age" + d.age);
        //console.log("i" + i);


        switch(category) {
          case "Age":
              console.log(category);
              return xScale(d.age);
              break;
          case "Income":
              console.log(category);
              return xScale(d.income);
              break;
          default:
              return xScale(d.age);
        }
      })
      .attr('cy', function(d,i) {
        return yScale(Math.random() * 100);
      })
      .attr('r', function(d,i) {
        return Math.log(d.pop/1000);//Math.log(d.pop);
      })
      .attr('fill', 'steelblue')
      .attr('stroke', 'black')
      /*.on('mouseover', function(d) {      
        rollover.text("Rolled Over: " + d.name);
        //group.style("fill", color[d.label]);

        //fillRectangle(d.id);  
      })
      .on('mouseleave', function(d) {      
        rollover.text("");
        //group.style("fill", "white");
        //group.style("background-color", "blue");

        //fillWhiteRectangle();
      })*/;
  }
}
