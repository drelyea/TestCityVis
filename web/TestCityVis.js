//var svg = d3.select("svg");

  var margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = 960,
      height = 600 - margin.top - margin.bottom;
      /*svgWidth=960,
      svgHeight=600;*/


//svg.attr("width", svgWidth).attr("height", svgHeight);

// setup x 
var xScale = d3.scaleLinear().range([0, width]), 
    xAxis = d3.axisBottom(xScale);

// setup y
var yScale = d3.scaleLinear().range([height, 0]), 
    yAxis = d3.axisLeft(yScale);



var color = d3.scaleOrdinal(d3.schemeCategory20);


xScale.domain([26,44]);
yScale.domain([0, 100]);

var group = gRight.append('g').attr('transform', "translate(" + 0 + "," + 100 + ")");


  // x-axis
var axis=group.append("g")
  .attr("transform", "translate(0," + yScale(0) + ")")
  .call(xAxis)
  .style("stroke", "white")
  .style("fill", "white");

var rollover=group.append('text')
    .style("text-anchor", "left")
    .style("font-size", "25px")
    .style("width",100)
    .attr('transform', "translate(" + 50 + "," + 100 + ")")
    .attr("class", "text");


d3.json("../data/capital_and_nation_data.json", drawPoints);
function drawPoints(error, points){
  var capitals = points["capitals"];
  var nation = points["nation"];

  console.log(points);

  group.selectAll('circle')
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
      //console.log(d.pop);
      //console.log("i" + i);

      if(d.pop>=1000000){
        return 20;
      }
      else if(d.pop>=500000 && d.pop<=999999){
          return 14;
      }
      else{
        return 7;
      }

    })


      .attr('fill', function(d,i) {
        //console.log("age" + d.age);
        //console.log("i" + i);


        switch(d.region) {
          case "Middle Atlantic":
              return colors[0];
              break;
          case "South Atlantic":
              return colors[1];
              break;
          case "New England":
              return colors[2];
              break;
          case "West South Central":
              return colors[3];
              break;                                
          case "West North Central":
              return colors[4];
              break;
          case "Mountain":
              return colors[5];
              break;
          case "East North Central":
              return colors[6];
              break;
          case "East South Central":
              return colors[7];
              break;
           case "Pacific":
              return colors[8];
              break;                                         
          default:
              return xScale(d.age);
        }
      })


    .on('mouseover', function(d) {      
      rollover.text("Rolled Over: " + d.name);
      if(d.pop>=1000000){
        d3.select(this).attr('stroke-width', 3);
      }
      else if(d.pop>=500000 && d.pop<=999999){
        d3.select(this).attr('stroke-width', 2);
      }
      else{
        d3.select(this).attr('stroke-width', 1);
      }

      d3.select(this).attr('stroke', 'white');

    })
    .on('mouseleave', function(d) {      
      rollover.text("");
      d3.select(this).attr('stroke', 'none');

    });
}


function readJson(category,min,max){
  xScale.domain([min,max]);
  yScale.domain([0, 100]);

    // x-axis
  axis.call(xAxis);



  d3.json("../data/capital_and_nation_data.json", drawPoints);
  function drawPoints(error, points){
    var capitals = points["capitals"];
    var nation = points["nation"];


    console.log(points);

    group.selectAll('circle')
      .transition()

      .attr('cx', function(d,i) {
        //console.log("age" + d.age);
        //console.log("i" + i);


        switch(category) {
          case "Age":
              console.log(category);
              return xScale(d.age);
              break;
          case "Gender":
              console.log(category);
              return xScale(d.income);
              break;
          case "Income":
              console.log(category);
              return xScale(d.income);
              break;
          case "Ethnicity":
              console.log(category);
              return xScale(100*(d.pop_white/d.pop));
              break;                                
          case "Household":
              console.log(category);
              return xScale(d.people_per_household);
              break;
          case "Education":
              console.log(d.name);
              return xScale(100*(d.grads_total/(d.pop-d.nativity_foreign_under5-d.nativity_foreign_5to17-d.nativity_us_under5-d.nativity_us_5to17)));
              break;
          default:
              return xScale(d.age);
        }
      })
      .attr('cy', function(d,i) {
        return yScale(Math.random() * 100);
      })

      ;
  }
}
