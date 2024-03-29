let n = 25;

// Generate static colors for each node
let colorArr = ["#f4acb7", "#f15bb5", "#fee440", "#baf2d8", "#faa307"];
// colorArr = ["#b7094c", "#a01a58", "#892b64", "#723c70", "#5c4d7d", "#455e89", "#2e6f95", "#1780a1", "#0091ad"];
// colorArr = ["#fdc5f5", "#f7aef8", "#b388eb", "#8093f1", "#72ddf7"]

let staticColors = []
for (i =0; i< n*n; i++) {
  staticColors.push(colorArr[ Math.floor(Math.random() * colorArr.length)])
}

// Create nodes and links
let nodes = d3.range(n * n).map(function(i) {
  return {index: i, color: staticColors[i]};
});

let links = [];

for (let y = 0; y < n; ++y) {
  for (let x = 0; x < n; ++x) {
    if (y > 0) links.push({source: (y - 1) * n + x, target: y * n + x});
    if (x > 0) links.push({source: y * n + (x - 1), target: y * n + x});
  }
}

let simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-30))
    .force("link", d3.forceLink(links).strength(1).distance(20).iterations(10))
    .force("gravity", d3.forceY(height).strength(0.01))
    .force("floor", d3.forceY(height).strength(-0.005) )
    .on("tick", ticked);

let simulation1 = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-5))
    .force("link", d3.forceLink(links).strength(1.0005).distance(20).iterations(10))
    .force("gravity", d3.forceY(height).strength(0.005))
    .force("floor", d3.forceY(height).strength(-0.005) )
    .on("tick", ticked);
    // .stop();

var canvas = document.querySelector("canvas"), //get canvas DOM element, not d3 canvas selection
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height;

// When a drag event listener is invoked, d3.event is set to the current drag event
// and its exposed fields include: target, type, subject, x, y, dx, dy, identifier, active and sourceEvent.
let wrapped_drag =
    d3.drag()       //create a drag function_object
        .container(canvas)
        //set container to determine the coordinate system of subsequent drag events
        //this will affect event.x and event .y
        .subject(dragsubject) //set the subject of the draw
        .on("start", dragstarted)
        .on("drag", dragging)
        .on("end", dragended);

d3.select(canvas)
    .call(wrapped_drag) //call the drag function_object

function ticked() {
  context.clearRect(0, 0, width, height);  //clear the context
  context.save(); //push onto stack a log of the contect's current settings (subpath list, strokestyle, etc)
  context.translate(width / 2, height / 2); //POSITION drawing in center

  context.beginPath(); //empty context's list of subpaths and start a new path
  links.forEach(drawLink);
  context.strokeStyle = "#aaa"; //set stroke color
  context.stroke(); //stroke the current subpaths with current stroke

  nodes.forEach(drawNode);
  // context.fill();
  // context.strokeStyle = "#aaa"; //set stroke color
  // context.stroke();

  context.restore(); //restore the drawing style to the last (read: top) element on the context state stack
}

function dragsubject() {
  return simulation1.find(d3.event.x - width / 2, d3.event.y - height / 2);
  //return the nearest element to the drag coordinates
}

function dragstarted() {
  if (!d3.event.active) // see drag event creation for more accessible fields
  simulation.stop();  //stop the force simulation
  simulation1.alphaTarget(0.4).restart();  //set the sim's target alpha and energize the sim.
  d3.event.subject.fx = d3.event.subject.x; //
  d3.event.subject.fy = d3.event.subject.y;
}

function dragging() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active)
  simulation1.stop();
  simulation.alphaTarget(0.01).restart();
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y); //create new subpath at specified point
  context.lineTo(d.target.x, d.target.y); // draw line to the specified point
}

 function drawNode(d) {
  context.beginPath();
  let r = 5
  let startAngle = 0
  let endAngle = 2 * Math.PI
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, r, startAngle, endAngle);
  context.fillStyle = d.color
  context.fill()
  context.strokeStyle = d.color
  context.stroke()

  // create circular arc centered at points, of radius _r_,
  //with start angle _start_, and end angle endAngle
}
