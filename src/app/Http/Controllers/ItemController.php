<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;
use Illuminate\Support\Facades\Auth;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = Item::all();
        $list = $items;
        return view('DeliverRegister',['list' => $list]);
		// return response()->json(['items' => $items]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('createTest');
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
        return redirect()->route('dashboard')->with('success', $message);
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
}