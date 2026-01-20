<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use App\Models\EvaluationRating;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = SchoolSetting::all();
        
        return response()->json([
            'settings' => $settings,
            'evaluation_ratings' => EvaluationRating::all(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
        ]);

        $updated = [];
        foreach ($validated['settings'] as $setting) {
            $updated[] = SchoolSetting::set($setting['key'], $setting['value']);
        }

        // Log the action
        AuditLog::logAction('settings.update', null, null, $validated['settings']);

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $updated,
        ]);
    }

    public function updateEvaluationRatings(Request $request)
    {
        $validated = $request->validate([
            'ratings' => 'required|array',
            'ratings.*.id' => 'sometimes|exists:evaluation_ratings,id',
            'ratings.*.min_score' => 'required|integer|min:0|max:100',
            'ratings.*.max_score' => 'required|integer|min:0|max:100',
            'ratings.*.grade' => 'required|string',
            'ratings.*.remark' => 'required|string',
            'ratings.*.description' => 'nullable|string',
        ]);

        $ratings = [];
        foreach ($validated['ratings'] as $ratingData) {
            if (isset($ratingData['id'])) {
                $rating = EvaluationRating::find($ratingData['id']);
                $rating->update($ratingData);
            } else {
                $rating = EvaluationRating::create($ratingData);
            }
            $ratings[] = $rating;
        }

        // Log the action
        AuditLog::logAction('evaluation_ratings.update', null, null, $validated['ratings']);

        return response()->json([
            'message' => 'Evaluation ratings updated successfully',
            'ratings' => $ratings,
        ]);
    }
}
