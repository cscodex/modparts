<?php
// This script provides a web interface to restart the server
// IMPORTANT: This should be removed or secured in a production environment

// Set security token
$security_token = bin2hex(random_bytes(16)); // Generate a random token
$stored_token = isset($_SESSION['restart_token']) ? $_SESSION['restart_token'] : null;

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Store token in session if not already set
if (!isset($_SESSION['restart_token'])) {
    $_SESSION['restart_token'] = $security_token;
} else {
    $security_token = $_SESSION['restart_token'];
}

// Check if this is an admin user
function is_admin() {
    if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin') {
        return true;
    }

    // Check if user data is in localStorage (client-side check will be done with JS)
    return false;
}

// Function to execute the restart script
function restart_server() {
    $output = [];
    $return_var = 0;

    // Execute the restart script
    exec('bash /Applications/XAMPP/xamppfiles/htdocs/Modparts/restart_server.sh 2>&1', $output, $return_var);

    return [
        'success' => ($return_var === 0),
        'output' => $output,
        'return_code' => $return_var
    ];
}

// Handle restart request
$result = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verify CSRF token
    $submitted_token = isset($_POST['token']) ? $_POST['token'] : '';

    if ($submitted_token !== $security_token) {
        $error = 'Security token mismatch. Please refresh the page and try again.';
    } else {
        // Execute restart
        $result = restart_server();
    }
}

// Clear PHP opcache if available
if (function_exists('opcache_reset')) {
    opcache_reset();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modparts Server Restart</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h1 class="text-3xl font-bold mb-6 text-blue-800">Modparts Server Control</h1>

            <div class="mb-6">
                <p class="text-gray-700 mb-4">
                    This utility allows you to restart the server and make your changes live.
                    Use this after making changes to the website code.
                </p>

                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-blue-700">
                                <strong>React Changes:</strong> This will also build and deploy your React application.
                                Make sure all your React changes are saved before restarting.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                                This action will restart the Apache server. Any active connections will be temporarily interrupted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="admin-check" class="hidden bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">
                            You need to be an admin to use this feature. Please log in as an admin user.
                        </p>
                    </div>
                </div>
            </div>

            <?php if ($error): ?>
            <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700"><?php echo htmlspecialchars($error); ?></p>
                    </div>
                </div>
            </div>
            <?php endif; ?>

            <?php if ($result): ?>
            <div class="bg-<?php echo $result['success'] ? 'green' : 'red'; ?>-50 border-l-4 border-<?php echo $result['success'] ? 'green' : 'red'; ?>-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-<?php echo $result['success'] ? 'green' : 'red'; ?>-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <?php if ($result['success']): ?>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            <?php else: ?>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            <?php endif; ?>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-<?php echo $result['success'] ? 'green' : 'red'; ?>-700">
                            <?php echo $result['success'] ? 'Server restarted successfully!' : 'Failed to restart server.'; ?>
                        </p>
                    </div>
                </div>

                <?php if (!empty($result['output'])): ?>
                <div class="mt-4">
                    <details>
                        <summary class="text-sm font-medium text-gray-700 cursor-pointer">Show details</summary>
                        <div class="mt-2 bg-gray-800 text-white p-4 rounded overflow-auto max-h-64">
                            <pre class="text-xs"><?php echo implode("\n", array_map('htmlspecialchars', $result['output'])); ?></pre>
                        </div>
                    </details>
                </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <form id="restart-form" method="POST" class="mt-6">
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($security_token); ?>">

                <div class="flex justify-between">
                    <a href="/Modparts/" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">
                        Back to Website
                    </a>

                    <button id="restart-button" type="submit" class="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Restart Server
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Check if user is admin
        document.addEventListener('DOMContentLoaded', function() {
            const adminCheck = document.getElementById('admin-check');
            const restartForm = document.getElementById('restart-form');
            const restartButton = document.getElementById('restart-button');

            // Check localStorage for admin status
            let isAdmin = false;
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user && user.role === 'admin') {
                        isAdmin = true;
                    }
                }
            } catch (e) {
                console.error('Error checking admin status:', e);
            }

            // Show warning and disable button if not admin
            if (!isAdmin) {
                adminCheck.classList.remove('hidden');
                restartButton.disabled = true;
                restartButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
    </script>
</body>
</html>
