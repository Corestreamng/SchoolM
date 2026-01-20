<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Assignment::with(['subject', 'class', 'teacher.user']);

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show($id)
    {
        $assignment = Assignment::with([
            'subject',
            'class',
            'teacher.user',
            'submissions.student.user',
        ])->findOrFail($id);

        return response()->json($assignment);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
            'due_date' => 'required|date',
            'max_score' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,published,closed',
        ]);

        $validated['teacher_id'] = $request->user()->teacher?->id ?? $validated['teacher_id'] ?? null;
        $validated['max_score'] = $validated['max_score'] ?? 100;
        $validated['status'] = $validated['status'] ?? 'draft';

        $assignment = Assignment::create($validated);

        return response()->json($assignment->load(['subject', 'class', 'teacher.user']), 201);
    }

    public function update(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|date',
            'max_score' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,published,closed',
        ]);

        $assignment->update($validated);

        return response()->json($assignment->load(['subject', 'class', 'teacher.user']));
    }

    public function destroy($id)
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted successfully']);
    }
}

