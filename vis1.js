function init() {
    // define size of plots
    let margin = {top: 20, right: 20, bottom: 20, left: 50},
        widthPC = 960,
        height = 500,
        widthSP = 600;

    // parallel coordinates SVG container
    let svgPC = d3.select("#pc").append("svg")
        .attr("width", widthPC)
        .attr("height", height)
        .append("g");

    // scatterplot SVG container and axes
    let svgSP = d3.select("#sp").append("svg")
        .attr("width", widthPC)
        .attr("height", height)
        .append("g");

    let xAxisSP, yAxisSP, xAxisLabelSP, yAxisLabelSP;

    // TODO: parse dimensions (i.e., attributes) from input file*
    let dimensions = ["dimension 1", "dimension 2", "dimension 3", "dimension 4", "dimension 5", "dimension 6"];

    const y = [];
    const xSP = [];
    const dataRender = [];
    const dimensionRender = [];
    let dots;
    let polyLines;

    //CARS
    let dataCSV = "https://raw.githubusercontent.com/marbali8/dh2321-p2/master/data/cars.csv"; //name
    let keyCSV = "name";

    d3.csv(dataCSV, function (data) {

            //fill dataRender for scatterplot
            for(let i = 0; i < data.length; i++){
                dataRender.push(new Object(data[i]));
            }

            dimensions = data.columns;
            //*HINT: the first dimension is often a label; you can simply remove the first dimension with
            dimensions.splice(0, 1);
            //console.log(dimensions)

            const line = d3.line();

            // x scaling for parallel coordinates
            const xPC = d3.scalePoint()
                .domain(dimensions)
                .range([margin.left, widthPC - margin.left - margin.right]);

            //y scalings
            //TODO: set y domain for each dimension
            for(let i = 0; i < dimensions.length; i++) {
                y[dimensions[i]] = d3.scaleLinear()
                    .domain([
                        d3.min(data,  t => +t[dimensions[i]]),
                        d3.max(data,  t => +t[dimensions[i]])
                    ])
                    .range([height - margin.bottom - margin.top, margin.top]);
            }

            dimensions = d3.keys(data[0]).filter(extract);

            function extract(d) {
                return d !== keyCSV && (y[d] = d3.scaleLinear()
                    .domain([
                        d3.min(data,  t => +t[d]),
                        d3.max(data,  t => +t[d])
                    ])
                    .range([height - margin.bottom - margin.top, margin.top]))
            }

            //fill dimensionRender for scatterplot
            for(let i = 0; i < dimensions.length; i++){
                dimensionRender.push(new Object(dimensions[i]));
            }

            console.log(dimensions);

            // create scatterplot dimension selection menu
            initMenu("scatterX", dimensions);
            initMenu("scatterY", dimensions);
            initMenu("color", dimensions, "none");
            initMenu("size", dimensions, "none");

            const readScatterX = readMenu("scatterX");
            const readScatterY = readMenu("scatterY");

            const showLabel = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("text-align", "center")
                .style("visibility", "hidden")
                .style("background", "grey")
                .style("padding", "2px")
                .style("border-radius", "8px")
                .style("word-spacing", "2px")
                .style("font-weight", "bold")
                .style("color", "white");

            // TODO: render parallel coordinates polylines
            polyLines = svgPC.append("g")
                //.attr("class", "polyLine")
                .selectAll("path")
                .data(data)
                .enter().append("path")
                .attr("class", function(d,i) { return "path" + i; })
                .style("fill", "none")
                .style("stroke", "grey")
                .on("mouseover", function (d, i) {

                    //format other polylines except selected one
                    updateMouseOverPolyLine();

                    //select polyline
                    d3.select(this)
                        .style("stroke", "blue")
                        .style("stroke-width", 3);

                    //select dot in scatterplot
                    svgSP.selectAll(".circle" + i)
                        .style("stroke", "blue")
                        .style("stroke-width", 3);

                    //show label
                    showLabel.style("visibility", "visible");

                    //show text based on data
                    if(dataCSV.includes("cars.csv")){
                        showLabel.text(d.name);
                    }
                    if(dataCSV.includes("flowers.csv")){
                        showLabel.text(d.species);
                    }
                    if(dataCSV.includes("nutrients.csv")){
                        showLabel.text(d.Name);
                    }
                    if(dataCSV.includes("breastCancer.csv")){
                        showLabel.text(d.ID);
                    }
                    if(dataCSV.includes("drinks.csv")){
                        showLabel.text(d.country);
                    }
                })
                .on("mousemove", function () {
                    showLabel.style("top", (d3.event.pageY-15)+"px");
                    showLabel.style("left",(d3.event.pageX+15)+"px");
                })
                .on("mouseout", function (d, i) {

                    //format polyline back to orginal state
                    updateMouseOutPolyLine();

                    //format selected polyline to orginal state
                    d3.select(this)
                        .style("stroke", "grey")
                        .style("stroke-width", 1);

                    //format selected dot to orginal state
                    svgSP.selectAll(".circle" + i)
                        .style("stroke", "black")
                        .style("stroke-width", 1);

                    //hide label
                    showLabel.style("visibility", "hidden");
                })
                .attr("d", function (d) {                                   //defines shape (d + linepath)
                    return line(dimensions.map(function (f) {
                        return [xPC(f), y[f](d[f])];
                    }))
                });

            function updateMouseOverPolyLine(){
                polyLines.data(data)
                    .style("fill", "none")
                    .style("stroke", "lightgrey");
            }

            function updateMouseOutPolyLine() {
                polyLines.data(data)
                    .style("fill", "none")
                    .style("stroke", "grey")
            }

            // parallel coordiantes axes container
            const gPC = svgPC.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function (d) {
                    return "translate(" + xPC(d) + ")";
                });

            // *HINT: to make a call for each bound data item, use .each!
            // example: http://bl.ocks.org/milroc/4254604

            // parallel coordiantes axes
            gPC.append("g")
                .attr("class", "axis")
                //.call(d3.axisLeft(y)) // TODO: call axis scale for current dimension*
                .each(function (d) {
                    d3.select(this).call(d3.axisLeft(y[d]));
                })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", margin.top / 2)
                //.text("domain name"); // TODO: get domain name from data
                .text(function (d) {
                    return d;
                });

            // x scalings for scatter plot
            // TODO: set x domain for each dimension
            for(let i = 0; i < dimensions.length; i++) {
                xSP[dimensions[i]] = d3.scaleLinear()
                    .domain([
                        d3.min(data,  t => +t[dimensions[i]]),
                        d3.max(data,  t => +t[dimensions[i]])
                    ])
                    .range([margin.left, widthSP - margin.left - margin.right]);
            }

            // scatterplot axes
            yAxisSP = svgSP.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + margin.left + ")")
                .call(d3.axisLeft(y[readScatterY]));

            yAxisLabelSP = yAxisSP.append("text")
                .style("text-anchor", "middle")
                .attr("y", margin.top / 2)
                .text(readScatterY); //set text

            xAxisSP = svgSP.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
                .call(d3.axisBottom(xSP[readScatterX]));

            xAxisLabelSP = xAxisSP.append("text")
                .style("text-anchor", "middle")
                .attr("x", widthSP - margin.right)
                .text(readScatterX); //set text

            //render dots for scatterplot
            dots = svgSP.append("g")
                .selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("class", function(d,i) { return "circle" + i; })
                //.attr("class", "circle")
                .attr("border", 3)
                .style("stroke", 'black');

            renderSP();

        });
