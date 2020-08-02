<?php

ini_set("display_errors", 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// get IP
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {   //check ip from share internet
  $subj_ip=$_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {   //to check ip is pass from proxy
    $subj_ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $subj_ip=$_SERVER['REMOTE_ADDR'];
}

$file_name=('../exp3_uni_results/' . $_POST['filename_post']);
$subject_results = $_POST['results_post'];
$sid = $_POST['sid_post'];
$subj_group = $_POST['cond_post'];

$outcome = file_put_contents($file_name, $subject_results, FILE_APPEND);

if (!file_exists($file_name)) {
    echo "Failed to save file " . $file_name . "! Please do not close this page, but contact gaspar.lukacs@univie.ac.at!";
}

if (strlen($sid) > 5 and strlen($subject_results) > 1000) {
    if ($outcome > 1000 and substr($file_name, -4) === ".txt") {
        echo "written";
    } else {
        if (is_file($file_name) === false) {
            echo "Failed to save file " . $file_name . "! Please do not close this page, but contact gaspar.lukacs@univie.ac.at! (" . $outcome . ")";
        } elseif ($outcome > 1000) {
            echo "Failed to save full file! Please do not close this page, but contact gaspar.lukacs@univie.ac.at! (" . $file_name . ")";
        } else {
            echo "Failed to properly save file " . $file_name . "! Please do not close this page, but contact gaspar.lukacs@univie.ac.at! (" . $outcome . ")";
        }
    }
} else {
    echo 'Failed. Data not correct. If you believe this is an error, contact gaspar.lukacs@univie.ac.at';
}
