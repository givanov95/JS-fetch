<?php


$conn = mysqli_connect('localhost', 'db_user', 'bBc7svkg]1IPRCXv', 'jsFetch');
if (!$conn) {
    echo 'no database';
    exit;
}
mysqli_set_charset($conn, 'utf8');

$post_query = json_decode(file_get_contents('php://input'));


if(!is_null($post_query)) {
    $query = "INSERT INTO  fetchdata (`name`, surname) VALUES (?,?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ss', $post_query->name, $post_query->surname);
    $stmt->execute();
    $stmt->close();
}


if(!empty($_FILES)) {
    var_dump($_FILES);
}

