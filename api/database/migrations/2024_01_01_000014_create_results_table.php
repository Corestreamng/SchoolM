<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('results', function (Blueprint $table) {
      $table->id();
      $table->foreignId('student_id')->constrained()->onDelete('cascade');
      $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
      $table->string('academic_year');
      $table->string('term'); // First Term, Second Term, Third Term
      $table->text('form_master_remark')->nullable();
      $table->text('principal_remark')->nullable();
      $table->integer('total_subjects')->default(0);
      $table->decimal('total_score', 10, 2)->default(0);
      $table->decimal('average', 5, 2)->default(0);
      $table->timestamps();

      // Ensure one result per student per academic year and term
      $table->unique(['student_id', 'class_id', 'academic_year', 'term'], 'unique_student_result');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('results');
  }
};
