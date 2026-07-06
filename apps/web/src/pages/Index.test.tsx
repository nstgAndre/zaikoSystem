import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IndexPage } from './Index';

const mockGet = vi.hoisted(() => vi.fn());
const mockPut = vi.hoisted(() => vi.fn());

vi.mock('../lib/api-client', () => ({
  api: { api: { items: { $get: mockGet, ':id': { $put: mockPut } } } },
}));

// レイアウト内の Link はルーターコンテキストが必要なため、テストではアンカーに差し替える
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children?: React.ReactNode }) => (
    <a href={String(to)} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: { user: { name: 'テスト', email: 't@example.com' } } }),
    signOut: vi.fn(),
  },
}));

const item = (id: number, over: Partial<Record<string, unknown>> = {}) => ({
  id,
  productName: `商品${id}`,
  modelNumber: `model-${id}`,
  location: `倉庫${id}`,
  inventoryItem: id * 10,
  quantityChange: 0,
  remarks: `備考${id}`,
  created_at: null,
  updated_at: null,
  ...over,
});

const mockItems = (data: unknown[]) => {
  mockGet.mockResolvedValue({
    status: 200,
    ok: true,
    json: async () => ({
      current_page: 1,
      data,
      last_page: 1,
      per_page: 100,
      total: data.length,
    }),
  });
};

describe('IndexPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPut.mockReset();
  });

  it('id 降順で 1 ページ 3 件だけ表示し、ページボタンを出す', async () => {
    mockItems([item(1), item(2), item(3), item(4)]);
    render(<IndexPage />);

    expect(await screen.findByText('商品4')).toBeInTheDocument();
    expect(screen.getByText('商品3')).toBeInTheDocument();
    expect(screen.getByText('商品2')).toBeInTheDocument();
    // 4件目(id=1)は 2 ページ目
    expect(screen.queryByText('商品1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('検索は全角英数字を半角化して部分一致し、ページを先頭に戻す', async () => {
    mockItems([item(1, { modelNumber: 'abc-100' }), item(2), item(3), item(4)]);
    const user = userEvent.setup();
    render(<IndexPage />);
    await screen.findByText('商品4');

    await user.type(screen.getByPlaceholderText('検索する文字を入力してください'), 'ａｂｃ');

    expect(await screen.findByText('商品1')).toBeInTheDocument();
    expect(screen.queryByText('商品2')).not.toBeInTheDocument();
  });

  it('編集ボタンで該当行が編集モードになりヘッダに数量変更列が現れる', async () => {
    mockItems([item(1)]);
    const user = userEvent.setup();
    const { container } = render(<IndexPage />);
    await screen.findByText('商品1');

    expect(screen.queryByText('数量変更')).not.toBeInTheDocument();

    // 編集ボタンは非編集時 bg-lightgreen(現行の色トグル仕様)
    const editButton = container.querySelector<HTMLButtonElement>('button.bg-lightgreen');
    expect(editButton).not.toBeNull();
    if (!editButton) throw new Error('edit button not found');
    await user.click(editButton);

    expect(await screen.findByText('数量変更')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+-の半角数字')).toBeInTheDocument();
    // 編集中はボタンが赤に変わる
    expect(container.querySelector('button.bg-lightred')).not.toBeNull();
  });

  it('編集確定で PUT が呼ばれる(数量変更空なら 0 送信)', async () => {
    mockItems([item(7)]);
    mockPut.mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });
    const user = userEvent.setup();
    const { container } = render(<IndexPage />);
    await screen.findByText('商品7');

    const editButton = container.querySelector<HTMLButtonElement>('button.bg-lightgreen');
    if (!editButton) throw new Error('edit button not found');
    await user.click(editButton);
    // 確定(2回目クリック — ボタンは赤に変わっている)
    const confirmButton = container.querySelector<HTMLButtonElement>('button.bg-lightred');
    if (!confirmButton) throw new Error('confirm button not found');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith({
        param: { id: '7' },
        json: {
          productName: '商品7',
          modelNumber: 'model-7',
          location: '倉庫7',
          remarks: '備考7',
          quantityChange: 0,
        },
      });
    });
  });

  it('取得エラー時は画面にエラーを表示しない(現行仕様の忠実再現)', async () => {
    mockGet.mockRejectedValue(new Error('network down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<IndexPage />);

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
