<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,teacher,student,parent,staff',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'nullable|email',
            'matric_no' => 'nullable|string',
            'password' => 'required',
        ]);

        $user = null;

        // If matric_no is provided, try to find student by matric number
        if ($request->has('matric_no') && !empty($request->matric_no)) {
            $student = \App\Models\Student::where('student_id', $request->matric_no)->first();
            if ($student) {
                $user = $student->user;
            }
        } else {
            // Fallback to email login
            $user = User::where('email', $request->email)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                $request->has('matric_no') ? 'matric_no' : 'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        // Load related data based on role
        $user->load([
            'student' => function ($query) {
                $query->with('class', 'parent');
            },
            'teacher',
            'parent' => function ($query) {
                $query->with('students');
            },
        ]);

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $user->update($validated);

        // Reload related data
        $user->load([
            'student' => function ($query) {
                $query->with('class', 'parent');
            },
            'teacher',
            'parent' => function ($query) {
                $query->with('students');
            },
        ]);

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}
