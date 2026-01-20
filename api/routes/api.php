<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TimetableController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\ResultController;
use App\Http\Controllers\Api\TeacherAssignmentController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\BulkUploadController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard stats (admin only)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Students
    Route::apiResource('students', StudentController::class);
    Route::get('/students/download/csv', [StudentController::class, 'downloadCsv']);
    Route::post('/students/bulk-upload', [StudentController::class, 'bulkUpload']);
    Route::get('/students/upload/template', [StudentController::class, 'downloadTemplate']);

    // Teachers
    Route::apiResource('teachers', TeacherController::class);

    // Classes
    Route::apiResource('classes', ClassController::class);

    // Subjects
    Route::apiResource('subjects', SubjectController::class);

    // Parents
    Route::apiResource('parents', ParentController::class);
    Route::get('/parents/{id}/children', [ParentController::class, 'getChildren']);

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore']);
    Route::put('/attendance/{id}', [AttendanceController::class, 'update']);
    Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);

    // Grades
    Route::get('/grades', [GradeController::class, 'index']);
    Route::post('/grades', [GradeController::class, 'store']);
    Route::put('/grades/{id}', [GradeController::class, 'update']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::put('/payments/{id}', [PaymentController::class, 'update']);

    // Assignments
    Route::apiResource('assignments', AssignmentController::class);

    // Timetables
    Route::get('/timetable', [TimetableController::class, 'index']);
    Route::get('/timetable/class/{classId}', [TimetableController::class, 'getByClass']);

    Route::post('/promotions/promote', [PromotionController::class, 'promote']);
    Route::get('/promotions/class/{classId}/students', [PromotionController::class, 'getStudentsByClass']);
    Route::post('/timetable', [TimetableController::class, 'store']);
    Route::put('/timetable/{id}', [TimetableController::class, 'update']);
    Route::delete('/timetable/{id}', [TimetableController::class, 'destroy']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);

    // Results
    Route::get('/results', [ResultController::class, 'index']);
    Route::get('/results/{id}', [ResultController::class, 'show']);
    Route::get('/results/student/{studentId}', [ResultController::class, 'getByStudent']);
    Route::get('/results/download/csv', [ResultController::class, 'downloadCsv']);
    Route::post('/results', [ResultController::class, 'store']);
    Route::put('/results/{id}', [ResultController::class, 'update']);
    Route::delete('/results/{id}', [ResultController::class, 'destroy']);

    // Teacher Assignments
    Route::post('/teacher-assignments/assign', [TeacherAssignmentController::class, 'assign']);
    Route::post('/teacher-assignments/remove', [TeacherAssignmentController::class, 'remove']);
    Route::get('/teacher-assignments/{teacherId}', [TeacherAssignmentController::class, 'getAssignments']);
    Route::get('/teacher-assignments/{teacherId}/classes', [TeacherAssignmentController::class, 'getAssignedClasses']);
    Route::post('/teacher-assignments/bulk', [TeacherAssignmentController::class, 'bulkAssign']);

    // Bulk Upload
    Route::post('/bulk-upload/teachers', [BulkUploadController::class, 'uploadTeachers']);
    Route::post('/bulk-upload/parents', [BulkUploadController::class, 'uploadParents']);
    Route::get('/bulk-upload/templates/teacher', [BulkUploadController::class, 'teacherTemplate']);
    Route::get('/bulk-upload/templates/parent', [BulkUploadController::class, 'parentTemplate']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings', [SettingsController::class, 'update']);
    Route::put('/settings/evaluation-ratings', [SettingsController::class, 'updateEvaluationRatings']);

    // Roles and Permissions
    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'permissions']);

    // Audit Logs
    Route::get('/audit-logs', [AuditController::class, 'index']);
    Route::get('/audit-logs/{id}', [AuditController::class, 'show']);
});
