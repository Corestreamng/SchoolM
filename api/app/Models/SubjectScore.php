<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectScore extends Model
{
  use HasFactory;

  protected $fillable = [
    'result_id',
    'subject_id',
    'assignment',
    'first_test',
    'second_test',
    'exam',
    'total',
    'position',
    'grade',
    'remarks',
  ];

  protected $casts = [
    'assignment' => 'decimal:2',
    'first_test' => 'decimal:2',
    'second_test' => 'decimal:2',
    'exam' => 'decimal:2',
    'total' => 'decimal:2',
    'position' => 'integer',
  ];

  protected static function boot()
  {
    parent::boot();

    static::saving(function ($subjectScore) {
      // Calculate total when saving
      $subjectScore->total = (
        ($subjectScore->assignment ?? 0) +
        ($subjectScore->first_test ?? 0) +
        ($subjectScore->second_test ?? 0) +
        ($subjectScore->exam ?? 0)
      );

      // Calculate grade based on total
      $total = $subjectScore->total;
      if ($total >= 80 && $total <= 100) {
        $subjectScore->grade = 'A';
        $subjectScore->remarks = 'Excellent';
      } elseif ($total >= 70 && $total <= 79) {
        $subjectScore->grade = 'B';
        $subjectScore->remarks = 'Very good';
      } elseif ($total >= 60 && $total <= 69) {
        $subjectScore->grade = 'C';
        $subjectScore->remarks = 'Good';
      } elseif ($total >= 50 && $total <= 59) {
        $subjectScore->grade = 'D';
        $subjectScore->remarks = 'Average';
      } else {
        $subjectScore->grade = 'E';
        $subjectScore->remarks = 'Poor';
      }
    });

    static::saved(function ($subjectScore) {
      // Recalculate result stats when subject score is saved
      if ($subjectScore->result) {
        $subjectScore->result->calculateStats();
      }
    });

    static::deleted(function ($subjectScore) {
      // Recalculate result stats when subject score is deleted
      if ($subjectScore->result) {
        $subjectScore->result->calculateStats();
      }
    });
  }

  public function result(): BelongsTo
  {
    return $this->belongsTo(Result::class);
  }

  public function subject(): BelongsTo
  {
    return $this->belongsTo(Subject::class);
  }
}
