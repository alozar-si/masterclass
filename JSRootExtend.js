function StoreAndDrawFitFunction(TH1, TF1, range, delOldFunction, divid){
    //   - Store fitted function in histogram functions list and draw
    // works for 1D histogram

    var ndim = 1;
    var xmin = 0, xmax = 0, ymin = 0, ymax = 0;
    if(range.length >= 2){
      xmin = range[0];
      xmax = range[1]
    }else{
      return 0
    };//add more if needed?
    
    var funcList = GetListOfFunctions(TH1);
    
    if ((funcList.length == 0) || (funcList == undefined)){
      throw "StoreAndDrawFitFunction: Function list has not been created - cannot store the fitted function";
    }
    //console.log("funcList", funcList);
    // delete the function in the list only if
    // the function we are fitting is not in that list
    // If this is the case we re-use that function object and
    // we do not create a new one (if delOldFunction is true)
    //NEW: always remove old and add new!!!
    var reuseOldFunction = 0;
    if (delOldFunction){
      var i=1
      while(i<funcList.arr.length){
        //skip first beacuse it is TPaveStats
        //console.log(i, TF1, funcList);
        if((funcList.arr[i].fName != TF1.fName) || (funcList.arr[i].fFormula.fFormula != TF1.fFormula.fFormula)){
          //console.log("diff");
          funcList.RemoveAt(i);
          
        }else{
          //console.log("same");
          funcList.RemoveAt(i); //added
          reuseOldFunction = 1;
          i++;
        }
      } 
    }

    var fnew1 = JSROOT.Create("TF1");
    fnew1 = TF1;
    
    funcList.Add(fnew1);
    //console.log(JSROOT.GetMainPainter(divid));
    SetRange(fnew1, xmin,xmax);
    Save(fnew1, TH1, xmin, xmax);

    //check if TH1's fit function is plotted
    var isFitPlotted = TH1.fFitPlotted;
    //console.log(isFitPlotted)
    if(!isFitPlotted){
      JSROOT.draw(divid, fnew1, "", function(obj){
        divid = obj.divid.id;
        var a = JSROOT.GetMainPainter(divid).draw_object;
        a.fFitPlotted = 1;
      });
    }else{
      JSROOT.redraw(divid, fnew1, "");
    }
}

function GetListOfFunctions(TH1){
    //returns TList of functions
    return TH1.fFunctions
}

function SetRange(TF1, xmin, xmax){
    TF1.Xmax = xmax;
    TF1.Xmin = xmin;
}

function Save(TF1, TH1, xmin, xmax){
    //Save values of function in array fSave
    //var bin1 = TH1.fXaxis.FindBin(xmin, 0);
    //var bin2 = TH1.fXaxis.FindBin(xmax, 0);
    //console.log("bin1:", bin1, "bin2", bin2);
    if(!TF1.fNpx) TF1.fNpx = 501; //number of  points to be plotted 
    //var fNsave = TF1.fNpx + 3; //number of  points to be plotted
    var dx = (xmax - xmin) / TF1.fNpx;

    var fSave = [];
    
    for(var i = 0; i <= TF1.fNpx; i++){
      fSave.push(TF1.evalPar(xmin + dx * i));
    }
    fSave.push(xmin);
    fSave.push(xmax);
    TF1.fSave = fSave;
}

function GetParameters(TF1){
    //returns parameters from fFormula
    var fNpar = TF1.fNpar;
    var parameters = [];
    for(var i = 0; i<fNpar; i++){
        parameters.push(TF1.GetParValue(i));
    }
    return parameters;      
}

function CreateTF1Fit(param, sframe){
  //This fuction can create gaus, pol0-5, exp and Breit-Wigner functions, or their combinations.
  var func = JSROOT.Create("TF1");
  var formula = JSROOT.Create("TFormula");
  var Npar = 0;
  formula.fClingParameters = [];
  formula.fFormula = "";
  formula.fParams = [];
  formula.fNparam = Npar;
  var funList = getFunList(sframe);
  if(funList[0]){
    //Gaus function
    var gausParameters = ["N", "Mean", "Sigma"];
    formula.fClingParameters.push(param[0]);
    formula.fClingParameters.push(param[1]);
    formula.fClingParameters.push(param[2]);
    formula.fFormula =  "[N] * TMath::Gaus(x, [Mean], [Sigma])";
    
    for(var i = 0; i<3;i++){
      formula.fParams.push(JSROOT.Create("pair<TString,int,TFormulaParamOrder>"));
      formula.fParams[i].first = gausParameters[i];
      formula.fParams[i].second = i;
      Npar += 1;
    }
  }
  
  if(funList[1]){
    //pol function
    var n = parseInt(document.getElementById("polOrderDisplay"+sframe).value);
    
    for(var i=0; i<=n; ++i){
      if((i>0) || (Npar > 0)){
        formula.fFormula += " + ";
      }

      if(i==0){
        formula.fFormula += "[p" + String(i) + "]";
      }else{
        if(i==1){
          formula.fFormula += "[p" + String(i) + "] * x";
        }else{
          formula.fFormula += "[p" + String(i) + "] * x^" + String(i);
        }
      }
               
      formula.fClingParameters.push(param[3+i]);
      formula.fParams.push(JSROOT.Create("pair<TString,int,TFormulaParamOrder>"));
      formula.fParams[i+Npar].first = "p" + String(i);
      formula.fParams[i+Npar].second = i+Npar;
    }
    Npar += n+1;
  }
  
  if(funList[2]){
    var expParameters = ["N", "K"]
    if((Npar > 0)){
      formula.fFormula += " + ";
    }
    formula.fFormula += "[N] * exp([K] * x)";
    formula.fClingParameters.push(param[8]);
    formula.fClingParameters.push(param[9]);
    
    for(var i = 0; i<2;i++){
      formula.fParams.push(JSROOT.Create("pair<TString,int,TFormulaParamOrder>"));
      formula.fParams[i+Npar].first = expParameters[i];
      formula.fParams[i+Npar].second = i+Npar;
    }
    Npar += 2;
  }

  if(funList[3]){
    var BWParameters = ["NBW", "Gamma", "MeanBW"]
    if((Npar > 0)){
      formula.fFormula += " + ";
    }
    formula.fFormula += "[NBW] * TMath::BreitWigner(x, [MeanBW], [Gamma])"; // * [Gamma] / ((x - [MeanBW])^2 + ([Gamma]/2)^2)
    formula.fClingParameters.push(param[10]);
    formula.fClingParameters.push(param[11]);
    formula.fClingParameters.push(param[12]);

    for(var i = 0; i<3;i++){
      formula.fParams.push(JSROOT.Create("pair<TString,int,TFormulaParamOrder>"));
      formula.fParams[i+Npar].first = BWParameters[i];
      formula.fParams[i+Npar].second = i+Npar;
    }
    Npar += 3;
  }
  
  formula.fName = "Fit function";
  //formula.fNdim = 1;
  formula.fTitle = "Fit function";
  formula.fNparam = Npar;
  //func.fParErrors = [1, 1, 1]; // to display parameters' error use this line
  func.fFormula = formula;
  func.fNpar = formula.fNparam;
  func.fTitle = formula.fTitle;
  func.fName = formula.fName;
  func.fLineColor = 2;
  func.fLineWidth = 2;
  return func
}