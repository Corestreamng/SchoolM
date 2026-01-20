<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $query = Grade::with(['student.user', 'subject', 'class', 'teacher.user']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
            'exam_type' => 'required|string',
            'score' => 'required|numeric|min:0',
            'max_score' => 'nullable|numeric|min:0',
            'grade' => 'nullable|string',
            'remarks' => 'nullable|string',
            'teacher_id' => 'nullable|exists:teachers,id',
            'exam_date' => 'nullable|date',
        ]);

        $validated['max_score'] = $validated['max_score'] ?? 100;
        $validated['teacher_id'] = $validated['teacher_id'] ?? $request->user()->teacher?->id;

        $grade = Grade::create($validated);

        return response()->json($grade->load(['student.user', 'subject', 'class']), 201);
    }

    public function update(Request $request, $id)
    {
        $grade = Grade::findOrFail($id);

        $validated = $request->validate([
            'score' => 'sometimes|numeric|min:0',
            'max_score' => 'nullable|numeric|min:0',
            'grade' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $grade->update($validated);

        return response()->json($grade->load(['student.user', 'subject', 'class']));
    }
}

