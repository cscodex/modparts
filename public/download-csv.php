<?php
// Set the content type header to CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="sample-products.csv"');
header('Pragma: no-cache');
header('Expires: 0');

// Output the CSV file content
echo "name,price,category_id,quantity,description,condition_status\n";
echo "\"RD350 Piston Kit\",149.99,1,10,\"High-quality piston kit for Yamaha RD350. Includes piston rings and pins.\",New\n";
echo "\"Front Brake Caliper\",89.95,2,5,\"Refurbished front brake caliper for Yamaha RD models.\",Refurbished\n";
echo "\"Electrical Wiring Harness\",75.50,3,8,\"Complete wiring harness for Yamaha RD350. Direct replacement for original part.\",New\n";
echo "\"Carburetor Rebuild Kit\",45.00,1,15,\"Complete rebuild kit for Yamaha RD carburetors. Includes all necessary gaskets and jets.\",New\n";
echo "\"Headlight Assembly\",65.75,3,3,\"Chrome headlight assembly for Yamaha RD models. Includes mounting hardware.\",Used\n";
?>
