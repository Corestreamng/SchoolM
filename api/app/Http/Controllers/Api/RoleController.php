<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'display_name' => 'required|string',
            'description' => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
            'is_system' => false,
        ]);

        if (isset($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        // Log the action
        AuditLog::logAction('role.create', $role, null, $role->toArray());

        return response()->json($role->load('permissions'), 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_system) {
            return response()->json(['message' => 'Cannot modify system roles'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $id,
            'display_name' => 'sometimes|string',
            'description' => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $oldValues = $role->toArray();
        
        $role->update($validated);

        if (isset($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        // Log the action
        AuditLog::logAction('role.update', $role, $oldValues, $role->fresh()->toArray());

        return response()->json($role->load('permissions'));
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_system) {
            return response()->json(['message' => 'Cannot delete system roles'], 403);
        }

        // Log the action
        AuditLog::logAction('role.delete', $role, $role->toArray(), null);

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }

    public function permissions()
    {
        $permissions = Permission::all()->groupBy('category');
        
        return response()->json($permissions);
    }
}
