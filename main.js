

const margin = ({ top: 20, right: 20, bottom: 20, left: 20 })
const width = 1000 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg
    .attr("viewBox", [0, 0, width, height]);


d3.json('airports.json', d => {
    return d3.autoType(d)
}).then(airports => { 
    d3.json('world-110m.json', d=> {
        return topojson.feature(d);
    }).then(worldmap =>{

        

        console.log("world map: ", worldmap)
        var data = topojson.feature(worldmap, worldmap.objects.countries)
        console.log(data)


        var projection = d3.geoMercator()
                .fitExtent([[0, 0], [width, height]], data)

        console.log("features: ", projection)
        var path = d3.geoPath()
            .projection(projection)
        
        console.log("features: ", projection)
        //console.log(path)
        console.log(Object.values(data)[1])
        

        svg.append("path")
            .attr("d", path(data))


        svg.append("path")
            .datum(topojson.mesh(worldmap, worldmap.objects.countries))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);











        //////////////////////////////////////////////////////
        //                                                  //
        /////////////////////////////////////////////////////
        // const links = data.links.map(d => Object.create(d));
        // const nodes = data.nodes.map(d =>data.nodes);
        const nodes = airports.nodes;
        const links = airports.links;


        console.log("links: ", links)
        console.log("nodes: ", nodes)

        var scaleCircle = d3.scaleLinear()
                    .domain(d3.extent(airports.nodes, function(d){
                        return d.passengers;
                    }))
                    .range([3, 12])

        console.log("1: ", d3.forceSimulation(nodes))
        console.log("2: ", d3.forceSimulation(nodes).force("link", d3.forceLink(links)))
        const force = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            
        console.log("force: ", force)


        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        let drag = force => {
            return d3.drag()
                .filter(event => visType === "force")
                .on("start", function (e) {
                    if (!e.active) force.alphaTarget(0.3).restart();
                    e.subject.fx = e.subject.x;
                    e.subject.fy = e.subject.y;
                })
                .on("drag", function (e) {
                    e.subject.fx = event.x;
                    e.subject.fy = event.y;
                })
                .on("end", function (e) {
                    if (!e.active) force.alphaTarget(0);
                    e.subject.fx = null;
                    e.subject.fy = null;
                })
        }
        // var visType = "force"
        


        const node = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", function(d){
                return scaleCircle(d.passengers)
            })
            .attr("fill", "gold")
            .call(drag(force));

        node.append("title")
            .text(d => d.id);

        force.on("tick", () => {
            

            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            
            
            
            
            
        });


        console.log("nodes: ", nodes)

        console.log('Here: ',d3.selectAll("input"))
        document.getElementById("force").checked = true;
        svg.selectAll("path")
            .attr("opacity", 0)
        var visType = "force"

    d3.selectAll("input").on("change", event => {
        //console.log("changed")
        visType = event.target.value;// selected button
        
        console.log("here, vistype is: ", visType)
            switchLayout();
    });

    function switchLayout() {
        if (visType === "map") {
            
            
                
        
            
            force.alpha(1).stop()
            

            // set the positions of links and nodes based on geo-coordinates
            d3.selectAll("circle")
                .on("mouseover", function (e, d) {
                    // console.log("d: ", d, " e : ", e)
                    d3.select('.tooltip')
                        .attr("display", "block")
                        .html(`${d.name}`)
                        .style("left", (e.screenX - 100 + "px"))
                        .style("font-family", "Gill Sans")
                        .style("font-size", "12px")
                        .style("background-color", "lightgray")
                        .style("opacity", 1)
                        .style("color", "black")
                        .style("top", (e.screenY - 170 + "px"));
                
                })
                .on("mouseout", function (e, d) {
                    d3.select('.tooltip')
                        .attr("display", "none")
                        .html("");
                })
            d3.selectAll("circle")
                .transition()
                .duration(750)
                .ease(d3.easeLinear)
                .attr("cx", function(d){
                    //console.log("d for x coord is: ", d)
                    d.x = projection([d.longitude, d.latitude])[0]; // update x and use it for cx
                    //console.log(d.x)
                    return d.x;

                })
                .attr("cy", function (d) {
                    //console.log("d for x coord is: ", d)
                    d.y = projection([d.longitude, d.latitude])[1]; // update x and use it for cx
                    //console.log(d.x)
                    return d.y;

                })
        
            d3.selectAll("line")
                .transition()
                .duration(750)
                .ease(d3.easeLinear)
                    .attr("x1", function (d) {
                        //console.log(d)
                        //console.log(projection([d.source.longitude, d.source.latitude]))
                        return projection([d.source.longitude, d.source.latitude])[0];
                    })
                    .attr("y1", function (d) {
                        return projection([d.source.longitude, d.source.latitude])[1];
                    })
                    .attr("x2", function (d) {
                        return projection([d.target.longitude, d.target.latitude])[0];
                    })
                    .attr("y2", function (d) {
                        return projection([d.target.longitude, d.target.latitude])[1];
                    });
            
            
            

            
        
        
            // set the map opacity to 1
            svg.selectAll("path")
                .transition()
                .duration(400)
                .attr("opacity", 1)

        } else { 
            // force layout

            // force.force("link", d3.forceLink(links).id(d => d.id))
            //     .force("charge", d3.forceManyBody())
            //     .force("center", d3.forceCenter(width / 2, height / 2));
            
            force.alpha(1)
                .restart();
            
            
            // restart the simulation
            // set the map opacity to 0
            svg.selectAll("path")
                .transition()
                .duration(500)
                .attr("opacity", 0)


        }
    }// end of switch layout 




    })
    

    
    
});