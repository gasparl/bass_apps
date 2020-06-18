<?php

ini_set("display_errors", 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// get IP
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {   //check ip from share internet
  $ip=$_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {   //to check ip is pass from proxy
    $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip=$_SERVER['REMOTE_ADDR'];
}

$con = mysqli_connect("lukacsg89.mysql.univie.ac.at", "xxxx", "xxxx", "xxxx");
// Check connection
if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL! Contact gaspar.lukacs@univie.ac.at, also copying the following error message: \n (Starter) " . mysqli_connect_error() ;
}
$sql_ip ="SELECT ip FROM silhou_screening_data";

$ip_data = $con->query($sql_ip);
if (($ip_data) && ($ip_data->num_rows > 0)) {
    while ($row = mysqli_fetch_array($ip_data)) {
        $all_ips[] = $row["ip"];
    }
} else {
    $all_ips = array();
}
if (in_array($ip, $all_ips) and $ip != "37.76.107.210" and $ip != "81.223.149.114") {
    echo "IP";
} else {
    mysqli_free_result($ip_data);
    header("Content-Type: application/json");
    $sql_cond ="SELECT group_code FROM silhou_screening_data;";
    $conds_data = $con->query($sql_cond);
    if (($conds_data) && ($conds_data->num_rows > 0)) {
        while ($row = mysqli_fetch_array($conds_data)) {
            $all_conditions[] = $row["group_code"];
        }
    } else {
        $all_conditions = array();
    }
    $conditions_counted = array_count_values($all_conditions) ;
    echo json_encode($conditions_counted);
    mysqli_free_result($conds_data);
}
mysqli_close($con);
