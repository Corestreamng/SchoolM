# School Management System - New Features Documentation

## Overview
This document describes the new features and enhancements added to the School Management System API.

## Table of Contents
1. [Bulk Upload Features](#bulk-upload-features)
2. [Settings Management](#settings-management)
3. [Roles and Permissions](#roles-and-permissions)
4. [Two-Factor Authentication](#two-factor-authentication)
5. [Audit Logs](#audit-logs)
6. [Staff ID Login](#staff-id-login)
7. [Payment Notifications](#payment-notifications)
8. [Enhanced Attendance](#enhanced-attendance)

---

## Bulk Upload Features

### Student Bulk Upload
**Endpoint:** `POST /api/students/bulk-upload`

Upload multiple students at once using a CSV file.

**Request:**
- File: CSV file with student data

**CSV Format:**
```csv
Name (Required),Email (Optional),Phone (Optional),Date of Birth (YYYY-MM-DD),Gender (male/female/other),Class Name (Optional),Parent Email (Optional)
John Doe,john.doe@example.com,+1234567890,2010-01-15,male,Grade 1A,parent@example.com
```

**Download Template:** `GET /api/students/upload/template`

### Teacher Bulk Upload
**Endpoint:** `POST /api/bulk-upload/teachers`

**CSV Format:**
```csv
Name (Required),Email (Required),Phone (Optional),Qualification (Optional),Specialization (Optional),Staff ID (Optional)
Jane Smith,jane.smith@example.com,+1234567890,B.Ed,Mathematics,STF001
```

**Download Template:** `GET /api/bulk-upload/templates/teacher`

### Parent Bulk Upload
**Endpoint:** `POST /api/bulk-upload/parents`

**CSV Format:**
```csv
Name (Required),Email (Required),Phone (Optional),Address (Optional),Occupation (Optional)
Robert Johnson,robert.johnson@example.com,+1234567890,123 Main St,Engineer
```

**Download Template:** `GET /api/bulk-upload/templates/parent`

---

## Settings Management

### Get Settings
**Endpoint:** `GET /api/settings`

Returns all school settings and evaluation ratings.

### Update Settings
**Endpoint:** `PUT /api/settings`

**Request Body:**
```json
{
  "settings": [
    {
      "key": "test_score_limit",
      "value": "40"
    },
    {
      "key": "exam_score_limit",
      "value": "60"
    }
  ]
}
```

### Available Settings Keys:
- `test_score_limit` - Maximum score for tests
- `exam_score_limit` - Maximum score for exams
- `assignment_weight` - Assignment percentage weight
- `first_test_weight` - First test percentage weight
- `second_test_weight` - Second test percentage weight
- `exam_weight` - Exam percentage weight
- `enable_auto_promotion` - Enable automatic promotion
- `promotion_pass_mark` - Minimum average score for promotion
- `enable_2fa` - Enable two-factor authentication
- `student_id_prefix` - Student ID prefix
- `last_student_number` - Last generated student number

### Update Evaluation Ratings
**Endpoint:** `PUT /api/settings/evaluation-ratings`

**Request Body:**
```json
{
  "ratings": [
    {
      "min_score": 90,
      "max_score": 100,
      "grade": "A+",
      "remark": "Outstanding",
      "description": "Outstanding performance"
    }
  ]
}
```

---

## Roles and Permissions

### List Roles
**Endpoint:** `GET /api/roles`

Returns all roles with their permissions.

### Create Role
**Endpoint:** `POST /api/roles`

**Request Body:**
```json
{
  "name": "custom_role",
  "display_name": "Custom Role",
  "description": "Custom role description",
  "permission_ids": [1, 2, 3]
}
```

### Update Role
**Endpoint:** `PUT /api/roles/{id}`

### Delete Role
**Endpoint:** `DELETE /api/roles/{id}`

Note: System roles cannot be modified or deleted.

### List Permissions
**Endpoint:** `GET /api/permissions`

Returns all available permissions grouped by category.

### Default Roles:
1. **Super Administrator** - Full system access
2. **Administrator** - School administrator
3. **Teacher** - Teacher role
4. **Student** - Student role
5. **Parent** - Parent role
6. **Cashier** - Finance officer

---

## Two-Factor Authentication

### Enable 2FA
**Endpoint:** `POST /api/2fa/enable`

**Response:**
```json
{
  "message": "2FA enabled successfully",
  "secret": "...",
  "recovery_codes": ["CODE1", "CODE2", ...]
}
```

### Disable 2FA
**Endpoint:** `POST /api/2fa/disable`

### Verify 2FA Code
**Endpoint:** `POST /api/2fa/verify`

**Request Body:**
```json
{
  "user_id": 1,
  "code": "123456"
}
```

**Response:**
```json
{
  "user": {...},
  "token": "...",
  "token_type": "Bearer"
}
```

---

## Audit Logs

### List Audit Logs
**Endpoint:** `GET /api/audit-logs`

**Query Parameters:**
- `user_id` - Filter by user
- `action` - Filter by action type
- `model_type` - Filter by model type
- `from_date` - Filter from date
- `to_date` - Filter to date
- `per_page` - Results per page (default: 50)

### Get Audit Log Details
**Endpoint:** `GET /api/audit-logs/{id}`

### Logged Actions:
- User login/logout
- 2FA enable/disable
- Student/Teacher/Parent create/update/delete
- Payment create/update
- Settings update
- Role create/update/delete
- And more...

---

## Staff ID Login

Staff members (teachers) can now login using their Staff ID instead of email.

### Login with Staff ID
**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "staff_id": "STF001",
  "password": "password"
}
```

### Login Options:
1. Email + Password
2. Student ID (matric_no) + Password
3. Staff ID + Password

---

## Payment Notifications

When a payment is marked as completed, the system automatically sends email notifications to:
1. The student
2. The student's parent (if available)

### Payment Completion
**Endpoint:** `PUT /api/payments/{id}`

**Request Body:**
```json
{
  "status": "completed",
  "payment_method": "bank_transfer",
  "paid_date": "2026-01-20"
}
```

---

## Enhanced Attendance

Attendance can now be recorded twice a day (morning and afternoon sessions).

### Record Attendance
**Endpoint:** `POST /api/attendance`

**Request Body:**
```json
{
  "student_id": 1,
  "date": "2026-01-20",
  "status": "present",
  "session": "morning"
}
```

**Session Options:**
- `morning` - Morning session
- `afternoon` - Afternoon session

---

## Additional Enhancements

### 1. Subject Code Optional
Subject codes are now optional when creating/updating subjects.

### 2. Academic Sections
Classes can now be assigned to different sections:
- Nursery
- Primary
- Secondary
- JSS (Junior Secondary School)
- SSS (Senior Secondary School)

### 3. Auto-Generated IDs
- Student IDs are auto-generated with configurable prefix
- Teacher IDs are auto-generated (TCH{YEAR}{NUMBER})
- Parent IDs are auto-generated (PAR{YEAR}{NUMBER})
- Staff IDs can be manually assigned

### 4. Email Notifications
The system sends email notifications for:
- Student registration (to parent)
- Teacher registration (to teacher)
- Parent registration (to parent)
- Payment confirmation (to student and parent)

---

## Database Migrations

To apply the new database changes, run:

```bash
php artisan migrate
```

This will create/modify the following tables:
- `school_settings`
- `roles`
- `permissions`
- `role_permission`
- `user_role`
- `audit_logs`
- `evaluation_ratings`

And add new columns to existing tables:
- `teachers.staff_id`
- `users.two_factor_enabled`
- `users.two_factor_secret`
- `users.two_factor_recovery_codes`
- `attendance.session`
- `classes.section`

---

## Security Notes

1. **Two-Factor Authentication**: The current implementation uses recovery codes. For production, integrate a proper TOTP library like `google2fa`.

2. **Audit Logs**: All sensitive actions are logged with user information, IP address, and user agent.

3. **Role-Based Access Control**: Use the roles and permissions system to control access to different parts of the application.

4. **Password Security**: All passwords are hashed using bcrypt.

---

## Next Steps

1. Implement SMS notifications (requires SMS gateway integration)
2. Add school calendar management
3. Implement automatic promotion based on performance
4. Add weighted exam score calculation
5. Add bilingual result sheets (English/Arabic)
6. Enhance mobile responsiveness in frontend dashboards

---

## Support

For issues or questions, please contact the development team.
