<?php

/**
 * Example file with data that we'll fetch and show in the main page, in class ".js-ajac-load"
 */

// example DB connecton
$conn = mysqli_connect('localhost', 'db_user', 'bBc7svkg]1IPRCXv', 'jsFetch');
if (!$conn) {
    echo 'no database';
    exit;
}
mysqli_set_charset($conn, 'utf8');

// Query to select data from DB table
$query = "SELECT * FROM fetchdata WHERE `name` = ? ";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $_GET['name']);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();
$result = $result->fetch_assoc();


?>



<!-- Import bootstrap  -->
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous">
</head>

<!-- data to show  -->
<div class="container" style="max-width: 500px;">
    <div class="row">
        <div class="form-group col-5">
            <label for="">Name</label>
            <input class="form-control" type="text" required name="name" value="<?php echo $result['name']; ?>" />
        </div>

        <div class="form-group col-5">
            <label for="">Surname</label>
            <input class="form-control" type="text" name="surname" value="<?php echo $result['surname']; ?>" />
        </div>

    </div>

    <select data-type="submit">
        <option value="option">dsadsasa</option>
        <option value="option">aaa</option>

    </select>
    <button data-type="submit"> Изпрати </button>

    <input type="file" data-allowed-extentions="jpg,jpeg,png" multiple>

    <br> <input type="radio" name="gender" value="male" data-type="submit"> Male<br>
    <input type="radio" name="gender" value="female" data-type="submit"> Female<br>

    <input data-type="submit" type="checkbox">

</div>

