/*
Only core function
MIT License

Copyright (c) Jonas Almeida.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

lin = function(x,P){
	return x.map(function(xi){return (xi*P[1] + P[0])})
}

quad = function(x,P){
	return x.map(function(xi){return (Math.pow(xi, 2)*P[2] + xi*P[1] + P[0])})
}

gaus2 = function(x, P){
	return x.map(function(xi){return (P[2] * Math.exp(-0.5 * Math.pow((xi-P[0]) / P[1], 2)))})
}


chisq = function(y, yp){
    var sum = 0;
    for(var i = 0; i<y.length; i++){
        if(y[i] != 0){
            sum += Math.pow((y[i]-yp[i]),2)/y[i];
        }
    }
    return sum
}

fminsearch=function(fun,Parm0,x,y,Opt){// fun = function(x,Parm)

	// fun = function(x,P){return x.map(function(xi){return (P[0]+1/(1/(P[1]*(xi-P[2]))+1/P[3]))})}
	// x=[32,37,42,47,52,57,62,67,72,77,82,87,92];y=[0,34,59,77,99,114,121,133,146,159,165,173,170];
	//
	// Opt is an object will all other parameters, from the objective function (cost function), to the 
	// number of iterations, initial step vector and the display switch, for example
	// Parms=fminsearch(fun,[100,30,10,5000],x,y,{maxIter:10000,display:false})
	
	if(!Opt){Opt={}};
	if(!Opt.maxIter){Opt.maxIter=1000};
	if(!Opt.step){// initial step is 1/100 of initial value (remember not to use zero in Parm0)
		Opt.step=Parm0.map(function(p){return p/100});
		Opt.step=Opt.step.map(function(si){if(si==0){return 1}else{ return si}}); // convert null steps into 1's
	};

	if(!Opt.objFun){Opt.objFun=function(y,yp){
		//console.log(y, yp);
		return chisq(y, yp)}//y.map(function(yi,i){return Math.pow((yi-yp[i]),2)}).reduce(function(a,b){return a+b})}
	} //SSD
	if(!Opt.mask){Opt.mask = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}; //use all parameters
	if(!Opt.maskBond){Opt.maskBond = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[]]};//first element is mask, second is 
	if(!Opt.sframe){Opt.sframe = 'h0'};
	var cloneVector=function(V){return V.map(function(v){return v})};

	var P1, ya,y0,yb,fP0,fP1;
	var P0 = cloneVector(Parm0);//, P1 = cloneVector(Parm0);
	var n = P0.length;
	var step = Opt.step;
	var funParm=function(P){return Opt.objFun(y,fun(x,P, Opt.sframe))}//function (of Parameters) to minimize
	//console.log('before:', P0);
	P0 = checkIfInRange(P0, Opt.maskBond);
	//console.log('after:', P0)
	// silly multi-univariate screening
	for(var i=0;i<Opt.maxIter;i++){
		//console.log(i, P0);
		for(var j=0;j<n;j++){ // take a step for each parameter
			if(Opt.mask[j]==0){continue};//if parameter not used, skip it
			
			P1=cloneVector(P0);
			P1[j]+=step[j];
			//console.log(i, P1)
			//check if new parameter is bonded => check if out of bonds
			P1 = checkIfInRange(P1, Opt.maskBond)

			if(funParm(P1)<funParm(P0)){ // if parm value going in the righ direction
				step[j]=1.2*step[j]; // then go a little faster
				P0=cloneVector(P1);
			}
			else{
				step[j]=-(0.5*step[j]); // otherwiese reverse and go slower
			}	
		}
		if(Opt.display){if(i>(Opt.maxIter-10)){console.log(i+1,funParm(P0),P0)}}
		//console.log(funParm(P0), P0);
	}
	//console.log(funParm(P0), P0, chisq(y, fun(x,P0)));
	return [P0, chisq(y, fun(x,P0, Opt.sframe))];
};

function checkIfInRange(P0, maskBond){
	//P0 - vector of parameters
	//n - number of parameters
	//maskBond - first element is actual mask, second element is matrix of
	var n = P0.length;
	for(var j=0; j<n;j++){
		if(maskBond[0][j]==1){
			if(P0[j] < maskBond[1][j][0]){P0[j]=maskBond[1][j][0]};
			if(P0[j] > maskBond[1][j][1]){
				P0[j]=maskBond[1][j][1];
			}
		}
	}
	return P0
}