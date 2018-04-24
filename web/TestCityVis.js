var buttonIDs=["btnAge", "btnCitizenship", "btnIncome", "btnEthnicity", "btnHousehold", "btnEducation"];
var buttonText=["Age", "Citizenship", "Income", "Ethnicity", "People Per Household", "Education"];

var svg = d3.select("#graph");
var listbox = d3.select("#list");

var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    svgWidth=960,
    svgHeight=800;

var graphHeight = height-20;

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

svg.attr("width", svgWidth).attr("height", svgHeight);
listbox.attr("width",300).attr("height",1500);
applyGradient(svg);

d3.select(".buttonDiv").append("rect")
    .attr("class", "button")
    .attr("id", "btnAge")
    .text("Age")
    .style("background-color", "#C8C8C8")
    .on("click", function(d,i){
        myFunction(this);
    });

for(i=1; i<6; i++){
    d3.select(".buttonDiv").append("rect")
        .attr("class", "button")
        .attr("id", buttonIDs[i])
        .text(buttonText[i])
        .on("click", function(d,i){
            myFunction(this);
        });
}

var xScale = d3.scaleLinear().range([-10, width+10]),
    xAxis = d3.axisBottom(xScale);

var yScale = d3.scaleLinear().range([graphHeight, 50]),
    yAxis = d3.axisLeft(yScale);

xScale.domain([28,44]);
yScale.domain([0, 100]);

var group = svg.append("g");

var axis=group.append("g")
  .attr("transform", "translate(10," + yScale(0) + ")")
  .attr("class","axis")
  .call(xAxis);

renderInitial();

function renderInitial(){
    d3.json("../data/data.json", render);
    function render(error, points){
        drawInitialScatter(points);
        drawInitialList(points);
    }
}

function renderData(clicked, boxCount){
    d3.json("../data/data.json", render);
    function render(error, points){
        if(boxCount > 1) {
            genMultiData(points, clicked);
        } else {
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
        points[i]["data"] = finalData[i].toFixed(3);
    }

    xScale = d3.scaleLinear()
        .domain([-1,1])
        .range([20, width-20]);

    drawScatter(points,xScale);
    drawList(points);

    svg.selectAll(".axisLabel")
        .text("Similarity Score");

    svg.selectAll(".graphTitle")
        .text("Average Similarity To The USA");

}

function genSingleData(points, clicked){
    buttonMap = ["age", "foreign", "income", "pop_white", "numHouse", "grads"];
    unitMap = ["Years", "Percentage Citizens", "Dollars", "Percentage White", "Number of People", "Percent Graduated"];
    units = "";
    cat = "";
    for(i = 0; i < clicked.length; i++){
        if(clicked[i]["gray"] == 1){
            cat = buttonMap[i];
            units = unitMap[i];
        }
    }
    finalData = [];
    for(i = 0; i < points.length; i++){
        finalData[i] = points[i][cat];
    }

    for(i = 0; i < points.length; i++){
        points[i]["data"] = +finalData[i].toFixed(3);
    }
    xScale = d3.scaleLinear()
        .domain(d3.extent(finalData))
        .range([20, width-20]);

    drawScatter(points,xScale);
    drawList(points);

    svg.selectAll(".axisLabel")
        .text(units);

    svg.selectAll(".graphTitle")
        .text("Average " + units + " As Compared to the USA");

    listbox.selectAll(".listtitle")
        .text("Top " + units + " By City");
}

function drawScatter(points, xScale){

    var xScale1 = xScale.range([10, width-10]);
    xAxis = d3.axisBottom(xScale1);

    axis.call(xAxis);
    svg.selectAll(".nodes")
        .data(points)
        .transition()
        .attr("cx", function(d){
            return xScale(d.data);
        });
    drawLines(points,xScale);
}

function createSimilarData(points){
    var USAVal = 0;
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA"){
            USAVal = points[i]["data"];
        }
        //points[i]["similarData"] = 0;
    }
    for(i = 0; i < points.length; i++){
        points[i]["similarData"] = +(100 * (Math.abs(USAVal - points[i]["data"])/Math.abs(USAVal))).toFixed(3);
    }
}

