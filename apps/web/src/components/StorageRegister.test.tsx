import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageRegister } from './StorageRegister';

const mockBulkPost = vi.hoisted(() => vi.fn());

vi.mock('../lib/api-client', () => ({
  api: { api: { items: { bulk: { $post: mockBulkPost } } } },
}));

describe('StorageRegister', () => {
  beforeEach(() => {
    mockBulkPost.mockReset();
  });

  it('カンマ区切り入力を1件の配列(inventoryItem は文字列)として送信し成功メッセージを表示する', async () => {
    mockBulkPost.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: 'アイテムが正常に登録されました。' }),
    });
    const user = userEvent.setup();
    render(<StorageRegister isOpen={true} onClose={() => {}} fetchData={() => {}} />);

    await user.type(
      screen.getByPlaceholderText('例:サーバー,DL360,櫻井倉庫,100,代理名'),
      'サーバー, DL360 ,櫻井倉庫,100,代理名',
    );
    await user.click(screen.getByRole('button', { name: '一括登録' }));

    expect(mockBulkPost).toHaveBeenCalledWith({
      json: {
        items: [
          {
            productName: 'サーバー',
            modelNumber: 'DL360',
            location: '櫻井倉庫',
            inventoryItem: '100',
            remarks: '代理名',
          },
        ],
      },
    });
    expect(await screen.findByText('アイテムが正常に登録されました。')).toBeInTheDocument();
  });

  it('失敗時は console.error のみで画面は変わらない(現行仕様)', async () => {
    mockBulkPost.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<StorageRegister isOpen={true} onClose={() => {}} fetchData={() => {}} />);

    await user.type(
      screen.getByPlaceholderText('例:サーバー,DL360,櫻井倉庫,100,代理名'),
      'a,b,c,1,d',
    );
    await user.click(screen.getByRole('button', { name: '一括登録' }));

    expect(consoleSpy).toHaveBeenCalled();
    expect(screen.queryByText(/正常に登録/)).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
