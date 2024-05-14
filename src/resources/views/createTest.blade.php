<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">商品登録</div>

                <div class="card-body">
                    @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul>
                            @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                    @endif

                    <form method="POST" action="{{ route('items.store') }}">
                        @csrf

                        <div class="form-group">
                            <label for="productName">商品名</label>
                            <input type="text" class="form-control" id="productName" name="productName" required>
                        </div>

                        <div class="form-group">
                            <label for="modelNumber">型番</label>
                            <input type="text" class="form-control" id="modelNumber" name="modelNumber" required>
                        </div>

                        <div class="form-group">
                            <label for="location">納品場所</label>
                            <input type="text" class="form-control" id="location" name="location" required>
                        </div>

                        <div class="form-group">
                            <label for="inItem">入庫数量</label>
                            <input type="number" class="form-control" id="inItem" name="inItem" min="0" required>
                        </div>

                        <div class="form-group">
                            <label for="outItem">出庫数量</label>
                            <input type="number" class="form-control" id="outItem" name="outItem" min="0" required>
                        </div>

                        <div class="form-group">
                            <label for="inventoryItem">在庫数量</label>
                            <input type="number" class="form-control" id="inventoryItem" name="inventoryItem" min="0" required>
                        </div>

                        <div class="form-group">
                            <label for="remarks">備考</label>
                            <textarea class="form-control" id="remarks" name="remarks"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary">登録</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
