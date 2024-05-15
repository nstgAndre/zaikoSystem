<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;
use Illuminate\Support\Facades\Response;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = Item::all();
        // $list = $items;
		return response()->json(['items' => $items]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }


    // 参考記事
    // https://webty.jp/staffblog/production/post-2990/
    // 手動でダウンロード必要！
    // composer require usmanhalalit/laracsv
    public function csv(Request $request)
    {
        $items = Item::all();
        $selectItems = new \Laracsv\Export();
        $selectItems->build($items, ['id', 'productName', 'modelNumber', 'location', 'inItem', 'outItem', 'inventoryItem', 'remarks']);
        $csv = $selectItems->getCsv();

        $response = Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="items.csv"',
        ]);

        return $response;
    }
}