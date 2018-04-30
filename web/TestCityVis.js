//Define buttons
var buttonIDs = ["btnAge", "btnCitizenship", "btnIncome", "btnEthnicity", "btnHousehold", "btnEducation"];
var buttonText=["Age", "Citizenship", "Income", "Ethnicity", "People Per Household", "Education"];

//Select SVG and list element
var svg = d3.select("#graph");
svg.attr('transform', 'translate(0,20)');
var listbox = d3.select("#list");
var listtitle = d3.select("#listtitle");

//Set margins
var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 330 - margin.top - margin.bottom+300,
    svgWidth=960,
    svgHeight=610;

//Set up graph height and tooltip
var graphStart = 80;
var graphHeight = height-graphStart;


var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Apply background and set list box size
svg.attr("width", svgWidth).attr("height", svgHeight);
listbox.attr("width",300).attr("height",1500);
listtitle.attr("width",310).attr("height",60);
applyGradient(svg);

d3.select(".buttonDiv").append("rect")
    .attr("class", "button")
    .attr("id", "btnAge")
    .text("Age")
    .style("background-color", "#C8C8C8")
    .on("click", function(d,i){
        myFunction(this);
    });


//Handle button click
for(i=1; i<6; i++){
    d3.select(".buttonDiv").append("rect")
        .attr("class", "button")
        .attr("id", buttonIDs[i])
        .text(buttonText[i])
        .on("click", function(d,i){
            myFunction(this);
        });
}

//Set up scale
var xScale = d3.scaleLinear().range([20, width-20]),
    xAxis = d3.axisBottom(xScale);

var yScale = d3.scaleLinear().range([graphHeight, 30]),
    yAxis = d3.axisLeft(yScale);

xScale.domain([28,44]);
yScale.domain([0, 130]);

var group = svg.append("g");

//Add axis
var axis=group.append("g")
  .attr("transform", "translate(0," + yScale(0) + ")")
  .attr("class","axis")
  .call(xAxis);

renderInitial();

//Render Initial start state
function renderInitial(){
    d3.json("../data/data.json", render);
    function render(error, points){
        drawInitialScatter(points,clicked, boxCount);
        drawInitialList(points);
    }
}

//Render data based on selection
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

//Generate data for multi-select
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
    min = 5;
    max = -5;
    USAval = 0;
    for (i = 0; i < rawData[0].length; i++) {
        val = 0;
        for (j = 0; j < rawData.length; j++) {
            val += rawData[j][i];
        }
        finalData[i] = val / rawData.length;

        if (points[i]["name"] == "USA") USAval = finalData[i];
        if (finalData[i] < min) {
            min = finalData[i];
        }
        if (finalData[i] > max) {
            max = finalData[i];
        }
    }

    xScaleLow = d3.scaleLinear()
        .domain([min, USAval])
        .range([-1, 0]);

    xScaleHigh = d3.scaleLinear()
        .domain([USAval, max])
        .range([0, 1]);

    for (i = 0; i < finalData.length; i++) {
        if (finalData[i] < USAval) {
            finalData[i] = xScaleLow(finalData[i]);
        } else {
            finalData[i] = xScaleHigh(finalData[i]);
        }
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
        .text("Similarity of US Capital Cities");

}

//Generate data for single select
function genSingleData(points, clicked){
    buttonMap = ["age", "foreign", "income", "pop_white", "numHouse", "grads"];
    unitMap = ["Years", "Percentage Citizens", "Dollars", "Percent of Residents Who Identify as White", "Number of People", "Percent Graduated"];
    titleMap = ["Age", "Citizenship", "Income", "Population White", "Number of People Per Household", "Highschool Graduates"];
    ind = 0;
    for(i = 0; i < clicked.length; i++){
        if(clicked[i]["gray"] == 1){
            ind = i;
        }
    }
    finalData = [];
    for(i = 0; i < points.length; i++){
        finalData[i] = points[i][buttonMap[ind]];
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
        .text(unitMap[ind]);

    svg.selectAll(".graphTitle")
        .text("Average " + titleMap[ind] + " of US Capital Cities");
}

//Draw scatter points
function drawScatter(points, xScale){

    var xScale1 = xScale.range([20, width - 20]);
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

//Create data for list
function createSimilarData(points){
    var USAVal = 0;
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA"){
            USAVal = points[i]["data"];
        }
    }
    for(i = 0; i < points.length; i++){
        points[i]["similarData"] = +(100 * Math.abs(USAVal - points[i]["data"])).toFixed(3);
        if (points[i]["similarData"] == 0 && points[i]["name"] != "USA") {
            points[i]["similarData"] = 0.001;
        }
    }
}

