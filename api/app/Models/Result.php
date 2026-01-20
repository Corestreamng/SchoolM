<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Result extends Model
{
  use HasFactory;

  protected $fillable = [
    'student_id',
    'class_id',
    'academic_year',
    'term',
    'form_master_remark',
    'principal_remark',
    'verbal_skills',
    'self_control',
    'obedience',
    'punctuality',
    'honesty',
    'assignment',
    'neatness',
    'attitude_to_learn',
    'total_subjects',
    'total_score',
  ];

  protected $casts = [
    'total_subjects' => 'integer',
    'total_score' => 'decimal:2',
  ];

  public function student(): BelongsTo
  {
    return $this->belongsTo(Student::class);
  }

  public function class(): BelongsTo
  {
    return $this->belongsTo(SchoolClass::class, 'class_id');
  }

  public function subjectScores(): HasMany
  {
    return $this->hasMany(SubjectScore::class);
  }

  /**
   * Calculate and update result statistics
   */
  public function calculateStats(): void
  {
    $scores = $this->subjectScores;
    $this->total_subjects = $scores->count();
    $this->total_score = $scores->sum('total');
    $this->save();

    // Calculate positions for each subject
    $this->calculatePositions();
  }

  /**
   * Calculate student positions for each subject
   */
  public function calculatePositions(): void
  {
    // Get all results for the same class, academic year, and term
    $classResults = Result::where('class_id', $this->class_id)
      ->where('academic_year', $this->academic_year)
      ->where('term', $this->term)
      ->with('subjectScores')
      ->get();

    // Group scores by subject
    $subjectScoresMap = [];
    foreach ($classResults as $result) {
      foreach ($result->subjectScores as $score) {
        $subjectId = $score->subject_id;
        if (!isset($subjectScoresMap[$subjectId])) {
          $subjectScoresMap[$subjectId] = [];
        }
        $subjectScoresMap[$subjectId][] = [
          'result_id' => $result->id,
          'score_id' => $score->id,
          'total' => $score->total,
        ];
      }
    }

    // Calculate positions for each subject
    foreach ($subjectScoresMap as $subjectId => $scores) {
      // Sort by total descending
      usort($scores, function ($a, $b) {
        return $b['total'] <=> $a['total'];
      });

      // Assign positions (students with same score get same position)
      $position = 1;
      $prevTotal = null;
      foreach ($scores as $index => $scoreData) {
        // If score is different from previous, update position
        if ($prevTotal !== null && $scoreData['total'] < $prevTotal) {
          $position = $index + 1;
        }
        $prevTotal = $scoreData['total'];

        // Update the position in database
        \App\Models\SubjectScore::where('id', $scoreData['score_id'])->update([
          'position' => $position,
        ]);
      }
    }
  }
}
