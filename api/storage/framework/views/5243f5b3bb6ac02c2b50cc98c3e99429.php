<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title><?php echo e($subject); ?></title>
</head>

<body>
    <h2><?php echo e($subject); ?></h2>

    <p>Dear Recipient,</p>

    <p>You have received a message from <?php echo e($senderName); ?>:</p>

    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
        <?php echo nl2br(e($messageContent)); ?>

    </div>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
<?php /**PATH /home/coreskool/api/resources/views/emails/message.blade.php ENDPATH**/ ?>