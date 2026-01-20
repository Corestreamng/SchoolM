<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Student Account Created</title>
</head>

<body>
    <h2>New Student Account Created</h2>

    <p>Dear {{ $parentName }},</p>

    <p>A new student account has been created for your child:</p>

    <ul>
        <li><strong>Student Name:</strong> {{ $studentName }}</li>
        <li><strong>Student ID:</strong> {{ $studentId }}</li>
        <li><strong>Email:</strong> {{ $studentEmail }}</li>
        <li><strong>Class:</strong> {{ $className }}</li>
        <li><strong>Password:</strong> {{ $password }}</li>
    </ul>

    <p>Please keep these credentials safe. The student can use these credentials to log in to their account.</p>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
