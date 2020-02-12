var funList = [0, 0, 0];
var funMatrix = [[0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]]

function initSliders(sframe){
  //console.log('CB function', sframe)
  getFunList(sframe);
  var obj = JSROOT.GetMainPainter(sframe).draw_object; //get the histogram
  //console.log(obj);
  
  //Initialise all ParameterSliders
  $( function() {
    $(".ParamSlider").each(function() { 
      var ID = String('#'+this.id);
      var n = ID.length;
      var paramName = ID.slice(6,n-3);
      //console.log(ID.slice(0,n-3));
      switch (paramName) {
        case 'Amplitude':
          var min = 0;
          var max = 10000;
          var value = 1000;
          break;

        case 'Mu':
          var min = 0;
          var max = 1;
          var value = 0;
          break;

        case 'Sigma':
          var min = 0;
          var max = 1;
          var value = 0.1;
          break;

        default:
          var min = -10;
          var max = 10;
          var value = 0;
          break;
      }

      $(this).slider({
        range: false, min: min, max: max, value:value, step: 0.001,    
        slide: function( event, ui ) {
          $( ID.slice(0,n-3) ).val(ui.value);
          calculate();
        },
        change: function( event, ui ){
          $( ID.slice(0,n-3) ).val(ui.value);
          console.log("This is a change", ID.slice(0,n-3), ID, this.id);
          calculate();
        }
      });
      setDefaultParameters(paramName);
    })
  })
  //Script for initialising range sliders
  $( function() {
    $( ".slider-range" ).slider({
      range: true,
      min: obj.fXaxis.fXmin,
      max: obj.fXaxis.fXmax,
      step: (obj.fXaxis.fXmax-obj.fXaxis.fXmin)/100,
      values: [ obj.fXaxis.fXmin, obj.fXaxis.fXmax ],
      slide: function( event, ui ) {
        document.getElementById("minRange").value = ui.values[0];
        document.getElementById("maxRange").value = ui.values[1];
        calculate();
      }
    });
    $("#minRange").val($( "#slider-range" ).slider( "values", 0));
    $("#maxRange").val($( "#slider-range" ).slider( "values", 1));
  });

  //Script for choosing polynomial order
  $( function() {
    $( "#slider-polOrder" ).slider({
      range: false,
      min: 0,
      max: 4,
      step: 1,
      value: 1,
      slide: function( event, ui ) {
        //$( "#amount" ).val( "from " + ui.values[ 0 ] + " to " + ui.values[ 1 ] );
        //document.getElementById("polOrderDisplay").value = ui.value;
        $( "#polOrderDisplay" ).val(ui.value);
        updatePolParamList(ui.value);
        calculate();
      }
    });
    $( "#polOrderDisplay" ).val( $("#slider-polOrder").slider("value") );
    updatePolParamList($("#slider-polOrder").slider("value"));
  });
}

function autoFit(){
  //works only if histogram is on canvas
  //document.getElementById('status').style.display='block';
  var xmin = parseFloat(document.getElementById("minRange").value);
  var xmax = parseFloat(document.getElementById("maxRange").value);
  
  var initParam = getManualParameters();//unused
  var data = getDataFromHisto("h0");
  var N = data.length;
  
  var x = [], y = []; //data points
  var NdataPoints = 0;
  for(var i=0; i<N; ++i){
    if( (data[i][0] > xmin) && (data[i][0] < xmax)){
      x.push(data[i][0]);
      y.push(data[i][1]);
      if(y[i]>0){NdataPoints++;}
    }
  }
  var p0 = getManualParameters();
  var maskParam = getParametersMask(); //use only these parameters, all others are fixed or un used
  var maskParamRange = getParamRangeMask();
  //console.log(maskParamRange);
  var result = fminsearch(calcMasterFun2, p0, x, y, {maxIter:100, mask:maskParam, maskBond:maskParamRange});
  var Parm0 = result[0];
  var chi2 = result[1];
  setManualParameters(Parm0, maskParam); // set parameters' values
  var obj = JSROOT.GetMainPainter("h0").draw_object;
  
  funkcija = CreateTF1Fit(Parm0);
  funkcija.fChisquare = chi2;
  funkcija.fNDF = NdataPoints-getNparameters(); //calculate ndf      
  StoreAndDrawFitFunction(obj, funkcija, [xmin, xmax], 1, "h0");
  //calculate(Parm0);//call to draw function
}

