<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';
require 'ip2coordinates.php';

header('Content-Type: text/event-stream');
// recommended to prevent caching of event data.
header('Cache-Control: no-cache'); 


function xmlWalker($xml_array, $parent) {
         $cmd="";
         foreach($xml_array as $tag => $value) {
            if ((int)$tag === $tag) {
                $tag = substr($parent, 0, -1);
            }
            $cmd = $cmd . "<" .$tag. ">";
            if (is_array($value)) {
                 $cmd = $cmd . xmlWalker($value, $tag);
            } else {
                 $cmd = $cmd . $value;
            }
            $cmd = $cmd . "</" .$tag. ">";
        }
        return $cmd;
    }




function parseDOMNode(DOMNode $domNode) {
    $str="";
    $cnt=0;
    foreach ($domNode->childNodes as $node)
    {   
        if ($cnt){
          $str .= ",";
        } 
        if($node->hasChildNodes()) {
           if (!$node->childNodes->item(0)->hasChildNodes() || 
               strpos($node->nodeName,"list")!==false       
           // || $node->nodeName === "histogram" 
         ) {
             $str .= parseDOMNode($node);
           } else {
             $str .=  $node->nodeName.'(' ;
             if ( $node->nodeName === "histogram")  $str .=    $node->childNodes->length . ',' ;
             $str .= parseDOMNode($node);
             $str .=   ') '     ;
           }

        } else {

          if (is_numeric($node->nodeValue) || $node->parentNode->nodeName === "pid") {
            $str .=   $node->nodeValue ;
          } else {
            if (strlen($node->nodeValue)) {
              $str .=  '"' . $node->nodeValue . '"' ;
            } else { 
              $str .=  "-1";
            }
          }
        }
        $cnt++;
    }    
    return $str;
}



 


function stat2db($info){
global $code; 
// Establish a MySQL connection and select our database using values contained in config.php.

if (PHP_SAPI === 'cli') {
    $ip = "171.173.43.71";
} else {
  $ip = $_SERVER['REMOTE_ADDR'];
}

$userinfo = IPtoCoordinates($ip);


mysql_connect(DB_HOST, DB_USER, DB_PASS);
mysql_select_db(DB_NAME);


$msql = 'INSERT INTO `visitor_map` (`ip`, `location`, `longitude`, `latitude`,`time`, `neve`, `realtime`, `cputime`,`code` ) VALUES ('
. '\'' . mysql_real_escape_string($ip) . '\','
. '\'' . $userinfo['location'] . '\', ' 
. $userinfo['longitude'] . ', ' 
. $userinfo['latitude'] . ' , '
. $info 
. ', \'' . mysql_real_escape_string($code) . '\'' . 

')';

    send_message(0,$msql,100);

 
// Assign the user's IP to a variable and plot it into our function, whose return value is assigned to $userinfo
// Remember, the user's IP is not to be trusted 100%
 
// We select the location column from the database
$user = mysql_query('SELECT `location` FROM `visitor_map` WHERE `location` = \'' . $userinfo['location'] . '\'');
// If it does NOT return a value, and the user's IP could indeed be matched...
// (This makes sure that we have no duplicate rows (which would be a waste) and can determine the visitor's location, respectively)
// ...We insert the values returned by our function into the database, escaping any possible dangerous input
if(!mysql_fetch_row($user) && $userinfo)
  mysql_query($msql);
// or die(mysql_error());
 
}



function executeCmd($commandLine) {
  
  $pipe = popen("$commandLine" , 'r');

  if (!$pipe) {
    print "pipe failed.";
    return "";
  }
  $output = '';
  while(!feof($pipe)) {
    $contents = fread($pipe, 12);
    $unpacked = unpack("l*",$contents);
    $id       =  $unpacked[1];
    $len      =  $unpacked[2];
    $progress =  $unpacked[3];
    if ($len>0){
      $out= fread($pipe, $len);
      if ($id == 3){
         $hostname = gethostname();
         if ($hostname == "belle2.ijs.si") {
           stat2db($out);
         }
//       $out = $_SERVER['REMOTE_ADDR'] . ";" .$out ;
//       $retval = system("echo '$out' >> public/blab2stat.txt ");
//       $out .= ";" . $retval;
       $id = 0 ;
      }
      send_message($id,$out,$progress);
    }
    $output .=$out;
  }
  pclose($pipe);
  return $output;
} 

function send_message($id, $message, $progress) {
    $d = array('message' => $message , 'progress' => $progress); //prepare json

    echo "id: $id" . PHP_EOL;
    echo "data: " . json_encode($d) . PHP_EOL;

   if (PHP_SAPI !== 'cli') {
     echo PHP_EOL;
     ob_flush();
   }
   flush();
}


function removeTrailingCommas($json)
    {
        $json=preg_replace('/,\s*([\]}])/m', '$1', $json);
        return $json;
    }


$code="";
if (PHP_SAPI === 'cli') {
  $code = $argv[1];
} else { 
  if (isset($_GET["code"])){
   $code =  $_GET["code"];
  } 
}

$code = removeTrailingCommas($code);
//send_message(0,"$code",0);

$data = json_decode($code, true);


