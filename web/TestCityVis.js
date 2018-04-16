var svg = d3.select("svg");

  var margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      svgWidth=960,
      svgHeight=500;


svg.attr("width", svgWidth).attr("height", svgHeight);

// setup x
var xScale = d3.scaleLinear().range([0, width]),
    xAxis = d3.axisBottom(xScale);

// setup y
var yScale = d3.scaleLinear().range([height, 10]),
    yAxis = d3.axisLeft(yScale);



var color = d3.scaleOrdinal(d3.schemeCategory20);


xScale.domain([28,44]);
yScale.domain([0, 100]);

var group = svg.append('g');//.attr('transform', "translate(" + (width+margin.left+margin.right) + "," + 500 + ")");


  // x-axis
var axis=group.append("g")
  .attr("transform", "translate(10," + yScale(0) + ")")
  .call(xAxis);

var rollover=group.append('text').style("text-anchor", "left").style("font-size", "25px").style("width",100).attr('transform', "translate(" + 50 + "," + 100 + ")");

renderInitial()

/*
d3.json("../data/capital_data.json", drawPoints);
function drawPoints(error, points){
  var capitals = points["capitals"];


  //console.log(points);

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
*/

function readJson(category,max,min){
  xScale.domain([min,max]);
  yScale.domain([0, 100]);


    // x-axis
  axis.call(xAxis);



  d3.json("../data/capital_data.json", drawPoints);
  function drawPoints(error, points){
    var capitals = points["capitals"];


    //console.log(points);

    svg.selectAll('circle')
      .transition()

      .attr('cx', function(d,i) {
        //console.log("age" + d.age);
        //console.log("i" + i);


        switch(category) {
          case "Age":
              //console.log(category);
              return xScale(d.age);
              break;
          case "Income":
              //console.log(category);
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
      })*/
  }
}

function renderInitial(){
    d3.json("../data/data.json", render);
    function render(error, points){
        drawInitialScatter(points);
    }
}

function renderData(clicked, boxCount){
    d3.json("../data/data.json", render);
    function render(error, points){
        if(boxCount > 1){
            genMultiData(points, clicked);
        } else{
            genSingleData(points, clicked);
        }
    }
}

function genMultiData(points, clicked){
    var rawData = new Array();
    buttonMap = ["age", "foreign", "income", "pop_white", "numHouse", "grads"];
    numClicked = 0;
    for(i = 0; i < clicked.length; i++){
        if(clicked[i]["gray"] == 1){
            rawData[numClicked] = new Array();
            for(j = 0; j < points.length; j++){
                rawData[numClicked].push(points[j][buttonMap[i]]);
            }
            numClicked++;
        }
    }

    for(i = 0; i < rawData.length; i++){
        xScale = d3.scaleLinear()
            .domain(d3.extent(rawData[i]))
            .range([-1, 1]);
        for(j = 0; j < rawData[i].length; j++){
            rawData[i][j] = xScale(rawData[i][j]);
        }
    }
    finalData = [];
    for(i = 0; i < rawData[0].length; i++){
        val = 0;
        for(j = 0; j < rawData.length; j++){
            val += rawData[j][i];
        }
        finalData[i] = val/rawData.length;
    }
    for(i = 0; i < points.length; i++){
        points[i]["data"] = finalData[i];
    }

    xScale = d3.scaleLinear()
        .domain([-1,1])
        .range([10, width-10]);

    drawScatter(points,xScale);
}

function genSingleData(points, clicked){
    buttonMap = ["age", "foreign", "income", "pop_white", "numHouse", "grads"];
    cat = "";
    for(i = 0; i < clicked.length; i++){
        if(clicked[i]["gray"] == 1){
            cat = buttonMap[i];
        }
    }
    finalData = [];
    for(i = 0; i < points.length; i++){
        finalData[i] = points[i][cat];
    }
    for(i = 0; i < points.length; i++){
        points[i]["data"] = finalData[i];
    }
    xScale = d3.scaleLinear()
        .domain(d3.extent(finalData))
        .range([10, width-10]);

    drawScatter(points,xScale);
}

function drawScatter(points, xScale){

    xAxis = d3.axisBottom(xScale);

    var color = [d3.rgb(0,139,139), d3.rgb(255,255,0), d3.rgb(255,69,0), d3.rgb(131,139,131), d3.rgb(255,0,0), d3.rgb(255,104,180)];

    axis.call(xAxis);
    svg.selectAll('circle')
        .data(points)
        .transition()
        .attr('cx', function(d){
            return xScale(d.data);
        })
        .attr('cy', function(d,i) {
            return yScale(Math.random() * 100);
        })
        .attr('r', function(d,i) {
            return Math.log(d.pop/1000);//Math.log(d.pop);
        })
        .attr('fill', function(d, i){
            return color[i%color.length];
        })
        .attr('stroke', 'black')
}

function drawInitialScatter(points){
    finalData = [];
    for(i = 0; i < points.length; i++){
        finalData[i] = points[i]["age"];
    }
    for(i = 0; i < points.length; i++){
        points[i]["data"] = finalData[i];
    }
    xScale = d3.scaleLinear()
        .domain(d3.extent(finalData))
        .range([10, width-10]);

    xAxis = d3.axisBottom(xScale);

    var color = [d3.rgb(0,139,139), d3.rgb(255,255,0), d3.rgb(255,69,0), d3.rgb(131,139,131), d3.rgb(255,0,0), d3.rgb(255,104,180)];

    axis.call(xAxis);
    svg.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .transition()
        .attr('cx', function(d){
            return xScale(d.data);
        })
        .attr('cy', function(d,i) {
            return yScale(Math.random() * 100);
        })
        .attr('r', function(d,i) {
            return Math.log(d.pop/1000);//Math.log(d.pop);
        })
        .attr('fill', function(d, i){
            return color[i%color.length];
        })
        .attr('stroke', 'black')
}
