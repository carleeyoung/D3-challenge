function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    };
  
    // SVG wrapper dimensions are determined by the current width and height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
    top: 30,
    right: 40,
    bottom: 100,
    left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG view box that will hold chart with background color
    var svg = d3.select("#scatter")
    .append("svg")
    .attr("viewBox", [0, 0, (width + margin.right + margin.left),
        (height + margin.top + margin.bottom)].join(' '))
    .attr("class", "bg-secondary");

    // create chart and shift by left and top margins.
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
    d3.csv("assets/data/data.csv").then(function(censusData) {

        // Parse Data/Cast as numbers
        censusData.forEach(function(data) {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        });

        var xBandScale = d3.scaleBand()
            .domain(censusData.map(d => d.state))
            .range([15, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d.poverty)])
            .range([height+15, 0]);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xBandScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart
        chartGroup.append("g")
            .attr("transform", `translate(-15, ${height})`)
            .call(bottomAxis)
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .attr("font-size", "14px")
            .style("text-anchor", "end");

        chartGroup.append("g")
            .attr("transform", `translate(0, -15)`)
            .attr("class", "yText")
            .call(leftAxis);

        // Create Circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xBandScale(d.state))
            .attr("cy", d => yLinearScale(d.poverty))
            .attr("r", "15.5")
            .attr("class", "stateCircle");
            
        // add state abbreviations to circles
        var labels = chartGroup.append("g")
        .selectAll("text")
        .data(censusData)
        .enter()
        .append("text")
            .attr("dx", d => xBandScale(d.state))
            .attr("dy", d => yLinearScale(d.poverty)+5)
            .attr("class", "stateText")
            .text(d => d.abbr);

        // Initialize tool tip and add to chart     
        var toolTip = d3.tip() 
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`State: ${d.state}<br>Poverty Level: ${d.poverty}%`);
            });

        circlesGroup.call(toolTip);

        // Create event listeners to display and hide the tooltip
        circlesGroup.on("mouseover", function(data) {  
            toolTip.show(data, this);
            d3.select(this)
            .style("stroke", "blue")
            .on("mouseout", function(data, index) {
                d3.select(this)
                .style("stroke", "");
                toolTip.hide(data);
            });
        });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)") 
            .attr("y", 0 - margin.left + 50) 
            .attr("x", 0 - (height / 2)) 
            .attr("letter-spacing", ".2rem")
            .attr("stroke", "white") 
            .attr("class", "aText")
            .text("Percent of Population in Poverty");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
            .attr("letter-spacing", ".2rem")
            .attr("stroke", "white")
            .attr("class", "aText")
            .text("State");

    }).catch(function(error) {
        console.log(error);

    });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
