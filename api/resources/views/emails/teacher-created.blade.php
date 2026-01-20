<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Welcome to CoreSkool</title>
</head>

<body>
    <h2>Welcome to CoreSkool, {{ $teacherName }}!</h2>

    <p>Your teacher account has been created. Here are your login credentials:</p>

    <ul>
        <li><strong>Name:</strong> {{ $teacherName }}</li>
        <li><strong>Teacher ID:</strong> {{ $teacherId }}</li>
        <li><strong>Email:</strong> {{ $teacherEmail }}</li>
        <li><strong>Password:</strong> {{ $password }}</li>
    </ul>

    <p>Please log in and change your password after your first login for security purposes.</p>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
