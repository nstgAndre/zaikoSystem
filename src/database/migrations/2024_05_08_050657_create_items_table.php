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
            $table->id()->comment('商品ID');
            $table->string('productName', 255)->comment('商品名');
            $table->string('modelNumber', 255)->comment('型番');
            $table->string('location', 255)->comment('納品場所');
            $table->integer('inventoryItem')->comment('初期在庫数量');
            $table->integer('quantityChange')->default(0)->comment('数量変更');
            $table->string('remarks', 255)->nullable()->comment('備考');
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
