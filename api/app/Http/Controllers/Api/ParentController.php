<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParentModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ParentController extends Controller
{
  public function index(Request $request)
  {
    $query = ParentModel::with(['user', 'students.user', 'students.class']);

    if ($request->has('search')) {
      $search = $request->search;
      $query->whereHas('user', function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%");
      })->orWhere('parent_id', 'like', "%{$search}%");
    }

    return response()->json($query->paginate($request->per_page ?? 15));
  }

  public function show($id)
  {
    $parent = ParentModel::with([
      'user',
      'students.user',
      'students.class',
    ])->findOrFail($id);

    return response()->json($parent);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'nullable|string|email|max:255|unique:users',
      'password' => 'nullable|string|min:8',
      'phone' => 'nullable|string',
      'parent_id' => 'nullable|unique:parents,parent_id',
      'occupation' => 'nullable|string',
      'relationship' => 'nullable|string',
    ]);

    // Auto-generate parent_id if not provided
    if (empty($validated['parent_id'])) {
      $year = date('Y');
      $lastParent = ParentModel::where('parent_id', 'like', "PAR{$year}%")
        ->orderBy('parent_id', 'desc')
        ->first();

      if ($lastParent) {
        $lastNumber = (int) substr($lastParent->parent_id, -4);
        $newNumber = $lastNumber + 1;
      } else {
        $newNumber = 1;
      }

      $validated['parent_id'] = 'PAR' . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    // Generate email if not provided
    if (empty($validated['email'])) {
      $validated['email'] = strtolower(str_replace(' ', '', $validated['name'])) . '@coreskool.local';
      // Ensure uniqueness
      $counter = 1;
      $baseEmail = $validated['email'];
      while (\App\Models\User::where('email', $validated['email'])->exists()) {
        $validated['email'] = str_replace('@coreskool.local', $counter . '@coreskool.local', $baseEmail);
        $counter++;
      }
    }

    // Generate random password if not provided
    $password = $validated['password'] ?? \Illuminate\Support\Str::random(12);

    // Create user first
    $user = \App\Models\User::create([
      'name' => $validated['name'],
      'email' => $validated['email'],
      'password' => \Illuminate\Support\Facades\Hash::make($password),
      'role' => 'parent',
      'phone' => $validated['phone'] ?? null,
    ]);

    // Create parent record
    $parent = ParentModel::create([
      'user_id' => $user->id,
      'parent_id' => $validated['parent_id'],
      'occupation' => $validated['occupation'] ?? null,
      'relationship' => $validated['relationship'] ?? null,
    ]);

    // Send email to parent with credentials
    try {
      \Illuminate\Support\Facades\Mail::send('emails.parent-created', [
        'parentName' => $validated['name'],
        'parentEmail' => $validated['email'],
        'parentId' => $validated['parent_id'],
        'password' => $password,
      ], function ($message) use ($validated) {
        $message->to($validated['email'], $validated['name'])
          ->subject('Welcome to CoreSkool - Your Account Details');
      });
    } catch (\Exception $e) {
      // Log error but don't fail the request
      Log::error('Failed to send email to parent: ' . $e->getMessage());
    }

    return response()->json($parent->load(['user', 'students']), 201);
  }

  public function update(Request $request, $id)
  {
    $parent = ParentModel::findOrFail($id);

    $validated = $request->validate([
      'name' => 'nullable|string|max:255',
      'email' => 'nullable|string|email|max:255|unique:users,email,' . $parent->user_id,
      'phone' => 'nullable|string',
      'occupation' => 'nullable|string',
      'relationship' => 'nullable|string',
    ]);

    // Update user information if provided
    if ($parent->user && (isset($validated['name']) || isset($validated['email']) || isset($validated['phone']))) {
      $userData = [];
      if (isset($validated['name'])) {
        $userData['name'] = $validated['name'];
        unset($validated['name']);
      }
      if (isset($validated['email'])) {
        $userData['email'] = $validated['email'];
        unset($validated['email']);
      }
      if (isset($validated['phone'])) {
        $userData['phone'] = $validated['phone'];
        unset($validated['phone']);
      }
      $parent->user->update($userData);
    }

    $parent->update($validated);

    return response()->json($parent->load(['user', 'students']));
  }

  public function destroy($id)
  {
    $parent = ParentModel::findOrFail($id);
    $parent->delete();

    return response()->json(['message' => 'Parent deleted successfully']);
  }

  /**
   * Get children of a parent
   */
  public function getChildren($id)
  {
    $parent = ParentModel::with([
      'user',
      'students.user',
      'students.class',
      'students.class.classTeacher.user',
    ])->findOrFail($id);

    return response()->json([
      'parent' => [
        'id' => $parent->id,
        'name' => $parent->user->name,
        'email' => $parent->user->email,
      ],
      'children' => $parent->students,
    ]);
  }
}
