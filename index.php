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
</head>

<body>

    <div class="static-content">
        Static content
    </div>

    <!-- Dynamic content  -->
    <div class="js-ajax-load" id="container" data-load-path="/jsFetch/queries/formHandler.php?name=aaa" data-submit-path="/jsFetch/queries/insertQuery.php"></div>
    <!-- /. Dynamic content  -->

    <?php
        /**
         * Required class to run JS function: ".js-ajax-load"
         * Required attribute: [data-load-path] - path to page that will load in ".js-ajax-load"
         * Required attribute: [data-submit-path] - path to page where we will send the POST query
         * Not required: [?GET arguments] - additional parameters to use in the POST OR GET query after WHERE clause - !!! You can use GET arguments in the POST query too !!!  
         */
    ?>
    <script src="jsFetch.js"></script>
</body>

</html>