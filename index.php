<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Belle II Particle Discovery</title>
  <link rel="stylesheet" type="text/css" href="masterclass.css">
  <script src="js/blockly_compressed.js"></script>
  <script src="js/blocks_compressed.js"></script>
  <script src="js/javascript_compressed.js"></script>
  <script src="js/en.js"></script>
  <script src="js/belle2_def.js"></script>
  <script src="js/belle2_gen.js"></script>  
  <script src="js/workspace.js"></script>
  <script src="js/FileSaver.min.js"></script>
  
<style>
table {
    border-collapse: collapse;
    width: 100%;
}

th, td {
    padding: 0px;
    text-align: right;
}

tr:hover{background-color:#ffffff}
</style>

  <script src="js/Blob.js"></script>

  
<!-- <script type="text/javascript" src="js/JSRootCore.js?2d&onload=startGUI""></script> -->
   <script type="text/javascript" src="https://root.cern/js/latest/scripts/JSRootCore.js?2d&onload=startGUI"></script> 	
  <script type = "text/javascript" 	language = "javascript">
		 
var es;
function addLog(message) {
   var r = document.getElementById('results');
   r.insertAdjacentHTML('beforeend', message +'<br/>');
}

function showStat(message) {
    var r = document.getElementById('sbar');
    r.innerHTML = message ;
}



function startGUI() {
        // d3.select('html').style('height','100%');
        // d3.select('body').style({'min-height':'100%', 'margin':'0px', "overflow" :"hidden"});
        //        var r = document.getElementById('results'); 
        //        r.style.display = 'none';
        var r0 = document.getElementById('sbar'); 
        r0.style.display = 'none';
        JSROOT.gStyle.fOptFit = 1111;

}


function fitpanel(oFormElement)
{
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
        var event  = JSON.parse(xhr.responseText);        
        var result = event.data;
        var th1    = JSROOT.parse(result.message);
        var hname  = th1.fName;
        var r      = document.getElementById('drawing');
        if (document.getElementById(hname) == null ){
          r.insertAdjacentHTML('beforeend', '<div id="' + hname +'" style="width:80%; height:80%;"></div><br/>');
        }
        var hframe = document.getElementById(hname);
        hframe.innerHTML = '';
//        https://github.com/root-project/jsroot/issues/42
       
        JSROOT.draw(hname, th1, "hist");
        JSROOT.gStyle.fOptFit = 1111;
        JSROOT.draw(hname, th1, "func");

        
        document.getElementById('data'+ hname).value=result.message;
        //frame.scrollIntoView();
    }
  }
  xhr.open (oFormElement.method, oFormElement.action, true);

  var data = new FormData (oFormElement);  
  xhr.send (data);
  
  return false; // Markus had to return true
}



function startTask() {
        
        var r = document.getElementById('results');
        //if ( r.style.display == 'none' ) switchTask();
        r.innerHTML = '';
        var btnstart = document.getElementById('btnstart'); 
        btnstart.value= "Stop Analysis";
        
       
        document.getElementById('drawing').innerHTML = '';

        Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
        var code = Blockly.JavaScript.workspaceToCode(workspace);
	    code = code.replace(/\(|\)/gi, '');
		
	addLog(code + '<br>');
       //addLog(JSON.stringify(code)+ '<br>');
        es = new EventSource('runscript.php?code='  + code  );
         
       //a message is received
        es.addEventListener('message',EventListener);      
        es.addEventListener('error', function(e) {
        addLog('Error occurred');
        stopTask();
        //es.close();
    });
}

function startAction() {
   var btnstart = document.getElementById('btnstart');
   if (btnstart.value=== "Stop Analysis"){
     stopTask();
   } else {
     startTask();
   }
}

function toProcess() {
   window.location.hash='#btnstart';
   //window.location.hash='#blocklyDiv';
}

function showDebug() {
   var btnstart = document.getElementById('btndebug');
   var div  = document.getElementById('results');

   if (btnstart.value=== "Show Text"){
     btnstart.value = "Hide Text";
     div.style.display = 'block';
   } else {
     btnstart.value = "Show Text";
     div.style.display = 'none';
   }
}

function showLicense() {
  window.location.href="license.html";
}


