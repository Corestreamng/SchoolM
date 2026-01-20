<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Student Account Created</title>
</head>

<body>
    <h2>New Student Account Created</h2>

    <p>Dear <?php echo e($parentName); ?>,</p>

    <p>A new student account has been created for your child:</p>

    <ul>
        <li><strong>Student Name:</strong> <?php echo e($studentName); ?></li>
        <li><strong>Student ID:</strong> <?php echo e($studentId); ?></li>
        <li><strong>Email:</strong> <?php echo e($studentEmail); ?></li>
        <li><strong>Class:</strong> <?php echo e($className); ?></li>
        <li><strong>Password:</strong> <?php echo e($password); ?></li>
    </ul>

    <p>Please keep these credentials safe. The student can use these credentials to log in to their account.</p>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
<?php /**PATH /home/coreskool/api/resources/views/emails/student-created.blade.php ENDPATH**/ ?>