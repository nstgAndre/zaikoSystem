<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('items')->insert([
            [
                'productName' => '商品A',
                'modelNumber' => 'A-001',
                'location' => '東京倉庫',
                'inItem' => 100,
                'outItem' => 10,
                'inventoryItem' => 90,
                'remarks' => 'test1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'productName' => '商品B',
                'modelNumber' => 'B-002',
                'location' => '大阪倉庫',
                'inItem' => 200,
                'outItem' => 20,
                'inventoryItem' => 180,
                'remarks' => 'test2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'productName' => '商品c',
                'modelNumber' => 'B-002',
                'location' => '大阪倉庫',
                'inItem' => 200,
                'outItem' => 20,
                'inventoryItem' => 180,
                'remarks' => 'test2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'productName' => '商品d',
                'modelNumber' => 'B-002',
                'location' => '大阪倉庫',
                'inItem' => 200,
                'outItem' => 20,
                'inventoryItem' => 180,
                'remarks' => 'test2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'productName' => '商品e',
                'modelNumber' => 'B-002',
                'location' => '大阪倉庫',
                'inItem' => 200,
                'outItem' => 20,
                'inventoryItem' => 180,
                'remarks' => 'test2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'productName' => '商品f',
                'modelNumber' => 'B-002',
                'location' => '大阪倉庫',
                'inItem' => 200,
                'outItem' => 20,
                'inventoryItem' => 180,
                'remarks' => 'test2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