listOrder = [];
//Draw intial list
function drawInitialList(points) {

    var title = listtitle.append("g");
    var infobar = listtitle.append("g");

    title.append("text")
            .text("Percent Difference From USA")
            .attr("class", "listtitle")
            .attr("text-anchor", "middle")
            .attr("fill","white")
            .attr("x", 110)
            .attr("y", 20);

    title.append("rect")
        .attr("fill","white")
        .attr("x", 230)
        .attr("y", 5)
        .attr("width", 20)
        .attr("height", 20)
        .attr("cursor", "pointer")
        .attr("class","infobutton")
        .attr("rx", 10)
        .attr("ry", 10)
        .on("mouseover", function(d,i) {
            infobar.transition()
            .style("opacity", 0.8)
            .duration(200)
                infobar.append("rect")
                .attr("x", 0)
                .attr("y", 28)
                .attr("width", 280)
                .attr("height", 30)
                .attr("rx", 10)
                .attr("ry", 10)
                .attr("fill", "white")
                .style("font-size", 20)
                infobar.append("text")
                .text("Percent difference is calculated by adding the factors")
                .attr("x", 10)
                .attr("y", 40)
                .attr("font-size",11)
                .attr("width", 280)
                .attr("height", 60)
                .attr("fill","black")
                infobar.append("text")
                .text("you selected and comparing them to the average US.")
                .attr("x", 10)
                .attr("y", 50)
                .attr("font-size",11)
                .attr("width", 200)
                .attr("height", 60)
                .attr("fill","black")

        })
        .on("mouseout", function(d) {
            infobar.transition()
            .duration(500)
            .style("opacity", 0);
        });

        title.append("text")
        .text("?")
        .attr("x", 235)
        .attr("y", 20)
        .on("mouseover", function (d, i) {
            infobar.transition()
            .style("opacity", 0.8)
            .duration(200)
            infobar.append("rect")
            .attr("x", 0)
            .attr("y", 28)
            .attr("width", 280)
            .attr("height", 30)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "white")
            .style("font-size", 20)
            infobar.append("text")
            .text("Percent difference is calculated by adding the factors")
            .attr("x", 10)
            .attr("y", 40)
            .attr("font-size", 11)
            .attr("width", 280)
            .attr("height", 60)
            .attr("fill", "black")
            infobar.append("text")
            .text("you selected and comparing them to the average US.")
            .attr("x", 10)
            .attr("y", 50)
            .attr("font-size", 11)
            .attr("width", 200)
            .attr("height", 60)
            .attr("fill", "black")

        })
            .on("mouseout", function (d) {
                infobar.transition()
                .duration(500)
                .style("opacity", 0);
            });

    colors = ["#393851","#494867"];
    createSimilarData(points);
    points.sort(sortData);
    listOrder = points;
    data = [];
    for(i = 0; i < points.length; i++){
        if (points[i]["name"] == "USA") {
            data[i] = i + ") " + points[i]["name"] + ": " + points[i]["similarData"] + "%";
        } else {
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

    var g1 = listbox.append("g");

    g1.selectAll('rect').data(data)
          .enter()
          .append("rect")
          .attr("x", 0)
          .attr("y", function(d,i) {
            return (((i-1)*30)+30);
           })
          .attr("width", 300)
          .attr("height", 30)
          .style("fill", function(d,i) {
            return colors[i%2];
          })
          .text(function(d,i) {
            return data[i];
          })
          .on("mouseover", function(d,i) {
                var cir = d3.selectAll(".nodes")
                    .filter(function(d) {
                        return d.name == listOrder[i]["name"];
                });
                cir.attr("stroke","white");
          })
          .on("mouseout", function(d,i) {
              var cir = d3.selectAll(".nodes")
                  .filter(function(d) {
                      return d.name == listOrder[i]["name"];
              });
              cir.attr("stroke", "none");
          });

    g1.selectAll('text').data(data)
          .enter()
          .append("text")
          .attr("x", 10)
          .attr("y", function(d,i) {
            return (((i-1)*30)+50);
           })
          .attr("class","listItems")
          .style("fill", "white")
          .text(function(d,i) {
            return data[i];
          })
          .on("mouseover", function(d,i) {
                var cir = d3.selectAll(".nodes")
                    .filter(function(d) {
                        return d.name == listOrder[i]["name"];
                });
                cir.attr("stroke","white");
          })
          .on("mouseout", function(d,i) {
              var cir = d3.selectAll(".nodes")
                  .filter(function(d) {
                      return d.name == listOrder[i]["name"];
              });
              cir.attr("stroke", "none");
          });
}

//Draw sidebar list
function drawList(points) {
    createSimilarData(points);
    points.sort(sortData);
    listOrder = points;
    data = [];
    for (i = 0; i < points.length; i++) {
        if (points[i]["name"] == "USA") {
            data[i] = i + ") " + points[i]["name"] + ": " + points[i]["similarData"] + "%";
        } else {
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

//draw inital scatter plot
function drawInitialScatter(points,clicked, boxCount) {

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

    var xScale1 = xScale.range([20, width - 20]);
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
            else if (d.pop<100000){
                return 4;
            }
            else if (d.pop>=100000 && d.pop<=600000){
                return 8;
            }
            else if (d.pop > 600000){
                return 15;
            }

            return rScale(d.pop);
        })
        .attr("fill", function(d){
            return color[regionMap[d.region]];
        })
        .attr("stroke", "none");

    svg.selectAll("circle.nodes")
        .on("mouseover", function(d) {
            tooltip.style("opacity", .9);
            var text = d.name + ", " + d.state;

            //income, add $
            if(boxCount==1 && clicked[2]["gray"]==1){
                tooltip.html(text + "<br/>$" + (d.data).toLocaleString('en'))
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 20) + "px");
                d3.select(this).attr("stroke","white");
            }
            //citizenship, ethnicity, education, add %
            else if(boxCount==1 && (clicked[1]["gray"]==1 || clicked[3]["gray"]==1 || clicked[5]["gray"]==1)){
                tooltip.html(text + "<br/>" + (d.data).toLocaleString('en') + "%")
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 20) + "px");
                d3.select(this).attr("stroke","white");
            }
            else {
                tooltip.html(text + "<br/>" + (d.data).toLocaleString('en'))
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 20) + "px");
                d3.select(this).attr("stroke","white");
            }
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .style("opacity", 0);
            d3.select(this).attr("stroke", "none");
        });

        svg.append("text")
            .text("Average Age As Compared To USA")
            .attr("class", "graphTitle")
            .attr("x", width/2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("fill","white");

        svg.append("text")
            .text("Years")
            .attr("class", "axisLabel")
            .attr("x", width/2)
            .attr("y", graphHeight + 40)
            .attr("text-anchor", "middle")
            .attr("fill","white");
}

