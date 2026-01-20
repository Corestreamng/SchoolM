<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $query = Teacher::with([
            'user',
            'classes',
            'subjects' => function ($q) {
                $q->withPivot('class_id');
            }
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('teacher_id', 'like', "%{$search}%");
        }

        // Get assignments from class_subject pivot table
        $teachers = $query->paginate($request->per_page ?? 15);

        // Add assignments data
        foreach ($teachers->items() as $teacher) {
            $assignments = DB::table('class_subject')
                ->where('teacher_id', $teacher->id)
                ->join('classes', 'class_subject.class_id', '=', 'classes.id')
                ->join('subjects', 'class_subject.subject_id', '=', 'subjects.id')
                ->select(
                    'classes.id as class_id',
                    'classes.name as class_name',
                    'subjects.id as subject_id',
                    'subjects.name as subject_name'
                )
                ->get();

            $teacher->assignments = $assignments;
        }

        return response()->json($teachers);
    }

    public function show($id)
    {
        $teacher = Teacher::with([
            'user',
            'classes',
            'subjects',
            'assignments',
            'timetables',
        ])->findOrFail($id);

        return response()->json($teacher);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string',
            'teacher_id' => 'nullable|unique:teachers,teacher_id',
            'qualification' => 'nullable|string',
            'specialization' => 'nullable|string',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,on_leave,cashier,staff',
        ]);

        // Auto-generate teacher_id if not provided
        if (empty($validated['teacher_id'])) {
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

            $validated['teacher_id'] = 'TCH' . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
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
            'password' => \Illuminate\Support\Facades\Hash::make($password),
            'role' => 'teacher',
            'phone' => $validated['phone'] ?? null,
        ]);

        // Create teacher record
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'teacher_id' => $validated['teacher_id'],
            'qualification' => $validated['qualification'] ?? null,
            'specialization' => $validated['specialization'] ?? null,
            'hire_date' => $validated['hire_date'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // Send email to teacher with credentials
        try {
            \Illuminate\Support\Facades\Mail::send('emails.teacher-created', [
                'teacherName' => $validated['name'],
                'teacherEmail' => $validated['email'],
                'teacherId' => $validated['teacher_id'],
                'password' => $password,
            ], function ($message) use ($validated) {
                $message->to($validated['email'], $validated['name'])
                    ->subject('Welcome to CoreSkool - Your Account Details');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the request
            Log::error('Failed to send email to teacher: ' . $e->getMessage());
        }

        return response()->json($teacher->load('user'), 201);
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $teacher->user_id,
            'phone' => 'nullable|string',
            'qualification' => 'nullable|string',
            'specialization' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,on_leave,cashier,staff',
        ]);

        // Update user if name or email provided
        if (isset($validated['name']) || isset($validated['email']) || isset($validated['phone'])) {
            $userData = [];
            if (isset($validated['name'])) $userData['name'] = $validated['name'];
            if (isset($validated['email'])) $userData['email'] = $validated['email'];
            if (isset($validated['phone'])) $userData['phone'] = $validated['phone'];

            $teacher->user->update($userData);
            unset($validated['name'], $validated['email'], $validated['phone']);
        }

        $teacher->update($validated);

        return response()->json($teacher->load('user'));
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        $teacher->delete();

        return response()->json(['message' => 'Teacher deleted successfully']);
    }
}
