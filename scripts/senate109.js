// Initialize varriables
let count = 1;
let senate_svg = d3.select("svg#senate-diagram");
let senate_mask = senate_svg.append("g");
let senate_width = senate_svg.attr("width");
let senate_height = senate_svg.attr("height");
let senate_label = senate_mask.append("text").attr("id", "label");


// Create Data
  async function deliverResponse() {
    let links = await d3.csv("data/senate.109.rollcall.edges.csv");
    let nodes = await d3.csv("data/senate.109.rollcall.nodes.csv");

    // create color scale
    let colorScale = d3.scaleOrdinal()
                        .domain(["Dem", "Ind", "Rep"])
                        .range(["blue", "yellow", "red"]);
    // create x "scale"
    function partyScale(party) {
      if (party == "Dem") {
        return senate_width*.25}
      if (party == "Ind"){
        return senate_width*.5}
      if (party == "Rep"){
        return senate_width*.75}
    }

    // Initialize positions
      nodes.forEach( node => {
    node.x = senate_width/2.0 + d3.randomUniform(-100,100)();
    node.y = senate_height/2.0 + d3.randomUniform(-100,100)();
  });

  // Create force simulation
    let sim = d3.forceSimulation()
        .nodes(nodes)
        .force("links", d3.forceLink()
                          .links(links)
                          .id(d => d.icpsr))
        .force("repulse", d3.forceManyBody()
                            .strength(-50) )
        .force("ypos", d3.forceY()
                          .y(senate_height/2)
                          .strength(0.2) )
        .force("xpos", d3.forceX()
                          .x( d=> partyScale(d.party) )
                          .strength(0.2) )
        .on("tick", render);

    // Render Visuals
    function render() {
      //edges
      // if (count > 0 ) {count-=1; console.log(links);}
      senate_mask.selectAll("line")
        .data(links)
        .join(
          enter => {enter.append("line")
                  .attr("class", "edge")
          }
        )
        .attr("x1", d => d.source.x).attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y).attr("y2", d => d.target.y);

      //nodes
      senate_mask.selectAll("circle")
          .data(nodes)
          .join(
            enter => {enter.append("circle")
              .attr("fill", d => colorScale(d.party))
              .attr("stroke", "white")
              .attr("r", 6)
              .attr("cx", 0)
              .attr("cy", 0)
              .call( d3.drag()
                .on("start",dragstart)
                .on("drag",dragging)
                .on("end",dragend) )
            }
          )
          .attr("transform", d => "translate("+d.x+","+d.y+")");
    }//END render

  // Drags
    function dragstart(d) {
        if (!d3.event.active) {
        senate_label.text(d.name);
        sim.alphaTarget(0.5).restart();
    }

    d.fx = d3.event.x;
    d.fy = d3.event.y;
    senate_label.attr("x",d3.event.x ).attr("y",d3.event.y - 10);

    }
    function dragging(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      senate_label.attr("x",d3.event.x ).attr("y",d3.event.y - 10);
    }

    function dragend(d) {
      if (!d3.event.active) {
        sim.alphaTarget(0);
        senate_label.text("");
      }
      d.fx = null;
      d.fy = null;
    }

  }//END deliverResponse

  deliverResponse();