//Draw initial USA and Columbus vertical lines
function drawInitialLines(points,xScale){

    var usaBuffer = 10;
    var cbusBuffer = 10;
    var usaValue = 0;
    var cbusValue = 0;
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA"){
            usaValue = xScale(points[i]["data"])
        }
        if(points[i]["name"] == "Columbus"){
            cbusValue = xScale(points[i]["data"])
        }
    }
    if(Math.abs(usaValue-cbusValue) < 100){
        usaBuffer = 30;
    }

    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA" || points[i]["name"] == "Columbus" ){
            curClass = points[i]["name"] + "Line";
            svg.append("line")
                .attr("class", curClass)
                .attr("x1", xScale(points[i]["data"]))
                .attr("y1", graphStart)
                .attr("x2", xScale(points[i]["data"]))
                .attr("y2", graphHeight)
                .attr("stroke-width", 1)
                .attr("stroke", "white");

            if(points[i]["name"] == "USA"){
                currBuffer = usaBuffer;
            } else{
                currBuffer = cbusBuffer;
            }

            curText = points[i]["name"] + "Text";
            svg.append("text")
                .text(points[i]["name"] + ", " + points[i]["data"])
                .attr("class", curText)
                .attr('transform', 'translate(' + (xScale(points[i]["data"])+5) + ',' + (graphStart-currBuffer) +  ')')
                .attr("text-anchor", "middle")
                .attr("fill","white")
                .style("font-size", "14px");
        }
    }
}

