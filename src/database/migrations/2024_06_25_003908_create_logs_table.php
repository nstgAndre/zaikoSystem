<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        // 暫定！！！！！！！！！！！
        Schema::create('logs', function (Blueprint $table) {
            $table->id()->comment('ログID');
            $table->unsignedBigInteger('item_id')->comment('商品ID'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
