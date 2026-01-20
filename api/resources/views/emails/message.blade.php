<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $subject }}</title>
</head>

<body>
    <h2>{{ $subject }}</h2>

    <p>Dear Recipient,</p>

    <p>You have received a message from {{ $senderName }}:</p>

    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
        {!! nl2br(e($messageContent)) !!}
    </div>

    <p>Best regards,<br>CoreSkool Administration</p>
</body>

</html>
