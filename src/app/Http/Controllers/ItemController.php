<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ItemsRequest;
use App\Models\Item;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;
use Laracsv\Export;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 100);
        $items = Item::paginate($perPage);
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
    public function update(Request $request)
{
    $items = $request->input('items');

    foreach ($items as $itemData) {
        $item = Item::find($itemData['id']);
        if ($item) {
            $newInventory = $item->inventoryItem - $itemData['outItem']; // 新しい在庫数量を計算 入庫処理は数字の前に-を付ければ増える
            $data = $item->update([
                'outItem' => $itemData['outItem'],
                'inventoryItem' => $newInventory 
            ]);
            if ($data) {
                Log::info('Item updated successfully', ['item' => $item, 'outItem' => $itemData['outItem'], 'newInventory' => $newInventory]);
            } else {
                Log::warning('Item update failed', ['item' => $item, 'outItem' => $itemData['outItem']]);
            }
        }
    }
    return response()->json(['success' => 'アイテムが正常に更新されました。']);
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
        $ids = $request->input('ids', []);
        $items = Item::whereIn('id', $ids)->get();
        $selectItems = new \Laracsv\Export();
        $selectItems->build($items, [
            'id' => 'ID',
            'productName' => '商品名',
            'modelNumber' => '型番',
            'location' => '場所',
            'inItem' => '入庫数',
            'outItem' => '出庫数',
            'inventoryItem' => '在庫数',
            'remarks' => '備考',
            'created_at' => '登録日'
        ]);
        $csvReader = $selectItems->getReader();

        $csvReader->setOutputBOM(\League\Csv\Reader::BOM_UTF8);
        $filename = 'items.csv';

        return response((string) $csvReader)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');
    }

    public function insItemBulk(Request $request)
    {
        $items = $request->input('items', []);
        foreach ($items as $itemData) {
            $item = new Item();
            $item->productName = $itemData['productName'];
            $item->modelNumber = $itemData['modelNumber'];
            $item->location = $itemData['location'];
            $item->inItem = $itemData['inItem'];
            $item->inventoryItem = $itemData['inItem'];
            $item->remarks = $itemData['remarks'];
            $item->save();
        }
        return response()->json(['success' => 'アイテムが正常に登録されました。']);
    }

    public function updateItemDetails(ItemsRequest $request, string $id)
    {
        $validatedData = $request->validated();

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['error' => 'アイテムが見つかりません'], 404);
        }

        $item->productName = $validatedData['productName'];
        $item->modelNumber = $validatedData['modelNumber'];
        $item->location = $validatedData['location'];
        $item->remarks = $validatedData['remarks'];
        $item->save();

        return response()->json(['success' => 'アイテムが正常に更新されました。']);
    }
}
