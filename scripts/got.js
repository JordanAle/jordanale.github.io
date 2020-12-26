//Section 1 Setup and Data Ordering
let svg = d3.select("svg");
let width = svg.attr("width");
let height = svg.attr("height");
let mask = svg.append("g")  //make and center a mask svg
  .attr("width", width)
  .attr("height", height)
  .attr("transform","translate("+width/2+","+height/2+")");

request();

async function request() {
  data = await d3.json("data/thrones-cooccur.json");
  nodes = data.nodes
  links = data.edges

  // Create data matrix

  // dict to get node index from Name
  name_index = {};
  index = 0;
  nodes.forEach( d => {
    name_index[d.Name] = index;
    name_index[index] = d.Name;
    index++;
  });

  // zeroed 2D matrix of size square of nodes.length
  matrix = [];
  for (i=0; i<nodes.length; i++){
    row =[]
    for (j=0; j<nodes.length; j++)
      { row.push(0); }
    matrix.push(row);
  }

  // fill matrix with links, zeros are fine--means links wont be drawn
  links.forEach( d=> {
    if (d.weight > 0){
    matrix[name_index[d.source]][ name_index[d.target] ] = d.weight;
    matrix[name_index[d.target]][ name_index[d.source] ] = d.weight;
    }
  });

  // SECTION 2: Chord Drawing
    radius = 150;
  // chord gen
  let chordGen = d3.chord()
    .padAngle(0.02)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)
  // outer arc gen
  let arcGen = d3.arc()
    .innerRadius(radius)
    .outerRadius(radius + 50)
  // ribbon gen
  let ribbonGen = d3.ribbon()
    .radius(radius)

  // inject generator with matrix
  let chords = chordGen(matrix);

  // outer ring
  affiliations = ["Arryn", "Baelish", "Baratheon", "Bolton", "Dothraki", "Greyjoy", "Lannister", "Maester", "Martell", "Meereen", "Night's Watch", "Reed", "Smallfolk", "Spider", "Stark", "Targaryen", "Tarth", "Tully", "Tyrell", "Wildlings"];
  // let myScheme1 = ["#ff0f0f", "#ff6b0f", "#ffc30f", "#f3ff0f", "#7fff0f", "#348f00", "#2effc4", "#00cee0","#0069e0", "#000be0", "#af8fff", "#bb3dff", "#ff3ddf", "#ba9ca5", "#8abeff", "#ffe08a", "#7a4100", "#80007d", "#0affca"];
  let myScheme2 = ["#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE7D", "#59A14F", "#8CD17D", "#B6992D", "#F1CE63","#499894", "#86BCB6", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295", "#FABFD2", "#B07AA1", "#D4A6C8", "#9D7660", "#D7B5A6"];
  let colorScale = d3.scaleOrdinal()
    .domain(affiliations)
    .range(myScheme2);

  //calculate angle for text disaply
  (chords.groups).forEach( d =>  {
    let transform = '';
    let midpoint = (d.startAngle + d.endAngle) / 2;
    let rotation = ( midpoint ) * ( 180 / Math.PI ) - 90;
    transform = transform + "rotate("+ rotation +") ";
    transform = transform + "translate("+ (radius + 55)+",0) ";
    if (rotation > 90) {
      transform = transform + "rotate(180)";
      d.anchor = "end";
    }
    d.trans = transform;
  });

  // join outer ring data to the mask
  let ring = mask.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");

  //draw the ring and chords/ribbons
  ring.append("path")
    .attr("fill", d => colorScale(  nodes[d.index].Affiliation) )
    .attr("stroke", d => colorScale( nodes[d.index].Affiliation) )
    .attr("name", d => name_index[d.index] )
    .attr("index", d => d.index )
    .attr("d", arcGen);

  let ribbons = mask.append("g")
      .selectAll("path")
      .data(chords)
      .join("path")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "none")
        .attr("fill", d => colorScale( nodes[d.source.index].Affiliation ))
        // .attr("source", d => d.source.index)
        // .attr("target", d => d.target.index)
        // .attr("i", d => )
        .attr("d", ribbonGen);

    // Section 3 Mouseover
    mask.selectAll("path").on("mouseover", emphasize);
    mask.selectAll("path").on("mouseout", demphasize);

    function emphasize(){
      name = this.getAttribute("name");
      index = this.getAttribute("index");
      if (name && index){ //if this is a ring seg
        //display text
        let ringSeg = [];
        ring.each( d=>{ if (d.index == index) {ringSeg.push(d)} }); //get the current ring segment
        ring.append("text") //
          .attr("transform", ringSeg[0].trans )
          .text(nodes[ ringSeg[0].index ].Name)
          .attr("class", "selected")
          .attr("stroke", "black")
          .attr("text-anchor", ringSeg[0].anchor);

      // console.log(this);
        //emphasize links
          selectedChords = [];
          chords.forEach( d => {
            if ( (d.source.index == index)||(d.target.index == index) ) {
              selectedChords.push(d);
            }
          });
          mask.append("g")
            .selectAll("path")
            .data(selectedChords)
            .join("path")
              .attr("fill-opacity", 1)
              .attr("fill", d => colorScale( nodes[d.source.index].Affiliation ))
              .attr("stroke", "black")
              .attr("class", "selected")
            .attr("d", ribbonGen);

        //emphasize ring
        this.setAttribute("stroke", "black");
      }
    }//end emphasize

    function demphasize(){
      name = this.getAttribute("name");
      index = this.getAttribute("index");
      if (name && index){
        this.setAttribute("stroke", this.getAttribute("fill"));
      }
      d3.selectAll(".selected").remove();
    }
}//end request()
