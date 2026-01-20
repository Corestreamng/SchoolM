<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('results', function (Blueprint $table) {
      $table->string('verbal_skills')->nullable()->after('principal_remark'); // A, B, C, D, E
      $table->string('self_control')->nullable()->after('verbal_skills');
      $table->string('obedience')->nullable()->after('self_control');
      $table->string('punctuality')->nullable()->after('obedience');
      $table->string('honesty')->nullable()->after('punctuality');
      $table->string('assignment')->nullable()->after('honesty');
      $table->string('neatness')->nullable()->after('assignment');
      $table->string('attitude_to_learn')->nullable()->after('neatness');
    });
  }

  public function down(): void
  {
    Schema::table('results', function (Blueprint $table) {
      $table->dropColumn([
        'verbal_skills',
        'self_control',
        'obedience',
        'punctuality',
        'honesty',
        'assignment',
        'neatness',
        'attitude_to_learn',
      ]);
    });
  }
};