$ierr =json_last_error();
if (json_last_error() != JSON_ERROR_NONE) { 
  send_message(0,"JSON Error $ierr ! cannot convert...",0);
  send_message('CLOSE', "Stopping...",100);
}



$neve  = $data['analysis']['neve'];
$first = $data['analysis']['first'];
$evprint = $data['analysis']['print'];
$source= $data['analysis']['datasource'];

$xml = '<?xml version="1.0" encoding="utf-8"?>' .  xmlWalker($data,'start');
$dom = new DOMDocument;
$dom->loadXML($xml);
/*
echo "<pre>";
echo $dom->saveXML();
echo "</pre>";
echo PHP_EOL;
*/

$cnt=0;

$fstart = $dom->createElement("init");
$dom->appendChild($fstart);

$el = $dom->getElementsByTagName('neve')->item(0);
$fstart->appendChild($el);
$el = $dom->getElementsByTagName('first')->item(0);
$fstart->appendChild($el);
$el = $dom->getElementsByTagName('print')->item(0);
$fstart->appendChild($el);
$el = $dom->getElementsByTagName('datasource')->item(0);
$fstart->appendChild($el);

$histogramCount = $dom->getElementsByTagName('h1d')->length;
for($i= $histogramCount-1;$i>=0;--$i)
{   
   $idnode=$dom->createElement("id","$i");
   
   $histo=$dom->getElementsByTagName('h1d')->item($i);
   $histo->appendChild($idnode);

   $newnode=$dom->createTextNode("$i");
   $parent = $histo->parentNode;
   //$histo->setAttribute('id',"$i");
   $fstart->appendChild($histo);   
   $parent->appendChild($newnode);
   
}


$xpath = new DOMXpath($dom);
$nodelist = $xpath->query('//selector|//combiner|//combiner3');
$cnt=1;
foreach ($nodelist as $plist) {
    $newnode=$dom->createElement("plist","$cnt");
    $fstart->appendChild($newnode);
    $newnode=$dom->createElement("id","$cnt");
    $plist->appendChild($newnode);
    $cnt++;
}

$nodelist = $xpath->query('//list|//list1|//list2|//list3');
$cnt=1;
foreach ($nodelist as $plist) {
  if( $plist->childNodes->length === 0){
    $newnode=$dom->createTextNode("-1");
    $plist->appendChild($newnode);
  }
}
//$isEmpty = $elem->childNodes->length === 0;

/*
echo "<pre>";
echo $dom->saveXML();
echo "</pre>";
echo PHP_EOL;
*/

$str="";
foreach ($dom->getElementsByTagName('analysis') as $node){
  $str = PHP_EOL . "void Blab2::event(){" . PHP_EOL ;
  $str .= parseDOMNode($node) . ";";
  $str .= PHP_EOL . "}" . PHP_EOL ;
}


$nodelist = $fstart->getElementsByTagName('h1d');
$init = PHP_EOL . "void Blab2::Init(){" . PHP_EOL ;
$init .="fNeve=$neve;" . PHP_EOL ;
$init .="fNfirst=$first;" . PHP_EOL ;
$init .="fData=$source;" . PHP_EOL ;
$init .="fPrint=$evprint;" . PHP_EOL ;
foreach ($nodelist as $node) {
    $init .= $node->nodeName . "(";
    $cnt=0;
    foreach ($node->childNodes as $el) {
      if  ($cnt) {
          $init .= ",";
      }
      if (is_numeric($el->nodeValue)) {
          $init .=  $el->nodeValue ;
      } else {       
          $init .= '"' . $el->nodeValue . '"' ;
      }
      $cnt++;
    }
    $init .= ");" . PHP_EOL;
}

foreach ($fstart->getElementsByTagName('plist')  as $node) {
    $init .= $node->nodeName . "(" .$node->nodeValue .  ");" . PHP_EOL;
}
$init .= PHP_EOL . "}" . PHP_EOL ;


$cmd0  = ".L BParticle.cc+". PHP_EOL;
$cmd0 .= ".L BEvent.cc+". PHP_EOL;
$cmd0 .= ".L Blab2.cc". PHP_EOL;
$cmd0 .= $str. PHP_EOL;
$cmd0 .= $init. PHP_EOL;
$cmd0 .= "Blab2 *blab2 = new Blab2();". PHP_EOL;

//LONG RUNNING TASK
 //executeCmd(5, 'ls');
 //executeCmd(5, "/home/rok/public_html/blab/blockly/app/runscript.sh");
 //executeCmd(5, 'for ((i=0;i<5;i++)) ; do  echo $i; sleep 1; done;');
if (file_exists('/opt/root/bin/thisroot.sh')){
  $profile ='/opt/root/bin/thisroot.sh';
} else {
  $profile ='/home/rok/root/bin/thisroot.sh';
}
$cmd ="bash -c 'source $profile ;cd src; root -b -l <<EOL" . PHP_EOL;
$cmd .= $cmd0. PHP_EOL;
$cmd .= "EOL'". PHP_EOL;

send_message(0,$cmd0,0);
executeCmd($cmd);
send_message('CLOSE', $data,100);
?>
