<html>
<body>
<?php

$hostname = gethostname();
if ($hostname != "belle2.ijs.si") {
  $output = shell_exec("curl -L http://belle2.ijs.si/masterclass_latest.tgz | tar xzv ");
  //$output = shell_exec("svn update");
  echo "<pre>$output</pre>";
  //$output = shell_exec("ls -latr tmp");
  //echo "<pre>$output</pre>";
}

?>

<h3>Update completed</h3>
<a href="index.php">Start with the exercises</a>
</body>
</html>
