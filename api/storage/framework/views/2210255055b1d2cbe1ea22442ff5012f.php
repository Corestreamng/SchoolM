<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Parent Account Created</title>
</head>

<body>
    <h2>Welcome to CoreSkool, <?php echo e($parentName); ?>!</h2>

    <p>Your parent account has been created. Here are your login credentials:</p>

    <ul>
        <li><strong>Name:</strong> <?php echo e($parentName); ?></li>
        <li><strong>Parent ID:</strong> <?php echo e($parentId); ?></li>
        <li><strong>Email:</strong> <?php echo e($parentEmail); ?></li>
        <li><strong>Password:</strong> <?php echo e($password); ?></li>
    </ul>

    <p>Please log in and change your password after your first login for security purposes.</p>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
<?php /**PATH /home/coreskool/api/resources/views/emails/parent-created.blade.php ENDPATH**/ ?>