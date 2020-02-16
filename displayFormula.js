function showFormula(formula, sframe){
  //formula to be displayed in divid formulaDisplay+sframe
  spanID = 'functionDisplay' + sframe;
  document.getElementById("functionDisplay"+sframe).innerHTML = '$'+formula+'$';
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, spanID]);
  MathJax.Hub.Queue(showBlahElement);

}

function showBlahElement () {
  console.log(spanID);
  console.log(MathJax.Hub.getAllJax(spanID));
}

