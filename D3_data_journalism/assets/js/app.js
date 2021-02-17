// Create SVG container
var svgWidth = 960;
var svgHeight = 500;

// Margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Subtract margins from chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append SVG group that will hold the chart
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty"
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(peopleData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(peopleData, d => d[chosenXAxis]) * 0.8,
      d3.max(peopleData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(peopleData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(peopleData, d => d[chosenYAxis]) * 0.8,
        d3.max(peopleData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating text group with a transition to
// new text
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");
  
    return textGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenXAxis, circlesGroup, textGroup) {
    
    var label;
    
    if (chosenXAxis === "poverty") {
        label = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        label = "Age (Median)";
    }
    if (chosenYAxis === "healthcare") {
        label = "In Poverty (%)";
    }
    else if (chosenYAxis === "smokes") {
        label = "Smokes (%)";
    }

    // Initialize tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`<strong>${d.state}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

// Create circles tooltip in chart and event listeners
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

// Create text tooltip in chart and event listeners
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

  return circlesGroup;
}

// Retrieve data from the CSV file 
d3.csv("data/data.csv").then(function(peopleData, err) {
  if (err) throw err;

//   // parse data
  peopleData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;

  });

//   // xLinearScale & yLinearScale function
  var xLinearScale = xScale(peopleData, chosenXAxis);
  var yLinearScale = yScale(peopleData, chosenYAxis);

//   // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

//   // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

//   // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

//   // append initial circles
  var circlesGroup = chartGroup.selectAll(".stateCircle")
    .data(peopleData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("class", ".stateCircle")
    .attr("opacity", ".5");

//   // Append text to circles
  var textGroup = chartGroup.selectAll(".stateText")
    .data(peopleData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => (d.state))
    .attr("class", "stateText")
    .attr("text-anchor", "middle");

//   // Create group for two x-axis labels and append
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // Create group for two y-axis labels and append
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-25, ${height / 2})`);

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  // updateToolTip function 
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  // // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
  //     // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

  //       // replaces chosenXAxis with value
        chosenXAxis = value;

  //       // functions here found above csv import
  //       // updates x scale for new data
        xLinearScale = xScale(peopleData, chosenXAxis);

  //       // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

  //       // updates circles and text with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //       // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  //       // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // // y axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
  //     // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

  //       // replaces chosenYAxis with value
        chosenYAxis = value;

  //       // functions here found above csv import
  //       // updates x scale for new data
        YLinearScale = yScale(peopleData, chosenYAxis);

  //       // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

  //       // updates circles and text with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //       // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  //       // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

}).catch(function(error) {
  console.log(error);
});