function EventListener(e) {
//addLog(JSON.stringify(e) );

var result = JSON.parse( e.data );

        if(e.lastEventId == 'CLOSE') {
            //addLog('Received CLOSE closing');
            stopTask();
//            es.close();
            
            var pBar = document.getElementById('progressor');
            pBar.value = pBar.max; //max out the progress bar
            var perc = document.getElementById('percentage');
            perc.innerHTML   =  "100%";
            perc.style.width = (Math.floor(pBar.clientWidth * (0.5)) + 15) + 'px';
        }   else {
            if(e.lastEventId == '0' ) {
              addLog(result.message); 
            } else {
              if(e.lastEventId == '2' ) {
                showStat(result.message); 
              } else {
                var jsonobj = JSROOT.parse(result.message);
                var sframe = jsonobj.fName;
               
        
                //addLog('Histogram :'+ sframe );
                //var r = document.getElementById('results');
                var r = document.getElementById('drawing');
                if (document.getElementById(sframe) == null ){
                  console.log('insert HTML')
                  r.insertAdjacentHTML('beforeend', '<div id="' + sframe +'" style="width:1000px; height:600px"></div><br/>');
                  r.insertAdjacentHTML('beforeend', '<div id="fit' + sframe +'" style="display: none"></div><br/>');
                  var fit = document.getElementById('fit'+ sframe);
                  mform ='<form method="post" action="th1fit.php" onsubmit="return fitpanel(this);">';
                  mform += '  Function:<input type="text"  size="20"  value="gaus"    name="fitfun" /><br/>';
                  mform += '  Range: min=<input type="text" size="2" value="0"   name="min" />';
                  mform += '  max=<input type="text" size="2"  value="20"   name="max" /><br/>';
                  mform += '  Initial parameters (separated by ,)<input type="text" size="20" value=""    name="prm" /><br/>';
                  mform += '  <input id="data'+ sframe +'" type="hidden" value="'+ result.message +'" name="data" />';
                  mform += '  <input type="hidden" value="'+ sframe +'"    name="name" />';
                  mform += '  <input class="mybutton" type="submit" value="  Fit  "/>';
                  mform += '</form>';
                  fit.insertAdjacentHTML('beforeend', '<div id="param' + sframe +'"></div><br/>');
                  fit.insertAdjacentHTML('beforeend', mform);
                  r.insertAdjacentHTML('beforeend','<input type="button" onclick="togglevisibility(\'fit'+sframe+'\');"  class="mybutton" value="Show/Hide Fit Panel" />' );
                  r.insertAdjacentHTML('beforeend','&nbsp;<input type="button" onclick="toProcess();"  class="mybutton" value="To Process" /><hr/>' );
                  document.getElementById('data'+ sframe).value=result.message;
                  //r.insertAdjacentHTML('beforeend', JSON.stringify(result.message));
                }
                var frame = document.getElementById(sframe);
        
                JSROOT.redraw(sframe, jsonobj, "hist");
               

                frame.scrollIntoView();
              }
            }
            var pBar = document.getElementById('progressor');
            pBar.value = result.progress;
            var perc = document.getElementById('percentage');
            perc.innerHTML   = result.progress  + "%";
            perc.style.width = (Math.floor(pBar.clientWidth * (result.progress/100)) + 15) + 'px';
        }
}


  
function stopTask() {
    es.close();
    //addLog('Task end');
    var btnstart = document.getElementById('btnstart');
    
    btnstart.value= "Run Analysis";

}

	
/*
    function switchTask() {
    var div  = document.getElementById('results');
    var divs  = document.getElementById('sbar');
    var div0 = document.getElementById('blocklyDiv');

    if (div.style.display !== 'none') {
        div.style.display = 'none';
        divs.style.display = 'none';
        div0.style.display = 'block';
    }
    else {
        div.style.display = 'block';
        divs.style.display = 'block';
        div0.style.display = 'none';
    }

  }
*/


function togglevisibility( name ) {
    var div  = document.getElementById(name);
    if (div.style.display !== 'none') {
        div.style.display = 'none';
    }
    else {
        div.style.display = 'block';
    }
}


function readSingleFile(e) {

  var div0 = document.getElementById('blocklyDiv');
  //if (div0.style.display === 'none') switchTask();

  var file = e.target.files[0];
  if (!file) {
   return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);

  };
  reader.readAsText(file);

}

function displayContents(contents) {

workspace.clear();
var xml = Blockly.Xml.textToDom(contents);
Blockly.Xml.domToWorkspace(xml, workspace);

}


