<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Timetable;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $query = Timetable::with(['class', 'subject', 'teacher.user']);

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('day')) {
            $query->where('day_of_week', $request->day);
        }

        $perPage = $request->per_page ?? 15;

        return response()->json($query->paginate($perPage));
    }

    public function getByClass($classId)
    {
        $timetables = Timetable::with(['class', 'subject', 'teacher.user'])
            ->where('class_id', $classId)
            ->get();

        return response()->json($timetables);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'day' => 'required|string',
            'day_of_week' => 'sometimes|string', // For backward compatibility
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'room' => 'nullable|string',
        ]);

        // Map 'day' to 'day_of_week' if provided
        if (isset($validated['day']) && !isset($validated['day_of_week'])) {
            $validated['day_of_week'] = $validated['day'];
            unset($validated['day']);
        }

        // Check if there's already an entry for this class, day, and time slot
        $existingEntry = Timetable::where('class_id', $validated['class_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('start_time', $validated['start_time'])
            ->first();

        if ($existingEntry) {
            // Update existing entry instead of creating a new one
            $existingEntry->update([
                'subject_id' => $validated['subject_id'],
                'teacher_id' => $validated['teacher_id'] ?? null,
                'end_time' => $validated['end_time'],
                'room' => $validated['room'] ?? null,
            ]);

            return response()->json($existingEntry->load(['class', 'subject', 'teacher.user']));
        }

        $timetable = Timetable::create($validated);

        return response()->json($timetable->load(['class', 'subject', 'teacher.user']), 201);
    }

    public function update(Request $request, $id)
    {
        $timetable = Timetable::findOrFail($id);

        $validated = $request->validate([
            'subject_id' => 'sometimes|exists:subjects,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'day' => 'sometimes|string',
            'day_of_week' => 'sometimes|string',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'room' => 'nullable|string',
        ]);

        // Map 'day' to 'day_of_week' if provided
        if (isset($validated['day']) && !isset($validated['day_of_week'])) {
            $validated['day_of_week'] = $validated['day'];
            unset($validated['day']);
        }

        $timetable->update($validated);

        return response()->json($timetable->load(['class', 'subject', 'teacher.user']));
    }

    public function destroy($id)
    {
        $timetable = Timetable::findOrFail($id);
        $timetable->delete();

        return response()->json(['message' => 'Timetable entry deleted successfully']);
    }
}
