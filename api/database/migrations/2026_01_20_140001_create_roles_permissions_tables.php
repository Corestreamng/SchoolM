<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false); // System roles cannot be deleted
            $table->timestamps();
        });

        // Create permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->string('category')->default('general'); // general, students, teachers, finance, etc.
            $table->timestamps();
        });

        // Create role_permission pivot table
        Schema::create('role_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Create user_role pivot table
        Schema::create('user_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Insert default roles
        DB::table('roles')->insert([
            ['name' => 'super_admin', 'display_name' => 'Super Administrator', 'description' => 'Full system access', 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'School administrator', 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'teacher', 'display_name' => 'Teacher', 'description' => 'Teacher role', 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'student', 'display_name' => 'Student', 'description' => 'Student role', 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'parent', 'display_name' => 'Parent', 'description' => 'Parent role', 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'cashier', 'display_name' => 'Cashier', 'description' => 'Finance officer', 'is_system' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert default permissions
        DB::table('permissions')->insert([
            // Student permissions
            ['name' => 'students.view', 'display_name' => 'View Students', 'category' => 'students', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'students.create', 'display_name' => 'Create Students', 'category' => 'students', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'students.edit', 'display_name' => 'Edit Students', 'category' => 'students', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'students.delete', 'display_name' => 'Delete Students', 'category' => 'students', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'students.bulk_upload', 'display_name' => 'Bulk Upload Students', 'category' => 'students', 'created_at' => now(), 'updated_at' => now()],
            // Teacher permissions
            ['name' => 'teachers.view', 'display_name' => 'View Teachers', 'category' => 'teachers', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'teachers.create', 'display_name' => 'Create Teachers', 'category' => 'teachers', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'teachers.edit', 'display_name' => 'Edit Teachers', 'category' => 'teachers', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'teachers.delete', 'display_name' => 'Delete Teachers', 'category' => 'teachers', 'created_at' => now(), 'updated_at' => now()],
            // Finance permissions
            ['name' => 'finance.view', 'display_name' => 'View Finance Records', 'category' => 'finance', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'finance.create', 'display_name' => 'Create Finance Records', 'category' => 'finance', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'finance.edit', 'display_name' => 'Edit Finance Records', 'category' => 'finance', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'finance.delete', 'display_name' => 'Delete Finance Records', 'category' => 'finance', 'created_at' => now(), 'updated_at' => now()],
            // Settings permissions
            ['name' => 'settings.view', 'display_name' => 'View Settings', 'category' => 'settings', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'category' => 'settings', 'created_at' => now(), 'updated_at' => now()],
            // Roles permissions
            ['name' => 'roles.view', 'display_name' => 'View Roles', 'category' => 'roles', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'roles.create', 'display_name' => 'Create Roles', 'category' => 'roles', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'roles.edit', 'display_name' => 'Edit Roles', 'category' => 'roles', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'roles.delete', 'display_name' => 'Delete Roles', 'category' => 'roles', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_role');
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
