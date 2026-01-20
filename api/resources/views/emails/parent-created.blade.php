<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Parent Account Created</title>
</head>

<body>
    <h2>Welcome to CoreSkool, {{ $parentName }}!</h2>

    <p>Your parent account has been created. Here are your login credentials:</p>

    <ul>
        <li><strong>Name:</strong> {{ $parentName }}</li>
        <li><strong>Parent ID:</strong> {{ $parentId }}</li>
        <li><strong>Email:</strong> {{ $parentEmail }}</li>
        <li><strong>Password:</strong> {{ $password }}</li>
    </ul>

    <p>Please log in and change your password after your first login for security purposes.</p>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
