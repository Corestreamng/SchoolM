<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('subject_scores', function (Blueprint $table) {
      $table->id();
      $table->foreignId('result_id')->constrained('results')->onDelete('cascade');
      $table->foreignId('subject_id')->constrained()->onDelete('cascade');
      $table->decimal('assignment', 5, 2)->nullable();
      $table->decimal('first_test', 5, 2)->nullable();
      $table->decimal('second_test', 5, 2)->nullable();
      $table->decimal('exam', 5, 2)->nullable();
      $table->decimal('total', 5, 2)->default(0);
      $table->timestamps();

      // Ensure one score per subject per result
      $table->unique(['result_id', 'subject_id'], 'unique_subject_result');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('subject_scores');
  }
};
