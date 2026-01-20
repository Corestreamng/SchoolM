<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'min_score',
        'max_score',
        'grade',
        'remark',
        'description',
    ];

    /**
     * Get grade and remark for a given score
     */
    public static function getGradeForScore($score)
    {
        return self::where('min_score', '<=', $score)
            ->where('max_score', '>=', $score)
            ->first();
    }
}
