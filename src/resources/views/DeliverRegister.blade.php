<!-- DeliverRegister.blade.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>在庫管理一覧</title>
</head>
<body>
    <h1>在庫管理一覧</h1>

    <ul>
            <table>
    <thead>
        <tr>
            <th>No</th>
            <th>商品名</th>
            <th>型番</th>
            <th>納品場所</th>
            <th>入庫数量</th>
            <th>出庫数量</th>
            <th>在庫数量</th>
            <th>備考</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($list as $item)
            <tr>
                <td>{{ $item->id }}</td>
                <td>{{ $item->productName }}</td>
                <td>{{ $item->modelNumber }}</td>
                <td>{{ $item->location }}</td>
                <td>{{ $item->inItem }}</td>
                <td>{{ $item->outItem }}</td>
                <td>{{ $item->inventoryItem }}</td>
                <td>{{ $item->remarks ?? 'None' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

    </ul>
    {{-- <a href="{{ route('items.create') }}"><button>Create New Item</button></a> --}}
</body>
</html>
