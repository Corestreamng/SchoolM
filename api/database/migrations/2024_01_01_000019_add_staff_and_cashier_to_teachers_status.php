<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  public function up(): void
  {
    // Modify the enum to include 'staff' and 'cashier'
    DB::statement("ALTER TABLE teachers MODIFY COLUMN status ENUM('active', 'inactive', 'on_leave', 'cashier', 'staff') DEFAULT 'active'");
  }

  public function down(): void
  {
    // Revert back to original enum values
    // First, update any 'staff' or 'cashier' records to 'active'
    DB::table('teachers')
      ->whereIn('status', ['staff', 'cashier'])
      ->update(['status' => 'active']);

    // Then modify the enum back
    DB::statement("ALTER TABLE teachers MODIFY COLUMN status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active'");
  }
};