function drawInitialList(points) {
    colors = ["#393851","#494867"];
    createSimilarData(points);
    points.sort(sortData);
    data = [];
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] != "USA"){
            data[i] = i + ") " + points[i]["name"] + ", " + points[i]["state"] + ": " + points[i]["similarData"] + "%";
        }
    }
    var g = listbox.append("g");

    g.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
        .attr("height", 30)
        .style("fill", "rgb(200, 200, 200)");

    g.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text("City")
        .style("fill", "black")

    var g1 = listbox.append("g");

    g1.selectAll('rect').data(data)
          .enter()
          .append("rect")
          .attr("x", 0)
          .attr("y", function(d,i) {
            return (((i-2)*30)+30);
           })
          .attr("width", 300)
          .attr("height", 30)
          .style("fill", function(d,i) {
            return colors[i%2];
          })
          .text(function(d,i) {
            return data[i];
          });

    g1.selectAll('text').data(data)
          .enter()
          .append("text")
          .attr("x", 10)
          .attr("y", function(d,i) {
            return (((i-2)*30)+50);
           })
          .attr("class","listItems")
          .style("fill", "white")
          .text(function(d,i) {
            return data[i];
          });
}

function drawList(points) {
    createSimilarData(points);
    points.sort(sortData);
    data = [];
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] != "USA"){
            data[i] = i + ") " + points[i]["name"] + ", " + points[i]["state"] + ": " + points[i]["similarData"] + "%";
        }
    }

    listbox.selectAll(".listItems")
        .data(data)
        .transition()
        .text(function(d,i) {
            return data[i];
        });
}

function drawInitialScatter(points) {
    finalData = [];
    for(i = 0; i < points.length; i++){
        finalData[i] = points[i]["age"];
    }
    popRay = []
    for(i = 0; i < points.length; i++){
        points[i]["data"] = finalData[i];
        if(points[i]["name"] != "USA"){
            popRay[i] = points[i]["pop"];
        }
    }
    xScale = d3.scaleLinear()
        .domain(d3.extent(finalData))
        .range([20, width-20]);

    var xScale1 = xScale.range([10, width-10]);
    xAxis = d3.axisBottom(xScale1);

    rScale = d3.scaleLinear()
        .domain(d3.extent(popRay))
        .range([4, 13]);

    yCords = [];
    for(i = 0; i < 51; i++){
        yCords[i] = (i+1)*2;
    }

    var color = ["#1de5d6", "#eb6018", "#d1d42a", "#afafaf", "#e98bff"];

    drawLegend(color);

    regionMap = {
        "Northeast": 0,
        "South" : 1,
        "Midwest" : 2,
        "West" : 3,
        "Pacific" : 4
    };
    drawInitialLines(points,xScale);

    axis.call(xAxis);
    var nodes = svg.selectAll(".nodes")
        .data(points)
        .enter()
        .append("circle")
        .attr("class","nodes")
        .transition()
        .attr("cx", function(d){
            return xScale(d.data);
        })
        .attr("cy", function(d,i) {
            return yScale(yCords[i]);
        })
        .attr("r", function(d,i) {
            if(d.name == "USA" || d.name == "Columbus"){
                return 0;
            }
            return rScale(d.pop);
        })
        .attr("fill", function(d){
            return color[regionMap[d.region]];
        })
        .attr("stroke", "black");

    svg.selectAll("circle.nodes")
        .on("mouseover", function(d) {
            tooltip.style("opacity", .9);
            var text = d.name + ", " + d.state;
            tooltip.html(text + "<br/>" + d.data)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
            d3.select(this).attr("stroke","white");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .style("opacity", 0);
            d3.select(this).attr("stroke","black");
        });

        svg.append("text")
            .text("Average Age As Compared To USA")
            .attr("class", "graphTitle")
            .attr("x", width/2)
            .attr("y", 12)
            .attr("text-anchor", "middle")
            .attr("fill","white");

        svg.append("text")
            .text("Years")
            .attr("class", "axisLabel")
            .attr("x", width/2)
            .attr("y", height + 15)
            .attr("text-anchor", "middle")
            .attr("fill","white");
}

