var funMatrix = [[0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]

function initSliders(sframe){
  genFunList(sframe);
  var obj = JSROOT.GetMainPainter(sframe).draw_object; //get the histogram
  
  //Initialise all ParameterSliders
  $( function() {
    $(".ParamSlider"+sframe).each(function() { 
      var ID = String('#'+this.id);
      var n = ID.length;
      var paramName = ID.slice(6,n-5);
      switch (paramName) {
        case 'Amplitude':
          var min = 0;
          var max = 10000;
          var value = 100;
          break;

        case 'Mu':
          var min = 0;
          var max = 1;
          var value = 0;
          break;

        case 'Sigma':
          var min = 0;
          var max = 1;
          var value = 0.05;
          break;

        case 'AmpBW':
          var min = 0;
          var max = 100;
          var value = 1000;
          break;

        case 'Gamma':
          var min = 0;
          var max = 1;
          var value = 0.5;
          break;

        case 'M':
          var min = 0;
          var max = 5;
          var value = 0;
          break;

        default:
          var min = -10;
          var max = 10;
          var value = 0;
          break;
      }

      $(this).slider({
        range: false, min: min, max: max, value:value, step: 0.0001,    
        slide: function( event, ui ) {
          $( ID.slice(0,n-5)+sframe ).val(ui.value);
          calculate(sframe);
        },
        change: function( event, ui ){
          $( ID.slice(0,n-5)+sframe ).val(ui.value);
          calculate(sframe);
        }
      });
      setDefaultParameters(paramName, sframe);
    })
  })
  //Script for initialising range sliders
  $( function() {
    $( "#slider-range"+sframe ).slider({
      range: true,
      min: obj.fXaxis.fXmin,
      max: obj.fXaxis.fXmax,
      step: (obj.fXaxis.fXmax-obj.fXaxis.fXmin)/1000,
      values: [ obj.fXaxis.fXmin, obj.fXaxis.fXmax ],
      slide: function( event, ui ) {
        document.getElementById("minRange"+sframe).value = ui.values[0];
        document.getElementById("maxRange"+sframe).value = ui.values[1];
        calculate(sframe);
      }
    });
    $("#minRange"+sframe).val($( "#slider-range"+sframe ).slider( "values", 0));
    $("#maxRange"+sframe).val($( "#slider-range"+sframe ).slider( "values", 1));
  });

  //Script for choosing polynomial order
  $( function() {
    $( "#slider-polOrder"+sframe ).slider({
      range: false,
      min: 0,
      max: 4,
      step: 1,
      value: 1,
      slide: function( event, ui ) {
        $( "#polOrderDisplay" + sframe ).val(ui.value);
        updatePolParamList(ui.value, sframe);
        var fName = genFunctionName(sframe);
        showFormula(fName, sframe);
        calculate(sframe);
      }
    });
    $( "#polOrderDisplay" + sframe ).val( $("#slider-polOrder"+sframe).slider("value") );
    updatePolParamList($("#slider-polOrder"+sframe).slider("value"), sframe);
  });
}

function autoFit(sframe){
  //works only if histogram is on canvas
  //document.getElementById('status').style.display='block';
  var xmin = parseFloat(document.getElementById("minRange"+sframe).value);
  var xmax = parseFloat(document.getElementById("maxRange"+sframe).value);
  
  //var initParam = getManualParameters();//unused
  var data = getDataFromHisto(sframe);
  var N = data.length;
  
  var x = [], y = []; //data points
  var NdataPoints = 0;
  for(var i=0; i<N; ++i){
    if( (data[i][0] > xmin) && (data[i][0] < xmax)){
      x.push(data[i][0]);
      y.push(data[i][1]);
      if(data[i][1]>0){NdataPoints++;}
    }
  }
  var p0 = getManualParameters(sframe);
  var maskParam = getParametersMask(sframe); //use only these parameters, all others are fixed or un used
  var maskParamRange = getParamRangeMask(sframe);
  var result = fminsearch(calcMasterFun2, p0, x, y, {maxIter:100, mask:maskParam, maskBond:maskParamRange, sframe:sframe});
  var Parm0 = result[0];
  var chi2 = result[1];
  setManualParameters(Parm0, maskParam, sframe); // set parameters' values
  var obj = JSROOT.GetMainPainter(sframe).draw_object;
  
  funkcija = CreateTF1Fit(Parm0, sframe);
  funkcija.fChisquare = chi2;
  funkcija.fNDF = NdataPoints-getNparameters(sframe); //calculate ndf
  StoreAndDrawFitFunction(obj, funkcija, [xmin, xmax], 1, sframe);
}

function getParamRangeMask(sframe){
  //return mask to bond parameters inside of range
  var varList = ['Amplitude', 'Mu', 'Sigma', 'A0', 'A1', 'A2', 'A3', 'A4', 'AmpExp', 'K', 'AmpBW', 'Gamma', 'M'];
  var x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var ranges = [];
  for(var i=0; i<varList.length; i++){
    //find fixed values and mask them
    if(document.getElementById('bond'+varList[i] + sframe).checked){
      x[i]=1;
      ranges.push([parseFloat(document.getElementById('Param'+varList[i]+'min'+sframe).value), parseFloat(document.getElementById('Param'+varList[i]+'max'+sframe).value)]);
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

  var xmin = parseFloat(document.getElementById("minRange"+h).value);
  var xmax = parseFloat(document.getElementById("maxRange"+h).value);
  
  var parameters = [];
  parameters = getManualParameters(h);
  
  fitMasterFun(xmin, xmax, N, parameters, h);
}

function getManualParameters(sframe){
  var parametri = [];
  var mu = parseFloat(document.getElementById("ParamMu"+sframe).value);
  var sigma = parseFloat(document.getElementById("ParamSigma"+sframe).value);
  var amplitude = parseFloat(document.getElementById("ParamAmplitude"+sframe).value);
  parametri = [amplitude, mu, sigma];

  var n = document.getElementById("polOrderDisplay" + sframe).value;
  for(var i=0; i<5; ++i){
    if(i<=n){
      parametri.push(parseFloat(document.getElementById("ParamA"+i+sframe).value));
    }else{
      parametri.push(0); //set higher orders to 0
    }
  }

  parametri.push(parseFloat(document.getElementById("ParamAmpExp"+sframe).value));
  parametri.push(parseFloat(document.getElementById("ParamK"+sframe).value));

  parametri.push(parseFloat(document.getElementById("ParamAmpBW"+sframe).value));
  parametri.push(parseFloat(document.getElementById("ParamGamma"+sframe).value));
  parametri.push(parseFloat(document.getElementById("ParamM"+sframe).value));
  
  return parametri
}

function setManualParameters(p, mask, sframe){
  //sets the value of parameters and correct max or min value if p greater or smaller
  
  var paramNames = ["Amplitude", "Mu", "Sigma", "A0", "A1", "A2", "A3", "A4", "AmpExp", "K", 'AmpBW', 'Gamma', 'M'];

  for(var i = 0; i<paramNames.length; i++){
    if(mask[i]){
      document.getElementById("Param"+paramNames[i]+sframe).value = p[i];

      var max = $("#Param"+paramNames[i]+"Set"+sframe).slider("option", "max");
      var min = $("#Param"+paramNames[i]+"Set"+sframe).slider("option", "min");
      
      if(p[i] > max){
        $("#Param"+paramNames[i]+"Set"+sframe).slider("option", "max", p[i]);
        document.getElementById("Param"+paramNames[i]+"max"+sframe).value = p[i];
        
      };
      if(p[i] < min){
        $("#Param"+paramNames[i]+"Set"+sframe).slider("option", "min", p[i]);
        document.getElementById("Param"+paramNames[i]+"min"+sframe).value = p[i];
        
      }
      
      $("#Param"+paramNames[i]+"Set"+sframe).slider("value", p[i]);
    }
  }
}

function fitMasterFun(xmin, xmax, N, parametri, sframe){
  var x = [];
  var y = [];

  for(var i = 0; i<N; i++){
    x.push((xmax-xmin)*i/N+xmin);
    y.push(calcMasterFun(x[i], parametri, sframe));
  }
  
  var data = getDataFromHisto(sframe);
  var sum = 0;
  var NdataPoints = 0;
  
  for(var i=0; i<data.length; ++i){
    //calculate sum of residuals
    if( (data[i][0] > xmin) && (data[i][0] < xmax) && (data[i][1] != 0)){
      var yfit = calcMasterFun(data[i][0], parametri, sframe);
      var ydata = data[i][1];
      sum += Math.pow(ydata-yfit, 2) / ydata;
      NdataPoints++;
    }
  }
  
  var chi2 = sum.toPrecision(4);
  //display chi^2
  document.getElementById("chi2Output"+sframe).innerHTML = chi2;
  
  //calculate ndf
  var ndf = NdataPoints;
  var Nparameters = getNparameters(sframe);
  ndf -= Nparameters;

  document.getElementById("ndfOutput"+sframe).innerHTML = ndf;
  document.getElementById("chi2Red"+sframe).innerHTML = (chi2/ndf).toPrecision(4);
  
  var g = JSROOT.CreateTGraph(N, x, y);
  var isTGraphOn = JSROOT.GetMainPainter(sframe).draw_object.fTGraphPlotted;
  if (typeof isTGraphOn === "undefined") {
    //TGraph does not exist yet
    var a = JSROOT.GetMainPainter(sframe).draw_object;
    a.fTGraphPlotted = 0;
    JSROOT.draw(sframe, g, "", function(){
      var obj = JSROOT.GetMainPainter(sframe).draw_object;
      obj.fTGraphPlotted = 1;
      });
  } else {
    //replot only if TGraph is already plotted, else: it is plotting
    if(isTGraphOn==1){JSROOT.redraw(sframe, g, "");}
  }

}

function getNparameters(sframe){
  var x = 0;
  var funList = getFunList(sframe);
  if(funList[0]==1){
    //Gaus has 3 parameters
    x += 3;
  }

  if(funList[1]){
    //Substract (polynomial order + 1)
    x += parseInt(document.getElementById("polOrderDisplay" + sframe).value)+1;
  }

  if(funList[2]){
    //Exponential function has 2 parameters
    x += 2;
  }
  return x
}

function getParametersMask(sframe){
  //return mask to fix parameters
  var x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var varList = ['Amplitude', 'Mu', 'Sigma', 'A0', 'A1', 'A2', 'A3', 'A4', 'AmpExp', 'K', 'AmpBW', 'Gamma', 'M'];
  var i;
  var funList = getFunList(sframe);
  if(funList[0]==1){
    //Gaus has 3 parameters
    for(i = 0; i < 3; i++){
      x[i] = 1;
    }
  }
  i = 3;
  if(funList[1]){
    //Substract (polynomial order + 1)
    var order = parseInt(document.getElementById("polOrderDisplay" + sframe).value);
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

  if(funList[3]){
    //BW function has 3 parameters
    x[10] = 1;
    x[11] = 1;
    x[12] = 1;
  }

  for(var i=0; i<varList.length; i++){
    //find fixed values and mask them
    if(document.getElementById('fix'+varList[i]+sframe).checked){
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
    data.push([obj.fXaxis.GetBinCenter(i), obj.fArray[i]]);
  }

  return data
}

function calcMasterFun(x, parametri, sframe){
  //calculates function gaus + pol + exp
  parametriGaus = [parametri[0], parametri[1], parametri[2]];
  parametriPol = [parametri[3], parametri[4], parametri[5], parametri[6], parametri[7]];
  parametriExp = [parametri[8], parametri[9]];
  parametriBW = [parametri[10], parametri[11], parametri[12]];
  var funList = getFunList(sframe);
  return funList[0]*gaus(x, parametriGaus) + funList[1]*pol(x, parametriPol) + funList[2]*expo(x, parametriExp) + funList[3]*BW(x, parametriBW);
}

function calcMasterFun2(x, parametri, sframe){
  //calculates function gaus + pol + exp, x must be vector
  return x.map(function(xi){return (calcMasterFun(xi, parametri, sframe))});
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

function BW(x, p){
  var a = p[0];
  var gamma = p[1];
  var M = p[2];
  return a / (2 * Math.PI) * gamma / (Math.pow(x-M, 2) + Math.pow(gamma/2, 2));
}

function divClean(divid){
  JSROOT.cleanup(divid);
}

function getFunList(sframe){
  //returns funList from funMatrix
  var k = parseInt(sframe.slice(1)); //get histogram number 0, 1, 2, ...
  return funMatrix[k]
}

function genFunList(sframe){
  //sframe - string name: h0, h1, ...
  //actualy does not show, but only creates funList, funList should go in TH1.funList?
  var funfit = document.getElementById("selectFitFun"+sframe).value;
  var funfit2 = funfit.split(/[ +]/);
  var implementedFun = ["gaus", "pol", "expo", "BW"] //
  var funList = getFunList(sframe);
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

  var fName = genFunctionName(sframe);
  showFormula(fName, sframe);
  if((funMatrix[k][0]+funMatrix[k][1]+funMatrix[k][2]+funMatrix[k][3]) == 0){ alert("These are implemented functions:\n" + implementedFun.toString()) } //
}

function genFunctionName(sframe){
  var funList = getFunList(sframe);
  var fName = "";
  var Npar = 0;
  if(funList[0]){
    //Gaus function
    fName =  "N \\cdot e^{-(\\frac{x-\\mu}{2 \\sigma})^2}";
    Npar += 3;
  }
  
  if(funList[1]){
    //pol function
    var n = parseInt(document.getElementById("polOrderDisplay"+sframe).value);
    
    for(var i=0; i<=n; ++i){
      if((i>0) || (Npar > 0)){
        fName += " + ";
      }

      if(i==0){
        fName += "p" + String(i);
      }else{
        if(i==1){
          fName += "p" + String(i) + " \\cdot x";
        }else{
          fName += "p" + String(i) + " \\cdot x^" + String(i);
        }
      }
    }
    Npar += n+1;
  }
  
  if(funList[2]){
    if((Npar > 0)){
      fName += " + ";
    }
    fName += "N_{exp} \\cdot e^{K \\cdot x}";
    Npar += 2;
  }

  if(funList[3]){
    if((Npar > 0)){
      fName += " + ";
    }
    fName += "N_{BW} \\cdot  \\frac{1}{2 \\pi} \\frac{\\Gamma}{(x - M_{BW})^2 + (\\Gamma/2)^2} "; // * [Gamma] / ((x - [MeanBW])^2 + ([Gamma]/2)^2)
   
    Npar += 3;
  }
  return fName;
}

function updatePolParamList(n, sframe){
  //disables or enables inputs in table for diferent parameters
  if(n>=0){
    disableInput(false, "listA0"+sframe, sframe);
  }else{
    disableInput(true, "listA0"+sframe, sframe);
  }
  
  if(n>=1){
    disableInput(false, "listA1"+sframe, sframe);
  }else{
    disableInput(true, "listA1"+sframe, sframe);
  }
  
  if(n>=2){
    disableInput(false, "listA2"+sframe, sframe);
  }else{
    disableInput(true, "listA2"+sframe, sframe);
  }
  
  if(n>=3){
    disableInput(false, "listA3"+sframe, sframe);
  }else{
    disableInput(true, "listA3"+sframe, sframe);
  }
  
  if(n>=4){
    disableInput(false, "listA4"+sframe, sframe);
  }else{
    disableInput(true, "listA4"+sframe, sframe);
  }
  
  if(n>4){
    alert("Only pol4 is inplemented!");
  }else{
    if(n<0){alert("Error, wrong number " + n);}
  }
}

function disableInput(state, objId, sframe){
  //Change disabled state of parameters inputs
  disableParamSlider(state, objId, sframe);
  var obj = document.getElementById(objId).getElementsByTagName("input");//find inputs inside of row
  for (var i = 0; i < obj.length; i++) {
    obj[i].disabled = state; //set state of inputs
  }
}

function disableParamSlider(state, objId, sframe){
  //Disables slider if state is true and enables if state is false.
  var name = String(objId[objId.length-2])+ String(objId[objId.length-1]);
  switch (state) {
    case true:
      $("#Param"+name+"Set"+sframe).slider("disable");
      break;
      
    case false:
      $("#Param"+name+"Set"+sframe).slider("enable");
      break;

    default:
      break;
  }
}


function setDefaultParameters(name, sframe){
  //this function is used for setting parameters back to their default value after page refresh
  $( "#Param"+name+sframe).val( $("#Param"+name+"Set"+sframe).slider("value") );
  $( "#Param"+name+"min"+sframe ).val( $("#Param"+name+"Set"+sframe).slider("option", "min") );
  $( "#Param"+name+"max"+sframe ).val( $("#Param"+name+"Set"+sframe).slider("option", "max") );
  $( "#Param"+name+"step"+sframe ).val( $("#Param"+name+"Set"+sframe).slider("option", "step") );
}

function updateSetSlider(id){
  //Get id to update its slider ?min? value
  var sframe = id.id.slice(id.id.length-2);
  var last = id.id[id.id.length-3]; //it can be steP, maX or miN
  switch (last) {
    case "p":
      $("#Param"+id.name+"Set"+sframe).slider("option", "step", parseFloat(id.value));
      break;

    case "x":
      $("#Param"+id.name+"Set"+sframe).slider("option", "max", parseFloat(id.value));
      break;

    case "n":
      $("#Param"+id.name+"Set"+sframe).slider("option", "min", parseFloat(id.value));
      break;

    default:
      if(id.value > $("#Param"+id.name+"Set"+sframe).slider("option", "max")){ alert("Inserted value is to big."); }
      if(id.value < $("#Param"+id.name+"Set"+sframe).slider("option", "min")){ alert("Inserted value is to small."); }
      $("#Param"+id.name+"Set"+sframe).slider("value", parseFloat(id.value));
      break;
  }
}

function insertHTML(sframe, callback){
  var r = document.getElementById('fit'+sframe);
  var htmlCode = generateHTMLcode(sframe);
  r.insertAdjacentHTML('beforeend', htmlCode);
  if(callback!=null){callback(sframe)}
}

function generateHTMLcode(sframe){

  mform = '<button type="button" onclick="calculate('+ "'" + sframe + "'"+')" style="display:none" >Draw Function</button>';        
  mform += '<button type="button" onclick="autoFit('+ "'" + sframe + "'"+')">Click to fit</button>'; 
  mform += '<div class="rangeSettings">';
  mform += 'Range: min = <input type="text" size="2" value="-5" name="min" id="minRange'+sframe+'" disabled=true>';
  mform += 'max = <input type="text" size="2" value="5" name="max" id="maxRange'+sframe+'" disabled=true>';
  mform += '<div style="display: inline-block;">';
  mform += '&nbsp; &chi;²/ndf = <output id="chi2Output'+ sframe +'"></output> / <output id="ndfOutput'+ sframe +'"></output> = <output id="chi2Red'+ sframe +'"></output> <br>';
  mform += '</div>';
  mform += '<div class="slidecontainer" style="width:600px">';
  mform += '<div class="slider-range" id="slider-range'+ sframe +'"></div>';
  mform += '</div>';
  mform += '</div>'
  mform += '        <div id="fitPanel">'
  mform += '          <div class="functionSelect">'
  mform += '            Function:'
  mform += '            <select  name="fitfun" id="selectFitFun'+sframe+'" onclick="genFunList(' + "'" + sframe + "'"+ ')">'
  mform += '              <option value="gaus">Gaus</option>'
  mform += '              <option value="pol">Poly</option>'
  mform += '              <option value="expo">Expo</option>'
  mform += '              <option value="BW">Breit-Wigner</option>'
  mform += '              <option disabled="disabled">--------</option>'
  mform += '              <option value="gaus+pol">Gaus + Poly</option>'
  mform += '              <option value="gaus+expo">Gaus + Expo</option>'
  mform += '              <option value="BW+gaus">Gaus + Breit-Wigner</option>'
  mform += '              <option value="pol+expo">Poly + Expo</option>'
  mform += '              <option value="BW+pol">Poly + Breit-Wigner</option>'
  mform += '              <option value="BW+expo">Expo + Breit-Wigner</option>'
  mform += '              <option disabled="disabled">--------</option>'
  mform += '              <option value="BW+expo+pol">Breit-Wigner + Poly + Expo</option>'
  mform += '              <option value="BW+gaus+pol">Breit-Wigner + Poly + Gaus</option>'
  mform += '              <option value="BW+expo+gaus">Breit-Wigner + Expo + Gaus</option>'
  mform += '              <option value="gaus+pol+expo">Gaus + Poly + Expo</option>'
  mform += '              <option value="BW+expo+gaus+pol">Breit-Wigner + Expo + Gaus + Poly</option>'
  mform += '            </select>'
  mform += '            <span id="functionDisplay'+sframe+'" style="font-size:32px"></span>'
  mform += '          </div>'
  mform += '          <!--'
  mform += '            This was replaced b select:option'
  mform += '            <input type="text" name="fitfun" id="fitfun" value="pol" onblur="genFunList()"><br>'
  mform += '          -->'
  mform += '          <div id="gausFitPanel' + sframe + '" class="FitPanel">'
  mform += '            <table class="inputParametersTable" id="inputParamTableGaus">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td class="hideFix-Bond">Fix</td>'
  mform += '                  <td class="hideFix-Bond">Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr id="listMu">'
  mform += '                  <td><li>&mu;:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixMu'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondMu'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMu'+sframe+'" name="Mu" value="0" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMumin'+sframe+'" name="Mu" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamMuSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMumax'+sframe+'" name="Mu" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMustep'+sframe+'" name="Mu" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listSigma">'
  mform += '                  <td><li>&sigma;:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixSigma'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondSigma'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigma'+sframe+'" name="Sigma" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigmamin'+sframe+'" name="Sigma" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamSigmaSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigmamax'+sframe+'" name="Sigma" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamSigmastep'+sframe+'" name="Sigma" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listAmplitude">'
  mform += '                  <td><li>N:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixAmplitude'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondAmplitude'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitude'+sframe+'" name="Amplitude" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitudemin'+sframe+'" name="Amplitude" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamAmplitudeSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitudemax'+sframe+'" name="Amplitude" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmplitudestep'+sframe+'" name="Amplitude" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'

  mform += '          <div id="polFitPanel' + sframe + '" class="FitPanel">'
  mform += '            Polynomial order: <input type="text" name="polOrder" id="polOrderDisplay' + sframe + '" size="1" disabled=true>'
  mform += '            <div style="width: 100px;display: inline-block;" id="slider-polOrder' + sframe + '"></div>'
  mform += '            <table class="inputParametersTable">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td class="hideFix-Bond">Fix</td>'
  mform += '                  <td class="hideFix-Bond">Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA0'+sframe+'">'
  mform += '                  <td><li>p0:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA0'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA0'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0'+sframe+'" name="A0" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0min'+sframe+'" name="A0" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamA0Set'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0max'+sframe+'" name="A0" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA0step'+sframe+'" name="A0" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA1'+sframe+'">'
  mform += '                  <div id="rowA1">'
  mform += '                    <td><li>p1:</td>'
  mform += '                    <td><input type="checkbox" class="inputParamBox" id="fixA1'+sframe+'"></td>'
  mform += '                    <td><input type="checkbox" class="inputParamBox" id="bondA1'+sframe+'"></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1'+sframe+'" name="A1" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1min'+sframe+'" name="A1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                    <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamA1Set'+sframe+'"></div></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1max'+sframe+'" name="A1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                    <td><input type="text" class="inputParam" id="ParamA1step'+sframe+'" name="A1" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  </div>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA2'+sframe+'">'
  mform += '                  <td><li>p2:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA2'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA2'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2'+sframe+'" name="A2" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2min'+sframe+'" name="A2" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamA2Set'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2max'+sframe+'" name="A2" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA2step'+sframe+'" name="A2" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA3'+sframe+'">'
  mform += '                  <td><li>p3:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA3'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA3'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3'+sframe+'"  name="A3" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3min'+sframe+'" name="A3" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamA3Set'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3max'+sframe+'" name="A3" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA3step'+sframe+'" name="A3" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr class="pol" id="listA4'+sframe+'">'
  mform += '                  <td><li>p4:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixA4'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondA4'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4'+sframe+'" name="A4" value="0" disabled=true onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4min'+sframe+'" name="A4" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamA4Set'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4max'+sframe+'" name="A4" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamA4step'+sframe+'" name="A4" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'


  mform += '          <div id="BWFitPanel' + sframe + '" class="FitPanel">'
  mform += '            <table class="inputParametersTable" id="inputParamTableBW">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td class="hideFix-Bond">Fix</td>'
  mform += '                  <td class="hideFix-Bond">Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr id="listGamma">'
  mform += '                  <td><li>&Gamma;:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixGamma'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondGamma'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamGamma'+sframe+'" name="Gamma" value="0" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamGammamin'+sframe+'" name="Gamma" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamGammaSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamGammamax'+sframe+'" name="Gamma" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamGammastep'+sframe+'" name="Gamma" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listM">'
  mform += '                  <td><li>M<sub>BW</sub>:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixM'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondM'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamM'+sframe+'" name="M" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMmin'+sframe+'" name="M" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamMSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMmax'+sframe+'" name="M" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamMstep'+sframe+'" name="M" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listAmpBW">'
  mform += '                  <td><li>N<sub>BW</sub>:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixAmpBW'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondAmpBW'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpBW'+sframe+'" name="AmpBW" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpBWmin'+sframe+'" name="AmpBW" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamAmpBWSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpBWmax'+sframe+'" name="AmpBW" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpBWstep'+sframe+'" name="AmpBW" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'

  mform += '          <div id="expoFitPanel' + sframe + '" class="FitPanel">'
  mform += '            <table class="inputParametersTable" id="inputParamTableExpo">'
  mform += '              <tbody>'
  mform += '                <tr class="description">'
  mform += '                  <td>Name</td>'
  mform += '                  <td class="hideFix-Bond">Fix</td>'
  mform += '                  <td class="hideFix-Bond">Bond</td>'
  mform += '                  <td>Value</td>'
  mform += '                  <td>Min</td>'
  mform += '                  <td>Set</td>'
  mform += '                  <td>Max</td>'
  mform += '                  <td>Step</td>'
  mform += '                </tr>'
  mform += '                <tr id="listK">'
  mform += '                  <td><li>K:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixK'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondK'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamK'+sframe+'" name="K" value="0" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamKmin'+sframe+'" name="K" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamKSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamKmax'+sframe+'" name="K" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamKstep'+sframe+'" name="K" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '                <tr id="listAmpExp">'
  mform += '                  <td><li>N<sub>exp</sub>:</td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="fixAmpExp'+sframe+'"></td>'
  mform += '                  <td><input type="checkbox" class="inputParamBox" id="bondAmpExp'+sframe+'"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExp'+sframe+'" name="AmpExp" value="1" onblur="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExpmin'+sframe+'" name="AmpExp" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><div name="ParamSlider" class="ParamSlider'+sframe+'" id="ParamAmpExpSet'+sframe+'"></div></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExpmax'+sframe+'" name="AmpExp" onkeyup="updateSetSlider(this)"></td>'
  mform += '                  <td><input type="text" class="inputParam" id="ParamAmpExpstep'+sframe+'" name="AmpExp" value="0.1" onkeyup="updateSetSlider(this)"></td>'
  mform += '                </tr>'
  mform += '              </tbody>'
  mform += '            </table>'
  mform += '          </div>'
  mform += '        </div>'

  return mform
}