function loadDoc( url ) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
     if (xhttp.readyState == 4 && xhttp.status == 200) {
        return xhttp.responseText;
     }
  }
  xhttp.open("GET", url, false); // !!! should be in synchronous mode 
  xhttp.send();
  return xhttp.onreadystatechange();
}

 function showCode() {
      // Generate JavaScript code and display it.
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      var code = Blockly.JavaScript.workspaceToCode(workspace);
	  //var code = Blockly.JSON.fromWorkspace( workspace ); 
	  //var code =  Blockly.Xml.domToPrettyText(workspace );
      code = code.replace(/\(|\)/gi, '');
      console.log(code);
      console.log(code.length);  
      alert(code);
  
  }


  function saveBlockly(){
    //  https://eligrey.com/blog/saving-generated-files-on-the-client-side/

    var xml = Blockly.Xml.workspaceToDom(workspace);
    var txt = Blockly.Xml.domToText(xml);
    
//  var txt=Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)); // exports workspace as pretty xml
  console.log(txt);
  var blob = new Blob([txt], {type: "text/xml"});
  saveAs(blob, "test.blab2");
  }

  function loadBlockly(){
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace,$("#hiBlocks")[0]); // loads xml from dom into workspace  
  }

    function runCode() {
      // Generate JavaScript code and run it.
      window.LoopTrap = 1000;
      Blockly.JavaScript.INFINITE_LOOP_TRAP =
          'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
      var code = Blockly.JavaScript.workspaceToCode(workspace);
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      try {
        eval(code);
      } catch (e) {
        alert(e);
      }
    }
   

  </script>
	  	  
</head>
<body>
  <h1>Belle II Particle Discovery: Describe process &rarr;Analyse &rarr;Fit results &rarr;Discover</h1>
<!--        <input type="button" onclick="showCode();"  class="mybutton" value="Show JavaScript" /> -->
        <input type="button" id="btnstart" onclick="startAction();"  class="mybutton" value="Run Analysis" />
      
        <input type="button" onclick="saveBlockly();"  class="mybutton" value="Save Diagram" />
        <form style="display:inline;"><label for="file-input" class="mybutton" style="">Load Diagram</label>
        <input type="button" id="btndebug" onclick="showDebug();"  class="mybutton" value="Hide Text" /> 
        &nbsp;&nbsp;&nbsp;<input type="button" id="btnhelp" onclick="window.location.href='BelleIILabManual.pdf';"  class="mybutton"  value="Help" />
        &nbsp;&nbsp;&nbsp;<input type="button" id="btnabout" onclick="showLicense();"  class="mybutton"  value="About" /> 
	<input type="file" style="visibility:hidden;" id="file-input" onClick="this.form.reset()" data-buttonText="Load Diagram"/></form>
        <br/>
        <progress id='progressor' value="0" max='100' style="width:95%"></progress>  
        <span id="percentage" style="text-align:right; display:block; margin-top:5px;">0</span>
        <p id="sbar" ></div>	  

	<br />

 <div id="results" style="border:1px solid #000; padding:10px; width:95%; height:80% ; overflow:auto; background:#eee;"></div>
  <br />
 <div id="blocklyDiv" style="height:900px; width:95%"></div><br />
 
  <script>
    
    document.getElementById('file-input').addEventListener('change', readSingleFile, false);

  var toolbox = loadDoc("toolbox.xml");

var options = { 
	toolbox : toolbox, 
	collapse : true, 
	comments : true, 
	disable : true, 
	maxBlocks : Infinity, 
	trashcan : true, 
	horizontalLayout : false, 
	toolboxPosition : 'start', 
	css : true, 
/*	media : '../media/', */ 
	rtl : false, 
	scrollbars : true, 
	sounds : true, 
	oneBasedIndex : true, 
	zoom : {
		controls : true, 
		wheel : true, 
		startScale : 1, 
		maxcale : 3, 
		minScale : 0.3
  },
  grid:
  {spacing: 20,
  length: 3,
  colour: '#ccc',
  snap: true}
};

var workspace = Blockly.inject('blocklyDiv', options);

<?php

 if (isset($_GET["decay"])){
   $decay =  $_GET["decay"];
 } else  {
   $decay = "data/sample.blab2";
 }
// echo "var workspaceBlocks = loadDoc( \"$decay\");"
/* Load blocks to workspace. */
 echo "displayContents( loadDoc( \"$decay\"));"

?> 

//displayContents(workspaceBlocks);
    </script>
 <div id="drawing"></div>
<?php 
$hostname = gethostname();
if ($hostname != "belle2.ijs.si") {
  echo "<a href='update.php'>Update code from the central server</a>";
}
?>
</body>
</html>