function getParamRangeMask(){
  //return mask to bond parameters and range
  var varList = ['Amplitude', 'Mu', 'Sigma', 'A0', 'A1', 'A2', 'A3', 'A4', 'AmpExp', 'K'];
  var x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var ranges = [];
  for(var i=0; i<varList.length; i++){
    //find fixed values and mask them
    if(document.getElementById('bond'+varList[i]).checked){
      x[i]=1;
      ranges.push([parseFloat(document.getElementById('Param'+varList[i]+'min').value), parseFloat(document.getElementById('Param'+varList[i]+'max').value)]);
    }else{
      ranges.push([0, 0]);
    }
  }
  return [x, ranges]
}

function calculate(h){
  //var x = parseFloat(document.getElementById("xValue").value);
  var N = 501; // number of points for function ploting
  //var funfit = document.getElementById("fitfun").value;

  var xmin = parseFloat(document.getElementById("minRange").value);
  var xmax = parseFloat(document.getElementById("maxRange").value);
  
  var parameters = [];
  parameters = getManualParameters();
  
  fitMasterFun(xmin, xmax, N, parameters);
}

function getManualParameters(){
  var parametri = [];
  var mu = parseFloat(document.getElementById("ParamMu").value);
  var sigma = parseFloat(document.getElementById("ParamSigma").value);
  var amplitude = parseFloat(document.getElementById("ParamAmplitude").value);
  parametri = [amplitude, mu, sigma];

  var n = document.getElementById("polOrderDisplay").value;
  for(var i=0; i<5; ++i){
    if(i<=n){
      parametri.push(parseFloat(document.getElementById("ParamA"+i).value));
    }else{
      parametri.push(0); //set higher orders to 0
    }
  }

  parametri.push(parseFloat(document.getElementById("ParamAmpExp").value));
  parametri.push(parseFloat(document.getElementById("ParamK").value));
  
  return parametri
}

function setManualParameters(p, mask){
  //sets the value of parameters and correct max or min value if p greater or smaller
  
  var paramNames = ["Amplitude", "Mu", "Sigma", "A0", "A1", "A2", "A3", "A4", "AmpExp", "K"];
  //console.log(mask);
  for(var i = 0; i<10; i++){
    if(mask[i]){
      document.getElementById("Param"+paramNames[i]).value = p[i];

      var max = $("#Param"+paramNames[i]+"Set").slider("option", "max");
      var min = $("#Param"+paramNames[i]+"Set").slider("option", "min");
      
      if(p[i] > max){
        $("#Param"+paramNames[i]+"Set").slider("option", "max", p[i]);
        document.getElementById("Param"+paramNames[i]+"max").value = p[i];
        
      };
      if(p[i] < min){
        $("#Param"+paramNames[i]+"Set").slider("option", "min", p[i]);
        document.getElementById("Param"+paramNames[i]+"min").value = p[i];
        
      }
      
      $("#Param"+paramNames[i]+"Set").slider("value", p[i]);
    }
  }
}

function fitMasterFun(xmin, xmax, N, parametri){
  var x = [];
  var y = [];

  for(var i = 0; i<N; i++){
    x.push((xmax-xmin)*i/N+xmin);
    y.push(calcMasterFun(x[i], parametri));
  }
  
  var data = getDataFromHisto("h0");
  var sum = 0;
  var NdataPoints = 0;
  
  for(var i=0; i<data.length; ++i){
    //calculate sum of residuals
    if( (data[i][0] > xmin) && (data[i][0] < xmax) && (data[i][1] != 0)){
      var yfit = calcMasterFun(data[i][0], parametri);
      var ydata = data[i][1];
      sum += Math.pow(ydata-yfit, 2) / ydata;
      NdataPoints++;
    }
  }
  
  var chi2 = sum.toPrecision(4);
  
  //console.log(chi2);
  //display chi^2
  document.getElementById("chi2Output").innerHTML = chi2;
  
  //calculate ndf
  var ndf = NdataPoints;
  var Nparameters = getNparameters();
  ndf -= Nparameters;

  document.getElementById("ndfOutput").innerHTML = ndf;
  document.getElementById("chi2Red").innerHTML = (chi2/ndf).toPrecision(4);

  var g = JSROOT.CreateTGraph(N, x, y);
  var isTGraphOn = JSROOT.GetMainPainter('h0').draw_object.fTGraphPlotted;
  if (typeof isTGraphOn === "undefined") {
    //TGraph does not exist yet
    var a = JSROOT.GetMainPainter('h0').draw_object;
    a.fTGraphPlotted = 0;
    JSROOT.draw("h0", g, "", function(){
      var obj = JSROOT.GetMainPainter('h0').draw_object;
      obj.fTGraphPlotted = 1;
      });
  } else {
    //replot only if TGraph is already plotted, else: it is plotting
    if(isTGraphOn==1){JSROOT.redraw("h0", g, "");}
  }

}

