<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
  /**
   * Promote students to a new class
   */
  public function promote(Request $request)
  {
    $validated = $request->validate([
      'student_ids' => 'required|array|min:1',
      'student_ids.*' => 'required|exists:students,id',
      'new_class_id' => 'required|exists:classes,id',
      'academic_year' => 'nullable|string',
    ]);

    $students = Student::whereIn('id', $validated['student_ids'])->get();

    foreach ($students as $student) {
      $student->update([
        'class_id' => $validated['new_class_id'],
      ]);
    }

    return response()->json([
      'message' => 'Students promoted successfully',
      'promoted_count' => $students->count(),
    ]);
  }

  /**
   * Get students by class for promotion selection
   */
  public function getStudentsByClass($classId)
  {
    $students = Student::with(['user', 'class'])
      ->where('class_id', $classId)
      ->where('status', 'active')
      ->get();

    return response()->json($students);
  }
}
