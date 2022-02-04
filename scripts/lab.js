//LAB Color Schema Explorer
// <svg id="a2" width=440 height=440>
  // <script type="text/javascript">
   let svg = d3.select("svg#lab-explorer");
   let width = svg.attr("width");
   let height = svg.attr("height");

   //create mask for circles
   let chart = svg.append("g")
    .attr("width",width)
    .attr("height", height)
    .attr("transform", "translate("+0+","+0+")" );

  //generate data objects
    let arr = [];
    for (a=-160; a<=160; a+=16) {
      for(b=-160; b<=160; b+=16) {
        arr.push( {"a":a, "b":b} );
      }
    }
    //create scale
    let ascale = d3.scaleLinear()
      .domain([-160,160])
      .range([0,width-20]);
    let bscale = d3.scaleLinear()
      .domain([-160,160])
      .range([height-20,0]);

    showCircles(70); //invalize the circles

    //get slider values and update circles
    let slider = d3.select("p#p2").append("input").attr("type", "range").attr("min", 0).attr("max", 100).attr("id","slider");
    slider.on("input",  function() {
    showCircles(document.getElementById("slider").value);
    });

    //create circles
    function showCircles(luminosity) {
      chart.selectAll("circle")
        .data(arr)
        .join("circle")
        .attr("r", 10)
        .attr("fill", (d) => d3.lab(luminosity, d["a"], d["b"] ) )
        .attr("cx", (d) => ascale(d["a"]) )
        .attr("cy", (d) => bscale(d["b"]) )
        .attr("transform", "translate("+10+","+10+")" );
    }

  // </script>
// </svg>
