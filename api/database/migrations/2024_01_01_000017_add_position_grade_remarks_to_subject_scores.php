<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('subject_scores', function (Blueprint $table) {
      $table->integer('position')->nullable()->after('total');
      $table->string('grade', 1)->nullable()->after('position'); // A, B, C, D, E
      $table->string('remarks')->nullable()->after('grade'); // Excellent, Very good, Good, Average, Poor
    });
  }

  public function down(): void
  {
    Schema::table('subject_scores', function (Blueprint $table) {
      $table->dropColumn(['position', 'grade', 'remarks']);
    });
  }
};
