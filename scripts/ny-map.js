//NY District Voter Map
let nymap = d3.select("#ny-vote2016-diagram");
const nywidth = d3.select("#ny-vote2016-diagram").attr("width");
const nyheight = d3.select("#ny-vote2016-diagram").attr("height");
//
d3.json("data/new_york_districts.json") .then( (data) => {
nyd = data;
var districts = topojson.feature(nyd, nyd.objects.districts);
let projection = d3.geoMercator().fitSize([nywidth, nyheight], districts);
let path = d3.geoPath().projection(projection);

//Color Scale
let colorScale = d3.scaleLinear()
                    .domain([30,50,70])
                    .range(["red", "lightgrey", "blue"])
                    .interpolate(d3.interpolateHcl)
                    .clamp(true);

// Color Map
nymap.selectAll("path").data(districts.features)
   .join("path")
   .attr("stroke", "white")
   .attr("stroke-width", 1)
   .attr("d", path)
   .style("fill", d => colorScale(d.properties.percent_clinton) );

// Mark Ithaca (Where I go to schools)
// let coords = projection( [-76.5,42.443333] );
// nymap.append("circle")
//   .attr("r", 10)
//   .attr("cx", coords[0])
//   .attr("cy", coords[1])
//   .attr("fill", "white")
//   .attr("stroke", "black");
});
