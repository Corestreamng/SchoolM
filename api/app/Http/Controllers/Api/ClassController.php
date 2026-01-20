<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::with(['classTeacher.user', 'secondClassTeacher.user', 'students']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show($id)
    {
        $class = SchoolClass::with([
            'classTeacher.user',
            'secondClassTeacher.user',
            'students.user',
            'subjects',
            'timetables.subject',
            'timetables.teacher.user',
        ])->findOrFail($id);

        return response()->json($class);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|unique:classes,code',
            'level' => 'nullable|string',
            'class_teacher_id' => 'nullable|exists:teachers,id',
            'second_class_teacher_id' => 'nullable|exists:teachers,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Auto-generate class code if not provided
        if (empty($validated['code'])) {
            // Extract level/number from name (e.g., "JSS 1A" -> "JSS1A")
            $nameParts = explode(' ', $validated['name']);
            $code = strtoupper(implode('', $nameParts));

            // Ensure uniqueness
            $counter = 1;
            $baseCode = $code;
            while (SchoolClass::where('code', $code)->exists()) {
                $code = $baseCode . $counter;
                $counter++;
            }

            $validated['code'] = $code;
        }

        $class = SchoolClass::create($validated);

        return response()->json($class->load(['classTeacher.user', 'secondClassTeacher.user']), 201);
    }

    public function update(Request $request, $id)
    {
        $class = SchoolClass::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'level' => 'nullable|string',
            'class_teacher_id' => 'nullable|exists:teachers,id',
            'second_class_teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'nullable|in:active,inactive',
        ]);

        $class->update($validated);

        return response()->json($class->load(['classTeacher.user', 'secondClassTeacher.user']));
    }

    public function destroy($id)
    {
        $class = SchoolClass::findOrFail($id);
        $class->delete();

        return response()->json(['message' => 'Class deleted successfully']);
    }
}