function getNparameters(){
  var x = 0;
  if(funList[0]==1){
    //Gaus has 3 parameters
    x += 3;
  }

  if(funList[1]){
    //Substract (polynomial order + 1)
    x += parseInt(document.getElementById("polOrderDisplay").value)+1;
  }

  if(funList[2]){
    //Exponential function has 2 parameters
    x += 2;
  }
  return x
}

function getParametersMask(){
  var x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var varList = ['Amplitude', 'Mu', 'Sigma', 'A0', 'A1', 'A2', 'A3', 'A4', 'AmpExp', 'K'];
  var i;

  if(funList[0]==1){
    //Gaus has 3 parameters
    for(i = 0; i < 3; i++){
      x[i] = 1;
    }
  }
  i = 3;
  if(funList[1]){
    //Substract (polynomial order + 1)
    var order = parseInt(document.getElementById("polOrderDisplay").value);
    for(var j=0; j < order+1; j++){
      x[i] = 1;
      i++;
    }
  }

  if(funList[2]){
    //Exponential function has 2 parameters
    x[8] = 1;
    x[9] = 1;
  }
  for(var i=0; i<varList.length; i++){
    //find fixed values and mask them
    if(document.getElementById('fix'+varList[i]).checked){
      x[i]=0;
    }
  }
  return x
}

function getDataFromHisto(divid){
  //get x and y from ploted histogram, and compute y_fit for ploted x and calculate chi^2
  var obj = JSROOT.GetMainPainter(divid).draw_object;
  var N = obj.fNcells;
  var x = [];
  var y = [];
  var data = [];
  for(var i=1; i<=N-2; ++i){
    //console.log(obj.fArray[i] + " " + obj.fXaxis.GetBinCenter(i));
    data.push([obj.fXaxis.GetBinCenter(i), obj.fArray[i]]);
    //x.push(obj.fXaxis.GetBinCenter(i));
    //y.push(obj.fArray[i]);
  }
  //console.log(x, y);
  //console.log(JSROOT.GetMainPainter(divid).draw_object);
  return data
}

function calcMasterFun(x, parametri){
  //calculates function gaus + pol + exp
  parametriGaus = [parametri[0], parametri[1], parametri[2]];
  parametriPol = [parametri[3], parametri[4], parametri[5], parametri[6], parametri[7]];
  parametriExp = [parametri[8], parametri[9]];
  //console.log(parametriExp);
  return funList[0]*gaus(x, parametriGaus) + funList[1]*pol(x, parametriPol) + funList[2]*expo(x, parametriExp);
}

function calcMasterFun2(x, parametri){
  //calculates function gaus + pol + exp, x must be vector
  return x.map(function(xi){return (calcMasterFun(xi, parametri))});
}

function pol(x, p){
  var n = p.length;
  if(n > 5){
    alert("Only pol5 is implemented");
    return "Error"
  } else {
    for(var i = n; i<5; i++){
      p[i] = 0;
    }
    return p[0] + x * p[1] + x**2 * p[2] + x**3 * p[3] + x**4 * p[4];
  }
}

function gaus(x, p){
  var amplitude = p[0]
  var mu = p[1];
  var sigma = p[2];
  
  return amplitude * Math.exp(-0.5 * Math.pow((x-mu) / sigma, 2));
}      

function expo(x, p){
  var a = p[0];
  var k = p[1];
  return a * Math.exp(k * x);
}

function divClean(divid){
  JSROOT.cleanup(divid);
}

function getFunList(sframe){
  //sframe - string name: h0, h1, ...
  //actualy does not show, but only creates funList, funList should go in TH1.funList?
  var funfit = document.getElementById("selectFitFun"+sframe).value;
  var funfit2 = funfit.split(/[ +]/);
  var implementedFun = ["gaus", "pol", "expo"] //
  var funList = [0, 0, 0];
  var k = parseInt(sframe.slice(1)); //get histogram number 0, 1, 2, ...

  for (var i = 0; i < implementedFun.length; i++) {
    if (funfit2.includes(implementedFun[i])) {
      funList[i] = 1;
      funMatrix[k][i] = 1;
      document.getElementById(implementedFun[i]+"FitPanel"+sframe).style.display = "block";
    } else {
      funList[i] = 0;
      funMatrix[k][i] = 0;
      document.getElementById(implementedFun[i]+"FitPanel"+sframe).style.display = "none";
    }
  }
  console.log('store funList in this row in matrix ', k);
  console.log('This is funMatrix', funMatrix);
  if((funMatrix[k][0]+funMatrix[k][1]+funMatrix[k][2]) == 0){ alert("These are implemented functions:\n" + implementedFun.toString()) } //
}

