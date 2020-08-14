function makeResponsive() {

    // SVG wrapper dimensions are determined by the current width and height of the browser window
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;
    
    

    var svgArea = d3.select("body").select("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    // clear svg if it is not empty when browser loads
    if (!svgArea.empty()) {
      svgArea.remove();
    };
  
    // add margins to create space around the chart
    var margin = {
    top: 10,
    right: 40,
    bottom: 112,
    left: 102
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG view box that will hold chart with background color
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("viewBox", [80, 0, (width + margin.right + margin.left),
            (height + margin.top + margin.bottom)].join(' '))
        .style("border", "10px solid #cccccc")
        .attr("color", "#d1d1e0")
        .attr("class", "bg-secondary");

    // create chart area and shift by left and top margins
    var chartGrouped = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
   
    // Specify chosen X axis parameters
    var chosenXAxis = "income"

    function xScale(censusData, chosenXAxis) {
        
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]), 
              d3.max(censusData, d => d[chosenXAxis])*1.02])
            .range([20, width]);

            return xLinearScale;
    };
    
    //  Specify chosen y axis parameters
    var chosenYAxis = "healthcare"

    // new y scale
    function yScale(censusData, chosenYAxis) {
        
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]), d3.max(censusData, d => d[chosenYAxis])*1.08])
            .range([height-20, 0]);
        
            return yLinearScale;
    };

    // new x-axis
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    };

    // new y-axis
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    };
  
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
        return circlesGroup;
    };

    // update circle labels
    function renderLabels(circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        
        circleLabels.transition()
        .duration(1000)
            .attr("dx", d => newXScale(d[chosenXAxis]))
            .attr("dy", d => newYScale(d[chosenYAxis])+5)

 
        return circleLabels;
    };

    // update circles tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        var xLabel;
        if (chosenXAxis === "income") {
            xLabel = "Household Income (Median):";
        }
        else if (chosenXAxis === "age") {
            xLabel = "Age (Median):"
        }
        else {
            xLabel = "Poverty (%):";
        }    
        var yLabel;
        if (chosenYAxis === "healthcare") {
            yLabel = "Healthcare (% lacking):";
        }
        else if (chosenYAxis === "obesity") {
            yLabel = "Obese (%):"
        }
        else {
            yLabel = "Smokes (%):";
        }
        // create tooltip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);
    
        // event handler for tooltips
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this)
            d3.select(this)
            .style("stroke", "blue");
        })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
            d3.select(this).classed("stateCircle", true)
            .style("stroke", "");
        });
    
        return circlesGroup.classed("stateCircle", true);
    };
    

    // Import Data
    d3.csv("assets/data/data.csv").then(function(censusData) {

        // convert data strings to integers
        censusData.forEach(function(data) {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        });

        // bind data to chart
        var chart = chartGrouped.selectAll("g")
            .data(censusData);

        // create a chart group
        var chartGroup = chart.enter().append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // create x and y scales and axis
        var xLinearScale = xScale(censusData, chosenXAxis);
        var yLinearScale = yScale(censusData, chosenYAxis);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x and y axis to chartGroup
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(-20, ${height})`)
            .attr("class", "xText")
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .attr("transform", `translate(0, 20)`)
            .attr("class", "yText")
            .call(leftAxis);

        // add circlesGroup to chartGroup
        var circlesGroup = chartGroup.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 16)
            .classed("stateCircle", true);

        // label circles with state abbreviations
        var circleLabels = chartGroup.append("text")
            .attr("dx", d => xLinearScale(d[chosenXAxis]))
            .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
            .classed("stateText", true)
            .text(d => d.abbr);
                
        // create x and y axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 25})`)
            .attr("class", "aText");

        var ylabelsGroup = chartGroup.append("g")
            .attr("transfrom", "rotate (-90)")
            .attr("class", "aText");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "income") 
            .classed("active", true)
            .text("Median Household Income");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") 
            .classed("inactive", true)
            .text("Median Age");

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "poverty") 
            .classed("inactive", true)
            .text("Percent of Population in Poverty");
            
        var healthcareLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 49)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare") 
            .classed("active", true)
            .text("Percent of Population Lacking Healthcare");
            
        var smokesLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 27)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes") 
            .classed("inactive", true)
            .text("Percent of Population Who Smoke");
        
        var obesityLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 5)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese Population Percentage");
        
        // update circles with tooltips
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // update chart on x-label selections
        xlabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    xLinearScale = xScale(censusData, chosenXAxis);
                    xAxis = renderXAxes(xLinearScale, xAxis);
                    chartGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                    chartGroup = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenXAxis === "age") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }};
            });
            
        // update chart on y-axis selections
        ylabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(censusData, chosenYAxis);
                    yAxis = renderYAxes(yLinearScale, yAxis);
                    chartGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                    chartGroup = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)

                };
            };
        });

    }).catch(function(error) {
        console.log(error);
    });
};

makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