//Update lines on data change
function drawLines(points,xScale){

    var usaBuffer = 10;
    var cbusBuffer = 10;
    var usaValue = 0;
    var cbusValue = 0;
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA"){
            usaValue = xScale(points[i]["data"])
        }
        if(points[i]["name"] == "Columbus"){
            cbusValue = xScale(points[i]["data"])
        }
    }
    if(Math.abs(usaValue-cbusValue) < 100){
        usaBuffer = 30;
    }

    var currBuffer = 10;
    for(i = 0; i < points.length; i++){
        if(points[i]["name"] == "USA" || points[i]["name"] == "Columbus" ){
            curClass = points[i]["name"] + "Line";
            svg.selectAll("." + curClass)
                .transition()
                .attr("x1", xScale(points[i]["data"]))
                .attr("x2", xScale(points[i]["data"]));

            if(points[i]["name"] == "USA"){
                currBuffer = usaBuffer;
            } else{
                currBuffer = cbusBuffer;
            }

            curText = points[i]["name"] + "Text";
            svg.selectAll("." + curText)
                .transition()
                .text(points[i]["name"] + ", " + points[i]["data"])
                .attr('transform', 'translate(' + (xScale(points[i]["data"])+5) + ',' + (graphStart-currBuffer) +  ')')
            if(points[i]["name"] == "USA"){
                updateGradient(xScale(points[i]["data"]));
            }
        }
    }
}

//Draw legend
function drawLegend(color){
    regions = ["Northeast:", "South:", "Midwest:", "West:", "Pacific:"];
    offsets = [0, -10, 0, -10, -10]

    var legend = svg.selectAll(".legend")
        .data(color)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (i * 100 + offsets[i] - 130) + "," + (graphHeight + 45) + ")"; });

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


    regions = ["NE:", "S:", "MW:", "W:", "Pac:"];
    popRanges = ["\76 600,000", "100,000-600,000", "\74 100,000"];
    offsets = [0, 20, -10]
    popRadii = [15,8,4];


    var popLegend = svg.selectAll(".popLegend")
        .data(popRanges)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (i * 150 + 410 + offsets[i]) + "," + (graphHeight + 45) + ")"; });

    popLegend.append("circle")
        .attr("cx", width/4)
        .attr("cy", 9)
        .attr("r", function(d,i){
            return popRadii[i];
        })
        .style("fill", "#afafaf");

    popLegend.append("text")
        .data(popRanges)
        .attr("x", width/4 -20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .attr("fill","white")
        .text(function(d) {return d;});

}

//Update gradient on data change
function updateGradient(xValue){
    svg.selectAll(".leftGrad")
        .transition()
        .attr("width", xValue);

    svg.selectAll(".rightGrad")
        .transition()
        .attr("x",xValue)
        .attr("width", width-xValue);
}

//Apply gradient to background
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
        .attr("fill", "url(#gradient)")
        .style("opacity", .75);

    svg.append("rect")
        .attr("class", "rightGrad")
        .attr("x",607)
        .attr("width", width-607)
        .attr("height", graphHeight)
        .attr("fill", "url(#gradient2)")
        .style("opacity", .75);

    svg.append("rect")
        .attr("width", width)
        .attr("height", graphStart)
        .attr("fill", "#02012c");
}

//Sort function
function sortData(a, b) {
    if (a["similarData"] === b["similarData"]) {
        return 0;
    }
    else {
        return (a["similarData"] < b["similarData"]) ? -1 : 1;
    }
}
