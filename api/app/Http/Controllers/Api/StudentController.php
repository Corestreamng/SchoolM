<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\SchoolSetting;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['user', 'class', 'parent.user']);

        // If user is a parent, only show their children
        $user = $request->user();
        if ($user && $user->role === 'parent') {
            $parent = \App\Models\ParentModel::where('user_id', $user->id)->first();
            if ($parent) {
                $query->where('parent_id', $parent->id);
            }
        } elseif ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                    ->orWhere('student_id', 'like', "%{$search}%");
            });
        }


        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show($id)
    {
        $student = Student::with([
            'user',
            'class.classTeacher.user',
            'parent.user',
            'attendances',
            'grades.subject',
            'payments',
        ])->findOrFail($id);

        return response()->json($student);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string',
            'student_id' => 'nullable|unique:students,student_id',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'class_id' => 'nullable|exists:classes,id',
            'parent_id' => 'nullable|exists:parents,id',
            'admission_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,graduated,suspended',
        ]);

        // Auto-generate student_id if not provided
        if (empty($validated['student_id'])) {
            $prefix = SchoolSetting::get('student_id_prefix', 'STU');
            $lastNumber = (int) SchoolSetting::get('last_student_number', 0);
            $year = date('Y');
            
            $newNumber = $lastNumber + 1;
            $validated['student_id'] = $prefix . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
            
            // Update last student number
            SchoolSetting::set('last_student_number', $newNumber);
        }

        // Generate email if not provided
        if (empty($validated['email'])) {
            $validated['email'] = strtolower(str_replace(' ', '', $validated['name'])) . '@coreskool.local';
            // Ensure uniqueness
            $counter = 1;
            $baseEmail = $validated['email'];
            while (\App\Models\User::where('email', $validated['email'])->exists()) {
                $validated['email'] = str_replace('@coreskool.local', $counter . '@coreskool.local', $baseEmail);
                $counter++;
            }
        }

        // Generate random password if not provided
        $password = $validated['password'] ?? \Illuminate\Support\Str::random(12);

        // Create user first
        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'role' => 'student',
            'phone' => $validated['phone'] ?? null,
        ]);

        // Create student record
        $student = Student::create([
            'user_id' => $user->id,
            'student_id' => $validated['student_id'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'class_id' => $validated['class_id'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'admission_date' => $validated['admission_date'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // Send email to parent if parent_id is provided
        if ($validated['parent_id']) {
            $parent = \App\Models\ParentModel::with('user')->find($validated['parent_id']);
            if ($parent && $parent->user) {
                try {
                    \Illuminate\Support\Facades\Mail::send('emails.student-created', [
                        'studentName' => $validated['name'],
                        'studentEmail' => $validated['email'],
                        'studentId' => $validated['student_id'],
                        'password' => $password,
                        'parentName' => $parent->user->name,
                        'className' => $student->class ? $student->class->name : 'Not assigned',
                    ], function ($message) use ($parent) {
                        $message->to($parent->user->email, $parent->user->name)
                            ->subject('New Student Account Created');
                    });
                } catch (\Exception $e) {
                    // Log error but don't fail the request
                    Log::error('Failed to send email to parent: ' . $e->getMessage());
                }
            }
        }

        // Log the action
        AuditLog::logAction('student.create', $student, null, $student->toArray());

        return response()->json($student->load(['user', 'class', 'parent']), 201);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $student->user_id,
            'phone' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'class_id' => 'nullable|exists:classes,id',
            'parent_id' => 'nullable|exists:parents,id',
            'admission_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,graduated,suspended',
        ]);

        // Update user information if provided
        if ($student->user && (isset($validated['name']) || isset($validated['email']) || isset($validated['phone']))) {
            $userData = [];
            if (isset($validated['name'])) {
                $userData['name'] = $validated['name'];
                unset($validated['name']);
            }
            if (isset($validated['email'])) {
                $userData['email'] = $validated['email'];
                unset($validated['email']);
            }
            if (isset($validated['phone'])) {
                $userData['phone'] = $validated['phone'];
                unset($validated['phone']);
            }
            $student->user->update($userData);
        }

        $student->update($validated);

        return response()->json($student->load(['user', 'class', 'parent']));
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }

    public function downloadCsv(Request $request)
    {
        $request->validate([
            'academic_session' => 'required|string',
        ]);

        $academicSession = $request->academic_session;

        // Get all students who have results for this academic session
        $studentsWithResults = Student::with(['user', 'class', 'parent.user'])
            ->whereHas('results', function ($query) use ($academicSession) {
                $query->where('academic_year', $academicSession);
            })
            ->get()
            ->pluck('id')
            ->toArray();

        // Get all active students (including those without results)
        $allActiveStudents = Student::with(['user', 'class', 'parent.user'])
            ->where('status', 'active')
            ->get();

        // If we have students with results, use them; otherwise use all active students
        $students = $studentsWithResults ?
            Student::with(['user', 'class', 'parent.user'])
            ->whereIn('id', $studentsWithResults)
            ->get() :
            $allActiveStudents;

        $filename = 'students_' . str_replace('/', '_', $academicSession) . '_' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($students) {
            $file = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($file, [
                'Student ID',
                'Name',
                'Email',
                'Phone',
                'Date of Birth',
                'Gender',
                'Class',
                'Parent Name',
                'Parent Email',
                'Parent Phone',
                'Admission Date',
                'Status',
            ]);

            // Add student data
            foreach ($students as $student) {
                fputcsv($file, [
                    $student->student_id ?? '',
                    $student->user->name ?? '',
                    $student->user->email ?? '',
                    $student->user->phone ?? '',
                    $student->date_of_birth ?? '',
                    $student->gender ?? '',
                    $student->class->name ?? '',
                    $student->parent->user->name ?? '',
                    $student->parent->user->email ?? '',
                    $student->parent->user->phone ?? '',
                    $student->admission_date ?? '',
                    $student->status ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function bulkUpload(Request $request)
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
                $email = trim($data[1]) ?: null;
                $phone = trim($data[2]) ?: null;
                $dateOfBirth = trim($data[3] ?? '') ?: null;
                $gender = trim($data[4] ?? '') ?: null;
                $className = trim($data[5] ?? '') ?: null;
                $parentEmail = trim($data[6] ?? '') ?: null;

                if (empty($name)) {
                    $errors[] = "Row {$row}: Name is required";
                    continue;
                }

                // Find class by name
                $classId = null;
                if ($className) {
                    $class = \App\Models\SchoolClass::where('name', $className)->first();
                    $classId = $class ? $class->id : null;
                }

                // Find parent by email
                $parentId = null;
                if ($parentEmail) {
                    $parentUser = \App\Models\User::where('email', $parentEmail)->where('role', 'parent')->first();
                    if ($parentUser) {
                        $parent = \App\Models\ParentModel::where('user_id', $parentUser->id)->first();
                        $parentId = $parent ? $parent->id : null;
                    }
                }

                // Auto-generate student_id
                $prefix = SchoolSetting::get('student_id_prefix', 'STU');
                $lastNumber = (int) SchoolSetting::get('last_student_number', 0);
                $year = date('Y');
                
                $newNumber = $lastNumber + 1;
                $studentId = $prefix . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
                
                // Update last student number
                SchoolSetting::set('last_student_number', $newNumber);

                // Generate email if not provided
                if (empty($email)) {
                    $email = strtolower(str_replace(' ', '', $name)) . '@coreskool.local';
                    $counter = 1;
                    $baseEmail = $email;
                    while (\App\Models\User::where('email', $email)->exists()) {
                        $email = str_replace('@coreskool.local', $counter . '@coreskool.local', $baseEmail);
                        $counter++;
                    }
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
                    'role' => 'student',
                    'phone' => $phone,
                ]);

                // Create student
                $student = Student::create([
                    'user_id' => $user->id,
                    'student_id' => $studentId,
                    'date_of_birth' => $dateOfBirth,
                    'gender' => $gender,
                    'class_id' => $classId,
                    'parent_id' => $parentId,
                    'admission_date' => now(),
                    'status' => 'active',
                ]);

                $created[] = [
                    'student_id' => $studentId,
                    'name' => $name,
                    'email' => $email,
                    'password' => $password,
                ];

                // Send email to parent if available
                if ($parentId) {
                    $parent = \App\Models\ParentModel::with('user')->find($parentId);
                    if ($parent && $parent->user) {
                        try {
                            \Illuminate\Support\Facades\Mail::send('emails.student-created', [
                                'studentName' => $name,
                                'studentEmail' => $email,
                                'studentId' => $studentId,
                                'password' => $password,
                                'parentName' => $parent->user->name,
                                'className' => $className ?? 'Not assigned',
                            ], function ($message) use ($parent) {
                                $message->to($parent->user->email, $parent->user->name)
                                    ->subject('New Student Account Created');
                            });
                        } catch (\Exception $e) {
                            Log::error('Failed to send email to parent: ' . $e->getMessage());
                        }
                    }
                }

            } catch (\Exception $e) {
                $errors[] = "Row {$row}: " . $e->getMessage();
            }
        }

        fclose($handle);

        // Log the action
        AuditLog::logAction('students.bulk_upload', null, null, [
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

    public function downloadTemplate()
    {
        $filename = 'student_upload_template.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($file, [
                'Name (Required)',
                'Email (Optional)',
                'Phone (Optional)',
                'Date of Birth (YYYY-MM-DD)',
                'Gender (male/female/other)',
                'Class Name (Optional)',
                'Parent Email (Optional)',
            ]);

            // Add sample row
            fputcsv($file, [
                'John Doe',
                'john.doe@example.com',
                '+1234567890',
                '2010-01-15',
                'male',
                'Grade 1A',
                'parent@example.com',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
