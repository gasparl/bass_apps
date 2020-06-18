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

$file_name=('../silhou_pro_results/' . $_POST['filename_post']);
$subject_results = $_POST['results_post'];
$sid = $_POST['sid_post'];
$subj_group = $_POST['cond_post'];

$outcome = file_put_contents($file_name, $subject_results, FILE_APPEND);

if (!file_exists($file_name)) {
    echo "Failed to save file " . $file_name . "! Please do not close this page, but contact gaspar.lukacs@univie.ac.at!";
}

$con = mysqli_connect("lukacsg89.mysql.univie.ac.at", "xxxx", "xxxx", "xxxx");
// Check connection
if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL! Please do not close this page, but contact gaspar.lukacs@univie.ac.at, also copying the following error message: \n (End) " . mysqli_connect_error() ;
}

$sql="INSERT INTO silhou_screening_data (scr_data_id, ip, subject_id, group_code, created) VALUES ( NULL, '$subj_ip', '$sid','$subj_group', CURRENT_TIME() );";

if (!mysqli_multi_query($con, $sql)) {
    die('Failed to save data! Please do not close this page, but contact gaspar.lukacs@univie.ac.at, also copying the following error message: \n (End) ' . mysqli_error($con));
} else {
    if (strlen($sid) > 5 and strlen($subject_results) > 1000) {
        if ($outcome > 1000 and substr($file_name, -4) === ".txt") {
            echo "https://the-end-url-OR-comletion-code";
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
}

mysqli_close($con);
