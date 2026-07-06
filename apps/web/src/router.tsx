import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { authClient } from './lib/auth-client';
import { IndexPage } from './pages/Index';
import { LoginPage } from './pages/Login';

const rootRoute = createRootRoute({
  component: Outlet,
});

/** `/` = ログイン画面。現行同様、トップページがログインを兼ねる(migration-spec.md §2)。 */
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

/** `/index` = 在庫管理一覧。未認証は `/`(ログイン)へリダイレクト。 */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/index',
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) {
      throw redirect({ to: '/' });
    }
  },
  component: IndexPage,
});

const routeTree = rootRoute.addChildren([loginRoute, indexRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
