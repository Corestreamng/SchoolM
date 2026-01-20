<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherAssignmentController extends Controller
{
  /**
   * Assign teacher to subject and class
   */
  public function assign(Request $request)
  {
    $validated = $request->validate([
      'teacher_id' => 'required|exists:teachers,id',
      'subject_id' => 'required|exists:subjects,id',
      'class_id' => 'required|exists:classes,id',
    ]);

    // Check if assignment already exists
    $existing = DB::table('class_subject')
      ->where('class_id', $validated['class_id'])
      ->where('subject_id', $validated['subject_id'])
      ->first();

    if ($existing) {
      // Update existing assignment
      DB::table('class_subject')
        ->where('class_id', $validated['class_id'])
        ->where('subject_id', $validated['subject_id'])
        ->update([
          'teacher_id' => $validated['teacher_id'],
          'updated_at' => now(),
        ]);
    } else {
      // Create new assignment
      DB::table('class_subject')->insert([
        'class_id' => $validated['class_id'],
        'subject_id' => $validated['subject_id'],
        'teacher_id' => $validated['teacher_id'],
        'created_at' => now(),
        'updated_at' => now(),
      ]);
    }

    $teacher = Teacher::with(['user', 'subjects', 'classes'])->findOrFail($validated['teacher_id']);

    return response()->json([
      'message' => 'Teacher assigned successfully',
      'teacher' => $teacher,
    ]);
  }

  /**
   * Remove teacher assignment from subject and class
   */
  public function remove(Request $request)
  {
    $validated = $request->validate([
      'teacher_id' => 'required|exists:teachers,id',
      'subject_id' => 'required|exists:subjects,id',
      'class_id' => 'required|exists:classes,id',
    ]);

    DB::table('class_subject')
      ->where('class_id', $validated['class_id'])
      ->where('subject_id', $validated['subject_id'])
      ->where('teacher_id', $validated['teacher_id'])
      ->update(['teacher_id' => null]);

    return response()->json(['message' => 'Teacher assignment removed successfully']);
  }

  /**
   * Get teacher assignments
   */
  public function getAssignments($teacherId)
  {
    $assignments = DB::table('class_subject')
      ->where('teacher_id', $teacherId)
      ->join('classes', 'class_subject.class_id', '=', 'classes.id')
      ->join('subjects', 'class_subject.subject_id', '=', 'subjects.id')
      ->select(
        'class_subject.id',
        'classes.id as class_id',
        'classes.name as class_name',
        'subjects.id as subject_id',
        'subjects.name as subject_name',
        'subjects.code as subject_code'
      )
      ->get();

    return response()->json($assignments);
  }

  /**
   * Get classes assigned to a teacher
   */
  public function getAssignedClasses($teacherId)
  {
    // Get class IDs where teacher is assigned via class_subject pivot table
    $classIdsFromSubjects = DB::table('class_subject')
      ->where('teacher_id', $teacherId)
      ->distinct()
      ->pluck('class_id')
      ->toArray();

    // Get class IDs where teacher is the class teacher or second class teacher
    $classIdsFromTeachers = SchoolClass::where(function ($query) use ($teacherId) {
      $query->where('class_teacher_id', $teacherId)
        ->orWhere('second_class_teacher_id', $teacherId);
    })
      ->pluck('id')
      ->toArray();

    // Combine both sets of class IDs
    $allClassIds = array_unique(array_merge($classIdsFromSubjects, $classIdsFromTeachers));

    // If no classes found, return empty array
    if (empty($allClassIds)) {
      return response()->json([]);
    }

    // Get all unique classes with their details
    $classes = SchoolClass::whereIn('id', $allClassIds)
      ->where('status', 'active') // Only return active classes
      ->select('id', 'name', 'code', 'level', 'status')
      ->orderBy('name')
      ->get();

    return response()->json($classes);
  }

  /**
   * Bulk assign teacher to multiple subjects and classes
   */
  public function bulkAssign(Request $request)
  {
    $validated = $request->validate([
      'teacher_id' => 'required|exists:teachers,id',
      'assignments' => 'required|array|min:1',
      'assignments.*.subject_id' => 'required|exists:subjects,id',
      'assignments.*.class_id' => 'required|exists:classes,id',
    ]);

    $assignments = [];
    foreach ($validated['assignments'] as $assignment) {
      $existing = DB::table('class_subject')
        ->where('class_id', $assignment['class_id'])
        ->where('subject_id', $assignment['subject_id'])
        ->first();

      if ($existing) {
        DB::table('class_subject')
          ->where('class_id', $assignment['class_id'])
          ->where('subject_id', $assignment['subject_id'])
          ->update([
            'teacher_id' => $validated['teacher_id'],
            'updated_at' => now(),
          ]);
      } else {
        DB::table('class_subject')->insert([
          'class_id' => $assignment['class_id'],
          'subject_id' => $assignment['subject_id'],
          'teacher_id' => $validated['teacher_id'],
          'created_at' => now(),
          'updated_at' => now(),
        ]);
      }

      $assignments[] = [
        'class_id' => $assignment['class_id'],
        'subject_id' => $assignment['subject_id'],
      ];
    }

    $teacher = Teacher::with(['user', 'subjects', 'classes'])->findOrFail($validated['teacher_id']);

    return response()->json([
      'message' => 'Teacher assignments updated successfully',
      'teacher' => $teacher,
    ]);
  }
}
