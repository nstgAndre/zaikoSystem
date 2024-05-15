<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;
<<<<<<< HEAD
use Illuminate\Support\Facades\Response;
=======
use Illuminate\Support\Facades\Auth;
>>>>>>> 57737e1cab55b8ea7308b2eff367b4a7596035b4

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
        $items = []; 
        return response()->json(['items' => $items]);
        // return view('createTest');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        #バリデーション
        $rules = [
            'productName' => 'required|string',
            'modelNumber' => 'required|string',
            'location' => 'required|string',
            'inItem' => 'required|integer|min:0',
            'inventoryItem' => 'required|integer|min:0',
            'remarks' => 'nullable|string',
        ];

        $validatedData = $request->validate($rules);
        if ($validatedData['inventoryItem'] != $validatedData['inItem']) {
            return redirect()->back()->withInput()->withErrors(['inventoryItem' => '在庫数量は入庫数量と同じでなければなりません。']);
        }

        $item = new Item();
        $item->productName = $validatedData['productName'];
        $item->modelNumber = $validatedData['modelNumber'];
        $item->location = $validatedData['location'];
        $item->inItem = $validatedData['inItem'];
        $item->inventoryItem = $validatedData['inventoryItem'];
        $item->save();

        // メッセージ表示
        // 変更します。
        $user = Auth::user()->name;
        $productName = $validatedData['productName'];
        $message = "$user さんが $productName を登録しました。";
        // return redirect()->route('dashboard')->with('success', $message);
        return response()->json(['success' => $message]);
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