<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id()->comment('ログID');
            $table->unsignedBigInteger('item_id')->comment('商品ID');
            $table->integer('inventoryItem')->nullable()->comment('在庫数量');
            $table->unsignedBigInteger('stock_in_id')->nullable()->comment('入庫ID');
            $table->unsignedBigInteger('stock_out_id')->nullable()->comment('出庫ID');
            $table->string('remarks', 255)->nullable()->comment('備考');
            $table->timestamps();

            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
            $table->foreign('stock_in_id')->references('id')->on('stock_ins')->onDelete('set null');
            $table->foreign('stock_out_id')->references('id')->on('stock_outs')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};