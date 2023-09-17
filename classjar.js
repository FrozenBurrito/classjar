var snackbarTimeout;

function showSnackbar(snackbarType) {
  clearTimeout(snackbarTimeout);
  x = document.getElementById("snackbar");
  if (snackbarType == "error") {
    x.style.background = "red";
  }
  else {
    x.style.background = "#333";
  }
  x.className = "show";
  snackbarTimeout = setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}

function clearJar() {
  // there are 9 walls, all other bodies are circles
  // while is needed because subseequent lines do not clear jar completely
  while (engine.world.bodies.length > 9) {
    engine.world.bodies.forEach((body)=>{
      if (body.date) {
        Matter.Composite.remove(engine.world, body)
      }
    });
  }
}

function fillJar() {
  // add balls from user's Google Sheet
  // https://github.com/fureweb-com/public-google-sheets-parser
  var spreadsheetUrl = document.getElementById("sheet_url").value;
  // See https://stackoverflow.com/questions/16840038/easiest-way-to-get-file-id-from-url-on-google-apps-script
  var spreadsheetId = spreadsheetUrl.match(/[-\w]{25,}/);
  console.log(spreadsheetId);
  if(spreadsheetId == "" || spreadsheetId == null) {
    document.getElementById("date").innerHTML = "Error: ";
    document.getElementById("desc").innerHTML = "Unable to load spreadsheet. Please check the link and try again.";
    showSnackbar("error");
    return;
  }
  try {
    var parser = new PublicGoogleSheetsParser();
    parser.parse(spreadsheetId).then((items) => {
      clearJar();
      for(var i = 0; i < items.length; i++) {
        Composite.add(engine.world, [
          Bodies.circle(400, 250, items[i].size*10, {
            date: items[i].date,
            desc: items[i].desc,
          })
        ]);
      }
    });
  }
  catch {
    document.getElementById("date").innerHTML = "Error: ";
    document.getElementById("desc").innerHTML = "Unable to load spreadsheet. Please try again.";
    showSnackbar("error");
  }
}

function loadExample() {
  // add balls from example Google Sheet
  // https://github.com/fureweb-com/public-google-sheets-parser
  clearJar();
  const spreadsheetId = '1NcR-UuokzipcBvLNYg9BrT2SFD-EMqMmu1lIQR7JQ_s';
  const parser = new PublicGoogleSheetsParser();
  try {
    parser.parse(spreadsheetId).then((items) => {
      clearJar();
      for(var i = 0; i < items.length; i++) {
        Composite.add(engine.world, [
          Bodies.circle(400, 250, items[i].size*10, {
            date: items[i].date,
            desc: items[i].desc,
          })
        ]);
      }
    });
  }
  catch {
    document.getElementById("date").innerHTML = "Error: ";
    document.getElementById("desc").innerHTML = "Unable to load spreadsheet. Please try again.";
    showSnackbar("error");
  }
}

// matter.js module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Svg = Matter.Svg;

// create an engine
var engine = Engine.create(),
    world = engine.world;

// create a renderer
var container = document.getElementById("matterjs");
var render = Render.create({
    element: container,
    engine: engine,
    options: {
      background: 'transparent',
      width: 800,
      height: 600,
      showAngleIndicator: false,
      showVelocity: false,
      wireframes: false,
      showIds: false,
    }
});

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;
  
// add jar (walls)
Composite.add(engine.world, [
    // top of jar
    Bodies.rectangle(400, 25, 550, 12, { isStatic: true }),
    Bodies.rectangle(175, 100, 100, 12, { isStatic: true }),
    Bodies.rectangle(625, 100, 100, 12, { isStatic: true }),
    Bodies.rectangle(125, 62, 12, 87, { isStatic: true }),
    Bodies.rectangle(675, 62, 12, 87, { isStatic: true }),
    // bottom
    Bodies.rectangle(400, 600, 400, 25, { isStatic: true }),
    // right
    Bodies.rectangle(600, 400, 12, 600, { isStatic: true }),
    // left
    Bodies.rectangle(200, 400, 12, 600, { isStatic: true }),
    // goal line
    Bodies.rectangle(400, 175, 500, 1, { 
      isStatic: true, 
      render: {
         fillStyle: 'red',
         strokeStyle: 'blue',
         lineWidth: 1
      },
      collisionFilter: {
        'group': -1,
        'category': 2,
        'mask': 0,
      }    
    })
]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// if a body is clicked, display associated data.
Matter.Events.on(runner, "tick", event => {
  if (mouseConstraint.body) {
     document.getElementById("date").innerHTML = mouseConstraint.body.date;
     document.getElementById("desc").innerHTML = mouseConstraint.body.desc;
     showSnackbar("data");
  }
});

// run the engine
Runner.run(runner, engine);