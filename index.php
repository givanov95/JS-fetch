<?php
/**
 * Example file that we may use for JS fetching 
 */

?>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="assets/css/main.css">
</head>

<body>

    <div class="static-content">
        Static content
    </div>

    <!-- Dynamic content  -->
    <div class="js-fetch-container">
        <div class="js-ajax-load" id="container" data-load-path="/jsFetch/queries/formHandler.php?name=aaa" data-submit-path="/jsFetch/queries/insertQuery.php"></div>
        <div class="loader hidden"></div>
    </div>
    <!-- /. Dynamic content  -->

    <?php
        /**
         * Required class to run JS function: ".js-ajax-load"
         * Required attribute: [data-load-path] - path to page that will load in ".js-ajax-load"
         * Required attribute: [data-submit-path] - path to page where we will send the POST query
         * Not required: [?GET arguments] - additional parameters to use in the POST OR GET query after WHERE clause - !!! WE can use GET arguments in the POST query too !!! We can use GET argumenst dynamically - example: id of element, row, input etc.
         */
    ?>
    <script src="assets/js/jsFetch.js"></script>
</body>

</html>