function updatePolParamList(n){
  //disables or enables inputs in table for diferent parameters
  if(n>=0){
    disableInput(false, "listA0");
  }else{
    disableInput(true, "listA0");
  }
  
  if(n>=1){
    disableInput(false, "listA1");
  }else{
    disableInput(true, "listA1");
  }
  
  if(n>=2){
    disableInput(false, "listA2");
  }else{
    disableInput(true, "listA2");
  }
  
  if(n>=3){
    disableInput(false, "listA3");
  }else{
    disableInput(true, "listA3");
  }
  
  if(n>=4){
    disableInput(false, "listA4");
  }else{
    disableInput(true, "listA4");
  }
  
  if(n>4){
    alert("Only pol4 is inplemented!");
  }else{
    if(n<0){alert("Error, wrong number " + n);}
  }
}

function disableInput(state, objId){
  //Change disabled state of parameters inputs
  disableParamSlider(state, objId);
  //console.log(state, objId, name);
  var obj = document.getElementById(objId).getElementsByTagName("input");//find inputs inside of row
  for (var i = 0; i < obj.length; i++) {
    obj[i].disabled = state; //set state of inputs
  }
}

function disableParamSlider(state, objId){
  //Disables slider if state is true and enables if state is false.
  var name = String(objId[objId.length-2])+ String(objId[objId.length-1]);
  switch (state) {
    case true:
      $("#Param"+name+"Set").slider("disable");
      break;
      
    case false:
      $("#Param"+name+"Set").slider("enable");
      break;

    default:
      break;
  }
}


function setDefaultParameters(name){
  //this function is used for setting parameters back to their default value after page refresh
  $( "#Param"+name).val( $("#Param"+name+"Set").slider("value") );
  $( "#Param"+name+"min" ).val( $("#Param"+name+"Set").slider("option", "min") );
  $( "#Param"+name+"max" ).val( $("#Param"+name+"Set").slider("option", "max") );
  $( "#Param"+name+"step" ).val( $("#Param"+name+"Set").slider("option", "step") );
}

function updateSetSlider(id){
  //Get id to update its slider ?min? value
 
  var last = id.id[id.id.length-1]; //it can be steP, maX or miN
  
  switch (last) {
    case "p":
      //console.log("Set step: " + id.value);
      $("#Param"+id.name+"Set").slider("option", "step", parseFloat(id.value));
      break;

    case "x":
      //console.log("Set max: " + id.value);
      $("#Param"+id.name+"Set").slider("option", "max", parseFloat(id.value));
      break;

    case "n":
      //console.log("Set min: " + id.value);
      $("#Param"+id.name+"Set").slider("option", "min", parseFloat(id.value));
      break;

    default:
      //console.log("Set value: " + id.name + " " + id.value + ", max is "+ $("#Param"+id.name+"Set").slider("option", "max"));
      if(id.value > $("#Param"+id.name+"Set").slider("option", "max")){ alert("Inserted value is to big."); }
      if(id.value < $("#Param"+id.name+"Set").slider("option", "min")){ alert("Inserted value is to small."); }
      $("#Param"+id.name+"Set").slider("value", parseFloat(id.value));
      break;
  }
}

function insertHTML(sframe, callback){
  //console.log('This is sframe:', sframe)
  var r = document.getElementById('fit'+sframe);
  var htmlCode = generateHTMLcode(sframe);
  r.insertAdjacentHTML('beforeend', htmlCode);
  if(callback!=null){callback(sframe)}
}

