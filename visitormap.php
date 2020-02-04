<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';
require 'ip2coordinates.php';

mysql_connect(DB_HOST, DB_USER, DB_PASS);
mysql_select_db(DB_NAME);

$ip = $_SERVER['REMOTE_ADDR'];
$userinfo = IPtoCoordinates($ip);

$user = mysql_query('SELECT `location` FROM `visitor_map` WHERE `location` = \'' . $userinfo['location'] . '\'');
if(!mysql_fetch_row($user) && $userinfo)
	mysql_query('INSERT INTO `visitor_map` (`ip`, `location`, `longitude`, `latitude`) VALUES (\'' . mysql_real_escape_string($ip) . '\', \'' . $userinfo['location'] . '\', ' . $userinfo['longitude'] . ', ' . $userinfo['latitude'] . ')') or die(mysql_error());

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">

 <head>
  <title>Visitor Map Example</title>
   <script src="//maps.googleapis.com/maps/api/js?sensor=false"   type="text/javascript"></script>
    <style type="text/css">
      html, body, #map { height: 100%; margin: 0; }
    </style>
    <script type="text/javascript">
	//<![CDATA[

    function initialize() {
      var map = new google.maps.Map(
        document.getElementById('map'), {
          center: new google.maps.LatLng(35.69,139.69),
          zoom: 3,
          minZoom: 2,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      });
     var marker;
<?php
     $query = mysql_query('SELECT `longitude`, `latitude` FROM `visitor_map`');
     while($row = mysql_fetch_array($query)){
         if (strlen($row['latitude'])>0){
?>
     marker = new google.maps.Marker({ position: new google.maps.LatLng(<?php echo $row['latitude']; ?>, <?php echo $row['longitude']; ?>), map: map });
<?php
//                                break;
         }
     }
?>



    }
    google.maps.event.addDomListener(window, 'load', initialize);
	//]]>

    </script>

 </head>

 <body>
<h3>Belle II Masterclass visitor map</h3>
  <div id="map" style="width: 90%; height: 90%"></div>

<?php
     if (isset($_GET['debug'])){
       $nc=0;
       echo ('<table>');
       $query = mysql_query('SELECT * FROM `visitor_map`');
       while($row = mysql_fetch_array($query, MYSQL_ASSOC)){
         if ($nc==0){
           echo('<tr>');
           foreach ($row as $key=>$val){
             echo("<th>$key");
            
           }
           $nc++;
         }

         echo('<tr>');
         foreach ($row as $key=>$val){
             echo("<th>$val");
         }
       }
       echo ('</table>');
     }
?>
 </body>

</html>
