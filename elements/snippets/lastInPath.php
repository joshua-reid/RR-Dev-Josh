<?php
$lastinpath = '';
$url = $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
$sections = explode("/", $url);
$lastSection = $sections[count($sections) -1];
$noQueries = preg_split("/[?&]/", $lastSection);
$lastinpath = $noQueries[0];
return preg_replace("/[^a-zA-Z0-9\.-]/", '', $lastinpath);