function generateHTMLcode(sframe){
  //console.log('generate html')
  //mform = '<div id="fith0">'' + sframe + '
  mform = '<button type="button" onclick="calculate()">Draw Function</button>';        
  mform += '<button type="button" onclick="autoFit()">Click to fit.</button>'; 
  mform += '        <div id="fitPanel">'
  mform += '          Function:'
  mform += '          <select  name="fitfun" id="selectFitFun'+sframe+'" onclick="getFunList(' + "'" + sframe + "'"+ ')">'
  mform += '            <option value="gaus">Gaus</option>'
  mform += '            <option value="pol">Poly</option>'
  mform += '            <option value="expo">Expo</option>'
  mform += '            <option value="gaus+pol">Gaus + Poly</option>'
  mform += '            <option value="gaus+expo">Gaus + Expo</option>'
  mform += '            <option value="pol+expo">Poly + Expo</option>'
  mform += '            <option value="gaus+pol+expo">Gaus + Poly + Expo</option>'
  mform += '          </select>'
  mform += '          <!--'
  mform += '            This was replaced b select:option'
  mform += '            <input type="text" name="fitfun" id="fitfun" value="pol" onblur="getFunList()"><br>'
  mform += '          -->'
  mform += '          <div id="polFitPanel' + sframe + '">'
  mform += '            Polynomial order: <input type="text" name="polOrder" id="polOrderDisplay" size="1" disabled=true>'
  mform += '            <div style="width: 100px;display: inline-block;" id="slider-polOrder"></div>'
  mform += '            <table class="inputParametersTable">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td>Fix</td>'
  mform += '                  <td>Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA0">'
  mform += '                  <td><li>A0:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA0"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA0"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0" name="A0" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0min" name="A0" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamA0Set"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0max" name="A0" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0step" name="A0" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA1">'
  mform += '                  <div id="rowA1">'
  mform += '                    <td><li>A1:</td>'
  mform += '                    <td><input type="checkbox" class="inputParamBox" id="fixA1"></td>'
  mform += '                    <td><input type="checkbox" class="inputParamBox" id="bondA1"></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1" name="A1" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1min" name="A1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                    <td><div class="ParamSlider" id="ParamA1Set"></div></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1max" name="A1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1step" name="A1" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  </div>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA2">'
  mform += '                  <td><li>A2:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA2"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA2"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2" name="A2" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2min" name="A2" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamA2Set"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2max" name="A2" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2step" name="A2" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA3">'
  mform += '                  <td><li>A3:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA3"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA3"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3"  name="A3" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3min" name="A3" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamA3Set"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3max" name="A3" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3step" name="A3" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA4">'
  mform += '                  <td><li>A4:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA4"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA4"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4" name="A4" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4min" name="A4" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamA4Set"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4max" name="A4" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4step" name="A4" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'
  mform += '          <div id="gausFitPanel' + sframe + '">'
  mform += '            <table class="inputParametersTable" id="inputParamTableGaus">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td>Fix</td>'
  mform += '                  <td>Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr id="listMu">'
  mform += '                  <td><li>&mu;:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixMu"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondMu"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMu" name="Mu" value="0" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMumin" name="Mu" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamMuSet"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMumax" name="Mu" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMustep" name="Mu" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listSigma">'
  mform += '                  <td><li>&sigma;:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixSigma"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondSigma"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigma" name="Sigma" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigmamin" name="Sigma" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamSigmaSet"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigmamax" name="Sigma" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigmastep" name="Sigma" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listAmplitude">'
  mform += '                  <td><li>A:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixAmplitude"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondAmplitude"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitude" name="Amplitude" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitudemin" name="Amplitude" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamAmplitudeSet"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitudemax" name="Amplitude" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitudestep" name="Amplitude" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'
  mform += '          <div id="expoFitPanel' + sframe + '">'
  mform += '            <table class="inputParametersTable" id="inputParamTableExpo">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td>Fix</td>'
  mform += '                  <td>Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr id="listK">'
  mform += '                  <td><li>K:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixK"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondK"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamK" name="K" value="0" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamKmin" name="K" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamKSet"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamKmax" name="K" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamKstep" name="K" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listAmpExp">'
  mform += '                  <td><li>A:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixAmpExp"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondAmpExp"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExp" name="AmpExp" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExpmin" name="AmpExp" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div class="ParamSlider" id="ParamAmpExpSet"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExpmax" name="AmpExp" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExpstep" name="AmpExp" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'
  mform += '        </div>'
  mform += '<div class="rangeSettings">';
  mform += 'Range: min = <input type="text" size="2" value="-5" name="min" id="minRange" disabled=true>';
  mform += 'max = <input type="text" size="2" value="5" name="max" id="maxRange" disabled=true>';
  mform += '<div style="display: inline-block;">';
  mform += '&nbsp; &chi;²/ndf = <output id="chi2Output"></output> / <output id="ndfOutput"></output> = <output id="chi2Red"></output> <br>';
  mform += '</div>';
  mform += '<div class="slidecontainer" style="width:600px">';
  //mform += '<div class="slider-range" id="slider-range'+sframe+'"></div>';
  mform += '<div class="slider-range" id="slider-range"></div>';
  mform += '</div>';
  mform += '      </div>'

  //mform += '</div>';
  return mform
}

