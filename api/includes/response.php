<?php
function send_json_response($code, $data) {
    // Clear any previous output
    if (ob_get_level() > 0) {
        ob_end_clean();
    }

    // Set headers
    header_remove();
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code($code);

    // Send response
    echo json_encode($data);
    exit;
}
?>