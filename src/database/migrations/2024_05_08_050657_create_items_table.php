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
        Schema::create('items', function (Blueprint $table) {
            $table->id()->comment("商品ID");
            $table->string('productName')->comment("商品名");
            $table->string('modelNumber')->comment("型番");
            $table->string('location')->comment("納品場所");
            $table->integer('inItem')->default(0)->comment("入庫数量");
            $table->integer('outItem')->default(0)->comment("出庫数量");
            $table->integer('inventoryItem')->default(0)->comment("在庫数量");
            $table->string('remarks')->nullable()->comment("備考");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
