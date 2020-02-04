<?php
ini_set("allow_url_fopen", 1);
function IPtoCoordinates($ip)
{
//	$dom = new DOMDocument();

	$ipcheck = ip2long($ip);
        if($ipcheck == -1 || $ipcheck === false)
    	  trigger_error('Invalid IP, what are you doing? :|', E_USER_ERROR);
	else
          $key='482198dbcb57d1747babb7acebc5c02e';
	  $uri = 'http://api.ipstack.com/' . $ip . '?access_key=' . $key . '&output=json&legacy=1';
        $json = file_get_contents($uri);
        $data = json_decode($json, true);
        $location   = $data['country_name'];
        $longitude  = $data['longitude'];
        $latitude   = $data['latitude'];

/*
		$uri = 'http://freegeoip.net/xml/' . $ip;
	$dom->load($uri);
		$location = $dom->getElementsByTagName('CountryName')->item(0)->nodeValue;
		$longitude = $dom->getElementsByTagName('Longitude')->item(0)->nodeValue;
		$latitude  = $dom->getElementsByTagName('Latitude')->item(0)->nodeValue;
*/
		return array('location' => $location, 'longitude' => $longitude, 'latitude' => $latitude);
}

?>
