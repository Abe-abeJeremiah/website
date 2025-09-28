<?php
require "db.php";

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $email = trim($_POST["email"]);
  $newPass = trim($_POST["new_password"]);

  $hashed = password_hash($newPass, PASSWORD_DEFAULT);

  $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
  $stmt->bind_param("ss", $hashed, $email);
  $stmt->execute();

  if ($stmt->affected_rows > 0) {
    $message = "Password reset successfully! You can now log in.";
  } else {
    $message = "Email not found. Try again.";
  }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <div class="container">
    <h1>Reset Password</h1>
    <?php if (!empty($message)): ?>
      <p style="color: <?= strpos($message, 'successfully') !== false ? 'green' : 'red' ?>;">
        <?= $message ?>
      </p>
    <?php endif; ?>
    <form method="POST" action="">
      <label for="email">Enter Your Email:</label>
      <input type="email" id="email" name="email" required>

      <label for="new_password">New Password:</label>
      <input type="password" id="new_password" name="new_password" required>

      <button type="submit">Reset Password</button>
    </form>
    <br>
    <a href="login.php">Back to Login</a>
  </div>
</body>

</html>