//}


// render scatterplot
    function renderSP() {

        // TODO: get domain names from menu and label x- and y-axis
        const readScatterX = readMenu("scatterX");
        const readScatterY = readMenu("scatterY");
        const readScatterSize = readMenu("size");
        const readScatterColor = readMenu("color");

        // TODO: re-render axes
        yAxisSP.call(d3.axisLeft(y[readScatterY]));
        yAxisLabelSP.text(readScatterY);
        xAxisSP.call(d3.axisBottom(xSP[readScatterX]));
        xAxisLabelSP.text(readScatterX);

        console.log(dataRender);
        console.log(dimensionRender);

        const size = [];
        const color = [];

        //size
        for(let i = 0; i < dimensionRender.length; i++) {
            size[dimensionRender[i]] = d3.scaleLinear()
                .domain([
                    d3.min(dataRender,  t => +t[dimensionRender[i]]),
                    d3.max(dataRender,  t => +t[dimensionRender[i]])
                ])
                .range([1, 10]);
        }

        //color
        for(let i = 0; i < dimensionRender.length; i++) {
            color[dimensionRender[i]] = d3.scaleLinear()
                .domain([
                    d3.min(dataRender,  t => +t[dimensionRender[i]]),
                    d3.max(dataRender,  t => +t[dimensionRender[i]])
                ])
                .interpolate(d3.interpolateHcl)
                .range(["green", "red"]);
        }

        const showLabel = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("text-align", "center")
            .style("visibility", "hidden")
            .style("background", "grey")
            .style("padding", "2px")
            .style("border-radius", "8px")
            .style("word-spacing", "2px")
            .style("font-weight", "bold")
            .style("color", "white");

        //svgSP.selectAll(".circle").transition().duration(1000)
        dots.transition().duration(1000) //animate transitions
            .attr("cx", function(d) {
                return xSP[readScatterX](d[readScatterX]);                                  //x
            })
            .attr("cy", function(d) {                                                       //y
                return y[readScatterY](d[readScatterY]);
            })
            .attr("r", readScatterSize === "none" ? 3 : function(d) {                       //size
                return size[readScatterSize](d[readScatterSize]);
            })
            .attr("fill", readScatterColor === "none" ? "yellow" : function (d) {           //color
                return color[readScatterColor](d[readScatterColor]);
            });

        dots.on("mouseover", function (d, i) {

            //updateMouseOverDots();

            //format selected dot
            d3.select(this)
                .style("stroke", "blue")
                .style("stroke-width", 3);

            //format selected polyline
            svgPC.selectAll(".path" + i)
                .style("stroke", "blue")
                .style("stroke-width", 3);

            //show label
            showLabel.style("visibility", "visible");

            //show text depending on data
            if(dataCSV.includes("cars.csv")){
                showLabel.text(d.name);
            }
            if(dataCSV.includes("flowers.csv")){
                showLabel.text(d.species);
            }
            if(dataCSV.includes("nutrients.csv")){
                showLabel.text(d.Name);
            }
            if(dataCSV.includes("breastCancer.csv")){
                showLabel.text(d.ID);
            }
            if(dataCSV.includes("drinks.csv")){
                showLabel.text(d.country);
            }
        })
            .on("mousemove", function () {
                showLabel.style("top", (d3.event.pageY-15)+"px");
                showLabel.style("left",(d3.event.pageX+15)+"px");
            })
            .on("mouseout", function (d, i) {

                //updateMouseOutDots();

                //format selected dot to orginal state
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 1);

                //format selected polyline to orginal state
                svgPC.selectAll(".path" + i)
                    .style("stroke", "grey")
                    .style("stroke-width", 1);

                //hide label
                showLabel.style("visibility", "hidden");
            });

        function updateMouseOverDots(){
            dots.data(dataRender)
                .style("opacity", 0.5)
        }

        function updateMouseOutDots() {
            dots.data(dataRender)
                .style("opacity", 1)
        }
    }

// init scatterplot select menu
    function initMenu(id, entries, none) {
        entries.forEach(function (d) {
            $("select#" + id).append("<option>" + d + "</option>");
        });
        if (none) $("select#" + id).append("<option selected='selected'>none</option>");

        $("#" + id).selectmenu({
            select: function () {
                renderSP();
            }
        });
    }

// read current scatterplot parameters
    function readMenu(id) {
        return $("#" + id).val();
    }
}
