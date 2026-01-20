<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\Payment;
use App\Models\Grade;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
  public function stats(Request $request)
  {
    $user = $request->user();

    // Only allow admin access
    if ($user->role !== 'admin') {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Total counts
    $totalStudents = Student::where('status', 'active')->count();
    $totalTeachers = Teacher::where('status', 'active')->count();
    $totalParents = ParentModel::count();
    $totalSubjects = Subject::where('status', 'active')->count();
    $totalClasses = SchoolClass::where('status', 'active')->count();

    // Calculate growth percentages (comparing last month to previous month)
    $lastMonth = now()->subMonth();
    $previousMonth = now()->subMonths(2);

    $studentsLastMonth = Student::where('created_at', '>=', $lastMonth->startOfMonth())
      ->where('created_at', '<=', $lastMonth->endOfMonth())
      ->count();
    $studentsPreviousMonth = Student::where('created_at', '>=', $previousMonth->startOfMonth())
      ->where('created_at', '<=', $previousMonth->endOfMonth())
      ->count();
    $studentGrowth = $studentsPreviousMonth > 0
      ? round((($studentsLastMonth - $studentsPreviousMonth) / $studentsPreviousMonth) * 100, 1)
      : ($studentsLastMonth > 0 ? 100 : 0);

    $teachersLastMonth = Teacher::where('created_at', '>=', $lastMonth->startOfMonth())
      ->where('created_at', '<=', $lastMonth->endOfMonth())
      ->count();
    $teachersPreviousMonth = Teacher::where('created_at', '>=', $previousMonth->startOfMonth())
      ->where('created_at', '<=', $previousMonth->endOfMonth())
      ->count();
    $teacherGrowth = $teachersPreviousMonth > 0
      ? round((($teachersLastMonth - $teachersPreviousMonth) / $teachersPreviousMonth) * 100, 1)
      : ($teachersLastMonth > 0 ? 100 : 0);

    $parentsLastMonth = ParentModel::where('created_at', '>=', $lastMonth->startOfMonth())
      ->where('created_at', '<=', $lastMonth->endOfMonth())
      ->count();
    $parentsPreviousMonth = ParentModel::where('created_at', '>=', $previousMonth->startOfMonth())
      ->where('created_at', '<=', $previousMonth->endOfMonth())
      ->count();
    $parentGrowth = $parentsPreviousMonth > 0
      ? round((($parentsLastMonth - $parentsPreviousMonth) / $parentsPreviousMonth) * 100, 1)
      : ($parentsLastMonth > 0 ? 100 : 0);

    $subjectsLastMonth = Subject::where('created_at', '>=', $lastMonth->startOfMonth())
      ->where('created_at', '<=', $lastMonth->endOfMonth())
      ->count();
    $subjectsPreviousMonth = Subject::where('created_at', '>=', $previousMonth->startOfMonth())
      ->where('created_at', '<=', $previousMonth->endOfMonth())
      ->count();
    $subjectGrowth = $subjectsPreviousMonth > 0
      ? round((($subjectsLastMonth - $subjectsPreviousMonth) / $subjectsPreviousMonth) * 100, 1)
      : ($subjectsLastMonth > 0 ? 100 : 0);

    // Monthly revenue (last 6 months)
    $monthlyRevenue = Payment::select(
      DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
      DB::raw('SUM(amount) as revenue')
    )
      ->where('status', 'paid')
      ->where('created_at', '>=', now()->subMonths(6))
      ->groupBy('month')
      ->orderBy('month')
      ->get()
      ->map(function ($item) {
        return [
          'month' => date('M', strtotime($item->month . '-01')),
          'revenue' => (float) $item->revenue,
        ];
      });

    // Student registration growth (last 6 months)
    $studentGrowthData = Student::select(
      DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
      DB::raw('COUNT(*) as students')
    )
      ->where('created_at', '>=', now()->subMonths(6))
      ->groupBy('month')
      ->orderBy('month')
      ->get()
      ->map(function ($item) {
        return [
          'month' => date('M', strtotime($item->month . '-01')),
          'students' => (int) $item->students,
        ];
      });

    // Top 5 students by average grade
    $topStudents = Grade::select(
      'students.id',
      'students.student_id',
      'users.name',
      DB::raw('AVG((grades.score / grades.max_score) * 100) as avg_score'),
      DB::raw('MAX(subjects.name) as top_subject')
    )
      ->join('students', 'grades.student_id', '=', 'students.id')
      ->join('users', 'students.user_id', '=', 'users.id')
      ->leftJoin('subjects', 'grades.subject_id', '=', 'subjects.id')
      ->where('students.status', 'active')
      ->groupBy('students.id', 'students.student_id', 'users.name')
      ->orderBy('avg_score', 'desc')
      ->limit(5)
      ->get()
      ->map(function ($item) {
        return [
          'name' => $item->name,
          'score' => round($item->avg_score, 1) . '%',
          'subject' => $item->top_subject ?? 'N/A',
        ];
      });

    // Top 5 teachers (by number of students taught)
    $topTeachers = Teacher::select(
      'teachers.id',
      'users.name',
      DB::raw('COUNT(DISTINCT students.id) as student_count'),
      DB::raw('GROUP_CONCAT(DISTINCT subjects.name) as subjects')
    )
      ->join('users', 'teachers.user_id', '=', 'users.id')
      ->leftJoin('class_subject', 'teachers.id', '=', 'class_subject.teacher_id')
      ->leftJoin('subjects', 'class_subject.subject_id', '=', 'subjects.id')
      ->leftJoin('classes', 'class_subject.class_id', '=', 'classes.id')
      ->leftJoin('students', 'classes.id', '=', 'students.class_id')
      ->where('teachers.status', 'active')
      ->groupBy('teachers.id', 'users.name')
      ->orderBy('student_count', 'desc')
      ->limit(5)
      ->get()
      ->map(function ($item) {
        $subjects = explode(',', $item->subjects ?? '');
        return [
          'name' => $item->name,
          'rating' => '4.8/5', // Placeholder - would need rating system
          'subject' => $subjects[0] ?? 'N/A',
        ];
      });

    return response()->json([
      'kpis' => [
        [
          'label' => 'Total Students',
          'value' => number_format($totalStudents),
          'change' => '+' . $studentGrowth . '%',
          'icon' => '👥',
        ],
        [
          'label' => 'Total Teachers',
          'value' => number_format($totalTeachers),
          'change' => '+' . $teacherGrowth . '%',
          'icon' => '👨‍🏫',
        ],
        [
          'label' => 'Total Parents',
          'value' => number_format($totalParents),
          'change' => '+' . $parentGrowth . '%',
          'icon' => '👨‍👩‍👧',
        ],
        [
          'label' => 'Total Subjects',
          'value' => number_format($totalSubjects),
          'change' => '+' . $subjectGrowth . '%',
          'icon' => '📚',
        ],
      ],
      'monthlyRevenue' => $monthlyRevenue,
      'studentGrowth' => $studentGrowthData,
      'topStudents' => $topStudents,
      'topTeachers' => $topTeachers,
    ]);
  }
}
