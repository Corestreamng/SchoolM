<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->text('submission_content')->nullable();
            $table->string('attachment')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->enum('status', ['submitted', 'graded', 'late'])->default('submitted');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};

