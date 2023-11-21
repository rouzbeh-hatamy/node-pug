exports.mailTemplate = (url) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #333333;
    }
    p {
      color: #666666;
    }
    .button {
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      text-decoration: none;
      padding: 10px 20px;
      margin: 10px 0;
      color: #ffffff;
      background-color: #007bff;
      border-radius: 3px;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset</h2>
    <p>You requested a password reset. Click the button below to reset your password:</p>
    <a class="button" href="${url}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <div class="footer">
      <p>Thanks,<br>Your Company Name</p>
    </div>
  </div>
</body>
</html>`
}