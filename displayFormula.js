/*(function () {
  document.addEventListener("DOMContentLoaded",function(){
    var QUEUE = MathJax.Hub.queue; 			 // shorthand for the queue
    var math = null;    
    var math2 = null;           	
 
    /*QUEUE.Push(function () {
    math = MathJax.Hub.getAllJax("div1")[0];
    math2 = MathJax.Hub.getAllJax("div2")[0];
   });

  //
  //  The onchange event handler that typesets the
  //  math entered by the user
  //
  UpdateMath = function (TeX, div) {
    console.log(TeX);
    QUEUE.Push(["Text",MathJax.Hub.getAllJax(div)[0],"\\displaystyle{"+TeX+"}"]);
    //QUEUE.Push(["Text",MathJax.Hub.getAllJax("div2")[0],"\\displaystyle{"+TeX+"}"]);
  }
  
  })
})(MathJax);*/

function showFormula(formula, sframe){
  //formula to be displayed in divid formulaDisplay+sframe
  spanID = 'functionDisplay' + sframe;
  //var QUEUE = MathJax.Hub.queue;
  //QUEUE.Push(["Text",MathJax.Hub.getAllJax(divid)[0],"\\displaystyle{"+formula+"}"]);
  //MathJax.HTML.addElement(document.getElementById("functionDisplay"+sframe), "span", {id: spanID}, ['$$'+formula+'$$']);
  document.getElementById("functionDisplay"+sframe).innerHTML = '$'+formula+'$';//"$Z^{\prime}$";//genFunctionName(sframe);
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, spanID]);
  MathJax.Hub.Queue(showBlahElement);
  //UpdateMath(formula, divid);
}

function showBlahElement () {
  console.log(spanID);
  console.log(MathJax.Hub.getAllJax(spanID));
}

