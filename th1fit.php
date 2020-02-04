<?php

function send_message($id, $message, $progress) {
    $d = array('message' => $message , 'progress' => $progress); //prepare json
    $x = array('id' => $id, 'data' => $d );
    echo json_encode($x) . PHP_EOL;
/*
   if (PHP_SAPI !== 'cli') {
     echo PHP_EOL;
     ob_flush();
   }
   flush();
*/
}


function executeCmd($commandLine) {
  
  $pipe = popen("$commandLine" , 'r');

  if (!$pipe) {
    print "pipe failed.";
    return "";
  }
  $output = '';
  $out    = '';
  while(!feof($pipe)) {
    $contents = fread($pipe, 12);
    $unpacked = unpack("l*",$contents);
    $len0      = sizeof($unpacked);
    if ($len0 > 2) {
      $id       =  $unpacked[1];
      $len      =  $unpacked[2];
      $progress =  $unpacked[3];
      if ($len>0){
        $out= fread($pipe, $len);
        send_message($id,$out,$progress);
      }
      $output .=$out;
    }
  }
  pclose($pipe);
  return $output;
} 

 if (isset($_POST["min"])){
   $min =  $_POST["min"];
 } else {
   $min =  0;
 }

 if (isset($_POST["max"])){
   $max =  $_POST["max"];
 } else {
   $max =  10;
 }

 if (isset($_POST["fitfun"])){
   $fitfun =  $_POST["fitfun"];
 } else {
   $fitfun =  "gaus";
 }

 if (isset($_POST["prm"])){
   $prm =  $_POST["prm"];
 } else {
   $prm =  "9,11,,99,3,,7";
 }

 if (isset($_POST["name"])){
   $name =  $_POST["name"];
 } else {
   $name = "h101";
 }

 if (isset($_POST["data"])){
   $data =  $_POST["data"];
 } else {
   $data = '{ "_typename" : "TH1F", "fUniqueID" : 0, "fBits" : 50331656, "fName" : "h100", "fTitle" : "Number of particles in the event", "fLineColor" : 602, "fLineStyle" : 1, "fLineWidth" : 1, "fFillColor" : 0, "fFillStyle" : 1001, "fMarkerColor" : 1, "fMarkerStyle" : 1, "fMarkerSize" : 1, "fNcells" : 52, "fXaxis" : { "_typename" : "TAxis", "fUniqueID" : 0, "fBits" : 50331648, "fName" : "xaxis", "fTitle" : "N particles", "fNdivisions" : 510, "fAxisColor" : 1, "fLabelColor" : 1, "fLabelFont" : 42, "fLabelOffset" : 0.005, "fLabelSize" : 0.035, "fTickLength" : 0.03, "fTitleOffset" : 1, "fTitleSize" : 0.035, "fTitleColor" : 1, "fTitleFont" : 42, "fNbins" : 50, "fXmin" : -0.5, "fXmax" : 49.5, "fXbins" : [], "fFirst" : 0, "fLast" : 0, "fBits2" : 0, "fTimeDisplay" : false, "fTimeFormat" : "", "fLabels" : null, "fModLabs" : null }, "fYaxis" : { "_typename" : "TAxis", "fUniqueID" : 0, "fBits" : 50331648, "fName" : "yaxis", "fTitle" : "N events", "fNdivisions" : 510, "fAxisColor" : 1, "fLabelColor" : 1, "fLabelFont" : 42, "fLabelOffset" : 0.005, "fLabelSize" : 0.035, "fTickLength" : 0.03, "fTitleOffset" : 0, "fTitleSize" : 0.035, "fTitleColor" : 1, "fTitleFont" : 42, "fNbins" : 1, "fXmin" : 0, "fXmax" : 1, "fXbins" : [], "fFirst" : 0, "fLast" : 0, "fBits2" : 0, "fTimeDisplay" : false, "fTimeFormat" : "", "fLabels" : null, "fModLabs" : null }, "fZaxis" : { "_typename" : "TAxis", "fUniqueID" : 0, "fBits" : 50331648, "fName" : "zaxis", "fTitle" : "", "fNdivisions" : 510, "fAxisColor" : 1, "fLabelColor" : 1, "fLabelFont" : 42, "fLabelOffset" : 0.005, "fLabelSize" : 0.035, "fTickLength" : 0.03, "fTitleOffset" : 1, "fTitleSize" : 0.035, "fTitleColor" : 1, "fTitleFont" : 42, "fNbins" : 1, "fXmin" : 0, "fXmax" : 1, "fXbins" : [], "fFirst" : 0, "fLast" : 0, "fBits2" : 0, "fTimeDisplay" : false, "fTimeFormat" : "", "fLabels" : null, "fModLabs" : null }, "fBarOffset" : 0, "fBarWidth" : 1000, "fEntries" : 10000, "fTsumw" : 9983, "fTsumw2" : 9983, "fTsumwx" : 175205, "fTsumwx2" : 3620667, "fMaximum" : -1111, "fMinimum" : -1111, "fNormFactor" : 0, "fContour" : [], "fSumw2" : [], "fOption" : "", "fFunctions" : { "_typename" : "TList", "name" : "TList", "arr" : [], "opt" : [] }, "fBufferSize" : 0, "fBuffer" : [], "fBinStatErrOpt" : 0, "fArray" : [0, 0, 0, 0, 86, 122, 117, 135, 176, 263, 306, 367, 412, 508, 596, 643, 618, 566, 524, 552, 503, 439, 418, 374, 333, 311, 229, 222, 188, 172, 123, 120, 92, 82, 81, 53, 47, 32, 36, 28, 27, 17, 14, 9, 10, 6, 8, 6, 4, 5, 3, 17] }';
 }

$json  = json_decode($data, true);
$class = $json['_typename'];
$hname = $json['fName'];
$htitle= $json['fTitle'];
$xaxis = $json['fXaxis'];
$xtitle= $xaxis['fTitle'];
$xbins = $xaxis['fNbins'];
$xmin  = $xaxis['fXmin'];
$xmax  = $xaxis['fXmax'];
$yaxis = $json['fYaxis'];
$ytitle= $yaxis['fTitle'];


$hdata='';
foreach( $json['fArray'] as $key => $value){
        if($key != "0"){
            $hdata .= ", ";
        } 
        $hdata .= $value;
}

$cmd0  = ".L th1fit.cc+". PHP_EOL;
$cmd0 .= "double data[]={". $hdata . "};" .PHP_EOL;
$cmd0 .= "th1fit(data, \"$hname\",\"$htitle;$xtitle;$ytitle\", $xbins , $xmin, $xmax, $min ,$max ,\"$fitfun\",\"$prm\");". PHP_EOL;

if (file_exists('/opt/root/bin/thisroot.sh')){
  $profile ='/opt/root/bin/thisroot.sh';
} 
$cmd  ="bash -c 'source $profile ; root -b -l <<EOL" . PHP_EOL;
$cmd .= $cmd0. PHP_EOL;
$cmd .= "EOL'". PHP_EOL;
executeCmd($cmd);
//echo $cmd0;
//echo "name=$name min=$min max=$max func=$fitfun data=$data";
?> 

