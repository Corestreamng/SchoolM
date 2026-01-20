<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with(['student.user', 'class', 'markedBy']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('date', [$request->date_from, $request->date_to]);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused',
            'notes' => 'nullable|string',
        ]);

        // Check if attendance already exists for this student and date
        $existing = Attendance::where('student_id', $validated['student_id'])
            ->whereDate('date', $validated['date'])
            ->first();

        if ($existing) {
            $existing->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'marked_by' => $request->user()->id,
            ]);
            return response()->json($existing->load(['student.user', 'class']));
        }

        $validated['marked_by'] = $request->user()->id;
        $attendance = Attendance::create($validated);

        return response()->json($attendance->load(['student.user', 'class']), 201);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $created = [];
        foreach ($validated['attendances'] as $attendanceData) {
            $existing = Attendance::where('student_id', $attendanceData['student_id'])
                ->whereDate('date', $validated['date'])
                ->first();

            if ($existing) {
                $existing->update([
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                    'marked_by' => $request->user()->id,
                ]);
                $created[] = $existing;
            } else {
                $created[] = Attendance::create([
                    'student_id' => $attendanceData['student_id'],
                    'class_id' => $validated['class_id'],
                    'date' => $validated['date'],
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                    'marked_by' => $request->user()->id,
                ]);
            }
        }

        return response()->json($created, 201);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:present,absent,late,excused',
            'notes' => 'nullable|string',
        ]);

        $attendance->update([
            'status' => $validated['status'] ?? $attendance->status,
            'notes' => $validated['notes'] ?? $attendance->notes,
            'marked_by' => $request->user()->id,
        ]);

        return response()->json($attendance->load(['student.user', 'class', 'markedBy']));
    }

    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted successfully']);
    }
}
