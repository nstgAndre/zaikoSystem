<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;


class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = Item::all()->paginate(10);
        // $list = $items;
		// return response()->json(['items' => $items]);
        return response()->json($items);
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
        $item = Item::find($id);
        if(!$item) {
            return response()->json(['error' => 'アイテムが見つかりません'], 404);
        }
        return response()->json(['item' => $item]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $item = Item::find($id);
        if(!$item) {
            return response()->json(['error' => 'アイテムが見つかりません'], 404);
        }
        return response()->json(['item' => $item]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = Item::find($id);
        if($item) {
            return response()->json(['error' => 'アイテムが見つかりません'], 404);
        }

        $rules = [
            'productName' => 'required|string',
            'modelNumber' => 'required|string',
            'location' => 'required|string',
            'inItem' => 'required|integer|min:0',
            'inventoryItem' => 'required|integer|min:0',
            'remarks' => 'nullable|string',
        ];
        
        $validated = $request->validate($rules);

        if($validated['inventoryItem'] != $validated['inItem']) {
            return response()->json(['error' =>'在庫数量は入庫数量と同じでなければなりません。'], 422);
        }

        $item->productName = $validated['productName'];
        $item->modelNumber = $validated['modelNumber'];
        $item->location = $validated['location'];
        $item->inItem = $validated['inItem'];
        $item->inventoryItem = $validated['inventoryItem'];
        $item->remarks = $validated['remarks'] ?? $item->remarks;
        $item->save();

        return response()->json(['success' => '更新成功しました']);
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

        return response()->json(['success' => $response]);
    }
}