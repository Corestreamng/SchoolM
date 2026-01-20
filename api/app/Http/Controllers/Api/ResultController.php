<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\SubjectScore;
use Illuminate\Http\Request;

class ResultController extends Controller
{
  public function index(Request $request)
  {
    $query = Result::with([
      'student.user',
      'student:id,student_id,user_id',
      'class',
      'subjectScores.subject'
    ]);

    if ($request->has('student_id')) {
      $query->where('student_id', $request->student_id);
    }

    if ($request->has('class_id')) {
      $query->where('class_id', $request->class_id);
    }

    if ($request->has('academic_year')) {
      $query->where('academic_year', $request->academic_year);
    }

    if ($request->has('term')) {
      $query->where('term', $request->term);
    }

    $perPage = $request->per_page ?? 15;

    return response()->json($query->paginate($perPage));
  }

  public function show($id)
  {
    $result = Result::with([
      'student.user',
      'student:id,student_id,user_id',
      'class',
      'subjectScores.subject'
    ])->findOrFail($id);

    return response()->json($result);
  }

  public function getByStudent($studentId)
  {
    $results = Result::with([
      'student.user',
      'class',
      'subjectScores.subject'
    ])->where('student_id', $studentId)->get();

    return response()->json($results);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'student_id' => 'required|exists:students,id',
      'class_id' => 'required|exists:classes,id',
      'academic_year' => 'required|string',
      'term' => 'required|string',
      'subject_scores' => 'required|array|min:1',
      'subject_scores.*.subject_id' => 'required|exists:subjects,id',
      'subject_scores.*.assignment' => 'nullable|numeric|min:0|max:100',
      'subject_scores.*.first_test' => 'nullable|numeric|min:0|max:100',
      'subject_scores.*.second_test' => 'nullable|numeric|min:0|max:100',
      'subject_scores.*.exam' => 'nullable|numeric|min:0|max:100',
      'form_master_remark' => 'nullable|string',
      'principal_remark' => 'nullable|string',
      'verbal_skills' => 'nullable|string|in:A,B,C,D,E',
      'self_control' => 'nullable|string|in:A,B,C,D,E',
      'obedience' => 'nullable|string|in:A,B,C,D,E',
      'punctuality' => 'nullable|string|in:A,B,C,D,E',
      'honesty' => 'nullable|string|in:A,B,C,D,E',
      'assignment' => 'nullable|string|in:A,B,C,D,E',
      'neatness' => 'nullable|string|in:A,B,C,D,E',
      'attitude_to_learn' => 'nullable|string|in:A,B,C,D,E',
    ]);

    // Check if result already exists for this student, class, academic year, and term
    $existingResult = Result::where('student_id', $validated['student_id'])
      ->where('class_id', $validated['class_id'])
      ->where('academic_year', $validated['academic_year'])
      ->where('term', $validated['term'])
      ->first();

    if ($existingResult) {
      return response()->json([
        'message' => 'Result already exists for this student, class, academic year, and term.'
      ], 422);
    }

    // Create the result
    $result = Result::create([
      'student_id' => $validated['student_id'],
      'class_id' => $validated['class_id'],
      'academic_year' => $validated['academic_year'],
      'term' => $validated['term'],
      'form_master_remark' => $validated['form_master_remark'] ?? null,
      'principal_remark' => $validated['principal_remark'] ?? null,
      'verbal_skills' => $validated['verbal_skills'] ?? null,
      'self_control' => $validated['self_control'] ?? null,
      'obedience' => $validated['obedience'] ?? null,
      'punctuality' => $validated['punctuality'] ?? null,
      'honesty' => $validated['honesty'] ?? null,
      'assignment' => $validated['assignment'] ?? null,
      'neatness' => $validated['neatness'] ?? null,
      'attitude_to_learn' => $validated['attitude_to_learn'] ?? null,
    ]);

    // Create subject scores
    foreach ($validated['subject_scores'] as $scoreData) {
      SubjectScore::create([
        'result_id' => $result->id,
        'subject_id' => $scoreData['subject_id'],
        'assignment' => $scoreData['assignment'] ?? null,
        'first_test' => $scoreData['first_test'] ?? null,
        'second_test' => $scoreData['second_test'] ?? null,
        'exam' => $scoreData['exam'] ?? null,
      ]);
    }

    // Calculate stats (this will be done automatically by the model, but we refresh to get updated values)
    $result->refresh();
    $result->calculateStats();
    $result->load(['student.user', 'class', 'subjectScores.subject']);

    return response()->json($result, 201);
  }

  public function update(Request $request, $id)
  {
    $result = Result::findOrFail($id);

    $validated = $request->validate([
      'form_master_remark' => 'nullable|string',
      'principal_remark' => 'nullable|string',
      'verbal_skills' => 'nullable|string|in:A,B,C,D,E',
      'self_control' => 'nullable|string|in:A,B,C,D,E',
      'obedience' => 'nullable|string|in:A,B,C,D,E',
      'punctuality' => 'nullable|string|in:A,B,C,D,E',
      'honesty' => 'nullable|string|in:A,B,C,D,E',
      'assignment' => 'nullable|string|in:A,B,C,D,E',
      'neatness' => 'nullable|string|in:A,B,C,D,E',
      'attitude_to_learn' => 'nullable|string|in:A,B,C,D,E',
      'subject_scores' => 'sometimes|array',
      'subject_scores.*.id' => 'sometimes|exists:subject_scores,id',
      'subject_scores.*.subject_id' => 'required_with:subject_scores|exists:subjects,id',
      'subject_scores.*.assignment' => 'nullable|numeric|min:0|max:100',
      'subject_scores.*.first_test' => 'nullable|numeric|min:0|max:100',
      'subject_scores.*.second_test' => 'nullable|numeric|min:0|max:100',
      'subject_scores.*.exam' => 'nullable|numeric|min:0|max:100',
    ]);

    // Update remarks and general evaluation
    if (isset($validated['form_master_remark'])) {
      $result->form_master_remark = $validated['form_master_remark'];
    }
    if (isset($validated['principal_remark'])) {
      $result->principal_remark = $validated['principal_remark'];
    }
    if (isset($validated['verbal_skills'])) {
      $result->verbal_skills = $validated['verbal_skills'];
    }
    if (isset($validated['self_control'])) {
      $result->self_control = $validated['self_control'];
    }
    if (isset($validated['obedience'])) {
      $result->obedience = $validated['obedience'];
    }
    if (isset($validated['punctuality'])) {
      $result->punctuality = $validated['punctuality'];
    }
    if (isset($validated['honesty'])) {
      $result->honesty = $validated['honesty'];
    }
    if (isset($validated['assignment'])) {
      $result->assignment = $validated['assignment'];
    }
    if (isset($validated['neatness'])) {
      $result->neatness = $validated['neatness'];
    }
    if (isset($validated['attitude_to_learn'])) {
      $result->attitude_to_learn = $validated['attitude_to_learn'];
    }
    $result->save();

    // Update subject scores if provided
    if (isset($validated['subject_scores'])) {
      foreach ($validated['subject_scores'] as $scoreData) {
        if (isset($scoreData['id'])) {
          // Update existing score
          $subjectScore = SubjectScore::where('id', $scoreData['id'])
            ->where('result_id', $result->id)
            ->firstOrFail();

          $subjectScore->update([
            'assignment' => $scoreData['assignment'] ?? null,
            'first_test' => $scoreData['first_test'] ?? null,
            'second_test' => $scoreData['second_test'] ?? null,
            'exam' => $scoreData['exam'] ?? null,
          ]);
        } else {
          // Create new score
          SubjectScore::create([
            'result_id' => $result->id,
            'subject_id' => $scoreData['subject_id'],
            'assignment' => $scoreData['assignment'] ?? null,
            'first_test' => $scoreData['first_test'] ?? null,
            'second_test' => $scoreData['second_test'] ?? null,
            'exam' => $scoreData['exam'] ?? null,
          ]);
        }
      }
    }

    $result->refresh();
    $result->load(['student.user', 'class', 'subjectScores.subject']);

    return response()->json($result);
  }

  public function destroy($id)
  {
    $result = Result::findOrFail($id);
    $result->delete();

    return response()->json(['message' => 'Result deleted successfully']);
  }

  public function downloadCsv(Request $request)
  {
    $request->validate([
      'academic_year' => 'required|string',
      'term' => 'required|string',
      'class_id' => 'nullable|exists:classes,id',
    ]);

    $query = Result::with([
      'student.user',
      'student:id,student_id,user_id',
      'class',
      'subjectScores.subject'
    ]);

    if ($request->has('class_id')) {
      $query->where('class_id', $request->class_id);
    }

    if ($request->has('academic_year')) {
      $query->where('academic_year', $request->academic_year);
    }

    if ($request->has('term')) {
      $query->where('term', $request->term);
    }

    $results = $query->get();

    $academicYear = str_replace('/', '_', $request->academic_year);
    $term = str_replace(' ', '_', strtolower($request->term));
    $className = $results->first()?->class?->name ?? 'all_classes';
    $className = str_replace(' ', '_', strtolower($className));

    $filename = "results_{$academicYear}_{$term}_{$className}_" . date('Y-m-d') . '.csv';

    $headers = [
      'Content-Type' => 'text/csv',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
    ];

    $callback = function () use ($results) {
      $file = fopen('php://output', 'w');

      // Add CSV headers
      fputcsv($file, [
        'Student ID',
        'Student Name',
        'Class',
        'Academic Year',
        'Term',
        'Subject',
        'Assignment',
        '1st Test',
        '2nd Test',
        'Exam',
        'Total Score',
        'Position',
        'Grade',
        'Remarks',
        'Total Subjects',
        'Total Score (All Subjects)',
        'Form Master Remark',
        'Principal Remark',
      ]);

      // Add result data
      foreach ($results as $result) {
        $totalSubjects = $result->subject_scores->count();
        $totalScore = $result->subject_scores->sum('total') ?? 0;

        if ($result->subject_scores->count() > 0) {
          foreach ($result->subject_scores as $score) {
            fputcsv($file, [
              $result->student->student_id ?? '',
              $result->student->user->name ?? '',
              $result->class->name ?? '',
              $result->academic_year ?? '',
              $result->term ?? '',
              $score->subject->name ?? '',
              $score->assignment ?? '',
              $score->first_test ?? '',
              $score->second_test ?? '',
              $score->exam ?? '',
              $score->total ?? '',
              $score->position ?? '',
              $score->grade ?? '',
              $score->remarks ?? '',
              $totalSubjects,
              $totalScore,
              $result->form_master_remark ?? '',
              $result->principal_remark ?? '',
            ]);
          }
        } else {
          // If no subject scores, still include the result row
          fputcsv($file, [
            $result->student->student_id ?? '',
            $result->student->user->name ?? '',
            $result->class->name ?? '',
            $result->academic_year ?? '',
            $result->term ?? '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            $totalSubjects,
            $totalScore,
            $result->form_master_remark ?? '',
            $result->principal_remark ?? '',
          ]);
        }
      }

      fclose($file);
    };

    return response()->stream($callback, 200, $headers);
  }
}
