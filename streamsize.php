<?php
$url = 'https://momarmbergan.github.io/Vitalsjs/src/base64.txt'; 

function fetchByteStreamLength($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FAILONERROR, true);
    $data = curl_exec($ch);
    
    if (curl_errno($ch)) {
        echo 'Error: ' . curl_error($ch);
        curl_close($ch);
        return;
    }

    $byteStreamLength = strlen($data);
    curl_close($ch);
    return $byteStreamLength;
}

$length = fetchByteStreamLength($url);
?>
