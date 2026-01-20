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
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->string('category')->default('general'); // general, academic, finance, security
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('school_settings')->insert([
            ['key' => 'test_score_limit', 'value' => '40', 'type' => 'integer', 'category' => 'academic', 'description' => 'Maximum score for tests', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'exam_score_limit', 'value' => '60', 'type' => 'integer', 'category' => 'academic', 'description' => 'Maximum score for exams', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'assignment_weight', 'value' => '10', 'type' => 'integer', 'category' => 'academic', 'description' => 'Assignment percentage weight', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'first_test_weight', 'value' => '15', 'type' => 'integer', 'category' => 'academic', 'description' => 'First test percentage weight', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'second_test_weight', 'value' => '15', 'type' => 'integer', 'category' => 'academic', 'description' => 'Second test percentage weight', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'exam_weight', 'value' => '60', 'type' => 'integer', 'category' => 'academic', 'description' => 'Exam percentage weight', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'enable_auto_promotion', 'value' => 'false', 'type' => 'boolean', 'category' => 'academic', 'description' => 'Enable automatic promotion', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'promotion_pass_mark', 'value' => '50', 'type' => 'integer', 'category' => 'academic', 'description' => 'Minimum average score for promotion', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'enable_2fa', 'value' => 'false', 'type' => 'boolean', 'category' => 'security', 'description' => 'Enable two-factor authentication', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'student_id_prefix', 'value' => 'STU', 'type' => 'string', 'category' => 'general', 'description' => 'Student ID prefix', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'last_student_number', 'value' => '0', 'type' => 'integer', 'category' => 'general', 'description' => 'Last generated student number', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
