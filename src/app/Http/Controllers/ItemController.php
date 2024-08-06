<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ItemsRequest;
use App\Models\Item;
use App\Models\StockIn;
use App\Models\StockOut;
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


    // 参考記事
    // https://webty.jp/staffblog/production/post-2990/
    // 手動でダウンロード必要！
    // composer require usmanhalalit/laracsv
    public function csv(Request $request)
    {
        $ids = $request->input('ids', []);
        $fileName = $request->input('fileName');
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
    
        return response((string) $csvReader)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="'.$fileName.'"');
    }

    // 一括入庫登録
    public function insItemBulk(Request $request)
    {
        $items = $request->input('items', []);
        foreach ($items as $itemData) {
            $item = new Item();
            $item->productName = $itemData['productName'];
            $item->modelNumber = $itemData['modelNumber'];
            $item->location = $itemData['location'];
            $item->inItem = $itemData['inItem'];
            $item->remarks = $itemData['remarks'];
            $item->save();
        }
        return response()->json(['success' => 'アイテムが正常に登録されました。']);
    }

    public function updateItemDetails(ItemsRequest $request, string $id)
    {
        try {
            $validatedData = $request->validated();
            $item = Item::findOrFail($id);
    
            $item->productName = $validatedData['productName'];
            $item->modelNumber = $validatedData['modelNumber'];
            $item->location = $validatedData['location'];
            $item->remarks = $validatedData['remarks'];
    
            $message = 'アイテムが正常に更新されました。';
    
            // 数量変更がある場合のみ処理を行う
            if (isset($validatedData['quantityChange']) && $validatedData['quantityChange'] !== 0) {
                $quantityChangeResult = $this->QuantityChange($request, $id);
                if (is_array($quantityChangeResult)) {
                    $item->inventoryItem = $quantityChangeResult['newQuantity'];
                    $message .= ' ' . $quantityChangeResult['message'];
                } else {
                    $message .= ' 在庫数量の更新に失敗しました: ' . $quantityChangeResult;
                }
            }
    
            // 変更をデータベースに保存
            if (!$item->save()) {
                throw new \Exception("Failed Update database.");
            }
    
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'アイテムの更新中にエラーが発生しました: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function QuantityChange(ItemsRequest $request, string $id)
    {
        $quantityChange = $request->validated()['quantityChange'];
        $item = Item::findOrFail($id);
        $currentQuantity = $item->inventoryItem ?? 0;
        $newQuantity = $currentQuantity + $quantityChange;
        $message = '';

        switch (true) {
            case $quantityChange > 0: // プラスの場合（入庫）
                
                $stockIn = new StockIn([
                    'item_id' => $item->id,
                    'inItem' => $quantityChange
                ]);
                $stockIn->save();
                $message = '入庫処理が完了しました。';
                break;

            case $quantityChange < 0: // マイナスの場合（出庫）
                
                if ($newQuantity < 0) {
                    return 'エラー: 在庫不足のため出庫できません。';
                }
                $stockOut = new StockOut([
                    'item_id' => $item->id,
                    'outItem' => abs($quantityChange)
                ]);
                $stockOut->save();
                $message = '出庫処理が完了しました。';
                break;

            default:
                $message = '数量変更はありませんでした。';
                break;
        }
    
        return [
            'newQuantity' => $newQuantity,
            'message' => $message
        ];
    }
}
