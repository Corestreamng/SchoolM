<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Welcome to CoreSkool</title>
</head>

<body>
    <h2>Welcome to CoreSkool, <?php echo e($teacherName); ?>!</h2>

    <p>Your teacher account has been created. Here are your login credentials:</p>

    <ul>
        <li><strong>Name:</strong> <?php echo e($teacherName); ?></li>
        <li><strong>Teacher ID:</strong> <?php echo e($teacherId); ?></li>
        <li><strong>Email:</strong> <?php echo e($teacherEmail); ?></li>
        <li><strong>Password:</strong> <?php echo e($password); ?></li>
    </ul>

    <p>Please log in and change your password after your first login for security purposes.</p>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
<?php /**PATH /home/coreskool/api/resources/views/emails/teacher-created.blade.php ENDPATH**/ ?>