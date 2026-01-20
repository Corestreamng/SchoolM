<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->string('exam_type'); // e.g., 'midterm', 'final', 'assignment'
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2)->default(100);
            $table->string('grade')->nullable(); // A, B, C, etc.
            $table->text('remarks')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->date('exam_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};

