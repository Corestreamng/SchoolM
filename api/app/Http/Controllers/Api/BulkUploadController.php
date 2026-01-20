<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\SchoolSetting;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class BulkUploadController extends Controller
{
    public function uploadTeachers(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Skip header row
        fgetcsv($handle);

        $created = [];
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;

            try {
                if (count($data) < 3) {
                    $errors[] = "Row {$row}: Insufficient data";
                    continue;
                }

                $name = trim($data[0]);
                $email = trim($data[1]);
                $phone = trim($data[2]) ?: null;
                $qualification = trim($data[3] ?? '') ?: null;
                $specialization = trim($data[4] ?? '') ?: null;
                $staffId = trim($data[5] ?? '') ?: null;

                if (empty($name) || empty($email)) {
                    $errors[] = "Row {$row}: Name and email are required";
                    continue;
                }

                // Check if email already exists
                if (\App\Models\User::where('email', $email)->exists()) {
                    $errors[] = "Row {$row}: Email {$email} already exists";
                    continue;
                }

                // Generate random password
                $password = \Illuminate\Support\Str::random(12);

                // Create user
                $user = \App\Models\User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'role' => 'teacher',
                    'phone' => $phone,
                ]);

                // Auto-generate teacher_id
                $year = date('Y');
                $lastTeacher = Teacher::where('teacher_id', 'like', "TCH{$year}%")
                    ->orderBy('teacher_id', 'desc')
                    ->first();

                if ($lastTeacher) {
                    $lastNumber = (int) substr($lastTeacher->teacher_id, -4);
                    $newNumber = $lastNumber + 1;
                } else {
                    $newNumber = 1;
                }

                $teacherId = 'TCH' . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);

                // Create teacher
                $teacher = Teacher::create([
                    'user_id' => $user->id,
                    'teacher_id' => $teacherId,
                    'staff_id' => $staffId,
                    'qualification' => $qualification,
                    'specialization' => $specialization,
                    'hire_date' => now(),
                    'status' => 'active',
                ]);

                $created[] = [
                    'teacher_id' => $teacherId,
                    'staff_id' => $staffId,
                    'name' => $name,
                    'email' => $email,
                    'password' => $password,
                ];

                // Send email to teacher
                try {
                    \Illuminate\Support\Facades\Mail::send('emails.teacher-created', [
                        'teacherName' => $name,
                        'email' => $email,
                        'teacherId' => $teacherId,
                        'staffId' => $staffId,
                        'password' => $password,
                    ], function ($message) use ($email, $name) {
                        $message->to($email, $name)
                            ->subject('Your Teacher Account Has Been Created');
                    });
                } catch (\Exception $e) {
                    Log::error('Failed to send email to teacher: ' . $e->getMessage());
                }

            } catch (\Exception $e) {
                $errors[] = "Row {$row}: " . $e->getMessage();
            }
        }

        fclose($handle);

        // Log the action
        AuditLog::logAction('teachers.bulk_upload', null, null, [
            'created_count' => count($created),
            'error_count' => count($errors),
        ]);

        return response()->json([
            'message' => 'Bulk upload completed',
            'created' => $created,
            'errors' => $errors,
            'summary' => [
                'total_processed' => count($created) + count($errors),
                'successful' => count($created),
                'failed' => count($errors),
            ],
        ]);
    }

    public function uploadParents(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Skip header row
        fgetcsv($handle);

        $created = [];
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;

            try {
                if (count($data) < 2) {
                    $errors[] = "Row {$row}: Insufficient data";
                    continue;
                }

                $name = trim($data[0]);
                $email = trim($data[1]);
                $phone = trim($data[2]) ?: null;
                $address = trim($data[3] ?? '') ?: null;
                $occupation = trim($data[4] ?? '') ?: null;

                if (empty($name) || empty($email)) {
                    $errors[] = "Row {$row}: Name and email are required";
                    continue;
                }

                // Check if email already exists
                if (\App\Models\User::where('email', $email)->exists()) {
                    $errors[] = "Row {$row}: Email {$email} already exists";
                    continue;
                }

                // Generate random password
                $password = \Illuminate\Support\Str::random(12);

                // Create user
                $user = \App\Models\User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'role' => 'parent',
                    'phone' => $phone,
                    'address' => $address,
                ]);

                // Auto-generate parent_id
                $year = date('Y');
                $lastParent = ParentModel::where('parent_id', 'like', "PAR{$year}%")
                    ->orderBy('parent_id', 'desc')
                    ->first();

                if ($lastParent) {
                    $lastNumber = (int) substr($lastParent->parent_id, -4);
                    $newNumber = $lastNumber + 1;
                } else {
                    $newNumber = 1;
                }

                $parentId = 'PAR' . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);

                // Create parent
                $parent = ParentModel::create([
                    'user_id' => $user->id,
                    'parent_id' => $parentId,
                    'occupation' => $occupation,
                ]);

                $created[] = [
                    'parent_id' => $parentId,
                    'name' => $name,
                    'email' => $email,
                    'password' => $password,
                ];

                // Send email to parent
                try {
                    \Illuminate\Support\Facades\Mail::send('emails.parent-created', [
                        'parentName' => $name,
                        'email' => $email,
                        'parentId' => $parentId,
                        'password' => $password,
                    ], function ($message) use ($email, $name) {
                        $message->to($email, $name)
                            ->subject('Your Parent Account Has Been Created');
                    });
                } catch (\Exception $e) {
                    Log::error('Failed to send email to parent: ' . $e->getMessage());
                }

            } catch (\Exception $e) {
                $errors[] = "Row {$row}: " . $e->getMessage();
            }
        }

        fclose($handle);

        // Log the action
        AuditLog::logAction('parents.bulk_upload', null, null, [
            'created_count' => count($created),
            'error_count' => count($errors),
        ]);

        return response()->json([
            'message' => 'Bulk upload completed',
            'created' => $created,
            'errors' => $errors,
            'summary' => [
                'total_processed' => count($created) + count($errors),
                'successful' => count($created),
                'failed' => count($errors),
            ],
        ]);
    }

    public function teacherTemplate()
    {
        $filename = 'teacher_upload_template.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Name (Required)',
                'Email (Required)',
                'Phone (Optional)',
                'Qualification (Optional)',
                'Specialization (Optional)',
                'Staff ID (Optional)',
            ]);

            fputcsv($file, [
                'Jane Smith',
                'jane.smith@example.com',
                '+1234567890',
                'B.Ed',
                'Mathematics',
                'STF001',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function parentTemplate()
    {
        $filename = 'parent_upload_template.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Name (Required)',
                'Email (Required)',
                'Phone (Optional)',
                'Address (Optional)',
                'Occupation (Optional)',
            ]);

            fputcsv($file, [
                'Robert Johnson',
                'robert.johnson@example.com',
                '+1234567890',
                '123 Main St, City, State',
                'Engineer',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
