import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// vitest の globals を無効にしているため、RTL の自動クリーンアップは働かない。明示的に行う
afterEach(() => {
  cleanup();
});
