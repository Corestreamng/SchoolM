<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
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
            'staff_id' => 'nullable|string',
            'password' => 'required',
        ]);

        $user = null;

        // If matric_no is provided, try to find student by matric number
        if ($request->has('matric_no') && !empty($request->matric_no)) {
            $student = \App\Models\Student::where('student_id', $request->matric_no)->first();
            if ($student) {
                $user = $student->user;
            }
        } 
        // If staff_id is provided, try to find teacher by staff ID
        elseif ($request->has('staff_id') && !empty($request->staff_id)) {
            $teacher = \App\Models\Teacher::where('staff_id', $request->staff_id)->first();
            if ($teacher) {
                $user = $teacher->user;
            }
        }
        // Fallback to email login
        else {
            $user = User::where('email', $request->email)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                $request->has('matric_no') ? 'matric_no' : ($request->has('staff_id') ? 'staff_id' : 'email') => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if 2FA is enabled
        if ($user->two_factor_enabled) {
            return response()->json([
                'requires_2fa' => true,
                'user_id' => $user->id,
                'message' => 'Two-factor authentication required',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log the action
        AuditLog::logAction('user.login', $user);

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        // Log the action
        AuditLog::logAction('user.logout', $request->user());

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

    public function enable2FA(Request $request)
    {
        $user = $request->user();

        // Generate 2FA secret
        $secret = bin2hex(random_bytes(16));
        
        // Generate recovery codes
        $recoveryCodes = [];
        for ($i = 0; $i < 8; $i++) {
            $recoveryCodes[] = strtoupper(bin2hex(random_bytes(4)));
        }

        $user->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode($recoveryCodes),
        ]);

        // Log the action
        AuditLog::logAction('user.enable_2fa', $user);

        return response()->json([
            'message' => '2FA enabled successfully',
            'secret' => $secret,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function disable2FA(Request $request)
    {
        $user = $request->user();

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
        ]);

        // Log the action
        AuditLog::logAction('user.disable_2fa', $user);

        return response()->json([
            'message' => '2FA disabled successfully',
        ]);
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string',
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$user->two_factor_enabled) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication is not enabled.'],
            ]);
        }

        // Verify code (simplified - in production use a proper TOTP library like google2fa)
        $recoveryCodes = json_decode($user->two_factor_recovery_codes, true) ?? [];
        
        if (in_array($request->code, $recoveryCodes)) {
            // Remove used recovery code
            $recoveryCodes = array_diff($recoveryCodes, [$request->code]);
            $user->update([
                'two_factor_recovery_codes' => json_encode(array_values($recoveryCodes)),
            ]);
        } else {
            // In production, implement proper TOTP verification
            throw ValidationException::withMessages([
                'code' => ['The provided code is invalid.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log the action
        AuditLog::logAction('user.2fa_verified', $user);

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