function drawInitialLines(points,xScale){
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA" || points[i]["name"] == "Columbus" ){
            curClass = points[i]["name"] + "Line";
            svg.append("line")
                .attr("class", curClass)
                .attr("x1", xScale(points[i]["data"]))
                .attr("y1", 30)
                .attr("x2", xScale(points[i]["data"]))
                .attr("y2", graphHeight)
                .attr("stroke-width", 1)
                .attr("stroke", "white");

            curText = points[i]["name"] + "Text";
            svg.append("text")
                .text(points[i]["name"] + ", " + points[i]["data"])
                .attr("class", curText)
                .attr("x", xScale(points[i]["data"]))
                .attr("y", 27)
                .attr("text-anchor", "middle")
                .attr("fill","white");
        }
    }
}

function drawLines(points,xScale){
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA" || points[i]["name"] == "Columbus" ){
            curClass = points[i]["name"] + "Line";
            svg.selectAll("." + curClass)
                .transition()
                .attr("x1", xScale(points[i]["data"]))
                .attr("x2", xScale(points[i]["data"]));

            curText = points[i]["name"] + "Text";
            svg.selectAll("." + curText)
                .transition()
                .text(points[i]["name"] + ", " + points[i]["data"])
                .attr("x", xScale(points[i]["data"]));
            if(points[i]["name"] == "USA"){
                updateGradient(xScale(points[i]["data"]));
            }
        }
    }
}

function drawLegend(color){
    regions = ["Northeast:", "South:", "Midwest:", "West:", "Pacific:"];

    var legend = svg.selectAll(".legend")
        .data(color)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + i * 100 + "," + (graphHeight + 50) + ")"; });

    legend.append("circle")
        .attr("cx", width/4)
        .attr("cy", 9)
        .attr("r", 8)
        .style("fill", function(d){
            return d;
        });

    legend.append("text")
        .data(regions)
        .attr("x", width/4 -15)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .attr("fill","white")
        .text(function(d) {return d;});
}

function updateGradient(xValue){
    svg.selectAll(".leftGrad")
        .transition()
        .attr("width", xValue);

    svg.selectAll(".rightGrad")
        .transition()
        .attr("x",xValue)
        .attr("width", width-xValue);
}

function applyGradient(svg){
    var defs = svg.append("defs");

    var gradient = defs.append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%");

    gradient.append("stop")
        .attr("class", "start")
        .attr("offset", "0%")
        .attr("stop-color", "#02012c")
        .attr("stop-opactiy", 1);

    gradient.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", "#848398")
        .attr("stop-opactiy", 1);

    var gradient2 = defs.append("linearGradient")
        .attr("id", "gradient2")
        .attr("x1", "0%")
        .attr("x2", "100%");

    gradient2.append("stop")
        .attr("class", "start")
        .attr("offset", "0%")
        .attr("stop-color", "#848398")
        .attr("stop-opactiy", 1);

    gradient2.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", "#02012c")
        .attr("stop-opactiy", 1);

    svg.append("rect")
        .attr("class", "leftGrad")
        .attr("width", 607)
        .attr("height", graphHeight)
        .attr("fill", "url(#gradient)");

    svg.append("rect")
        .attr("class", "rightGrad")
        .attr("x",607)
        .attr("width", width-607)
        .attr("height", graphHeight)
        .attr("fill", "url(#gradient2)");

    svg.append("rect")
        .attr("width", width)
        .attr("height", 30)
        .attr("fill", "#02012c");
}

function sortData(a, b) {
    if (a["similarData"] === b["similarData"]) {
        return 0;
    }
    else {
        return (a["similarData"] < b["similarData"]) ? -1 : 1;
    }
}
