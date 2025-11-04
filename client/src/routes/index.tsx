import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import {
  Login,
  VerifyEmail,
  Registration,
  ResetPassword,
  ApiErrorWatcher,
  TwoFactorScreen,
  RequestPasswordReset,
} from '~/components/Auth';
import { MarketplaceProvider } from '~/components/Agents/MarketplaceContext';
import AgentMarketplace from '~/components/Agents/Marketplace';
import { OAuthSuccess, OAuthError } from '~/components/OAuth';
import { AuthContextProvider } from '~/hooks/AuthContext';
import RouteErrorBoundary from './RouteErrorBoundary';
import StartupLayout from './Layouts/Startup';
import LoginLayout from './Layouts/Login';
import dashboardRoutes from './Dashboard';
import ShareRoute from './ShareRoute';
import ChatRoute from './ChatRoute';
import Search from './Search';
import Root from './Root';
import Test from './Test';
import { SessionRouter } from '~/tars/standalone/app/Router/SessionRouter';
import Layout from '~/layout';
import Home from '~/pages';
import Conversations from '~/pages/conversations';
import Settings from '~/pages/setting';
import AppList from '~/pages/applist';
import AppChat from '~/pages/appChat';
import Ocr from '~/pages/ocrapp';
const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
    <ApiErrorWatcher />
  </AuthContextProvider>
);

const baseEl = document.querySelector('base');
const baseHref = baseEl?.getAttribute('href') || '/';

export const router = createBrowserRouter(
  [
    {
      path: 'share/:shareId',
      element: <ShareRoute />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: 'oauth',
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: 'success',
          element: <OAuthSuccess />,
        },
        {
          path: 'error',
          element: <OAuthError />,
        },
      ],
    },
    {
      path: '/',
      element: <StartupLayout />,
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: 'register',
          element: <Registration />,
        },
        {
          path: 'forgot-password',
          element: <RequestPasswordReset />,
        },
        {
          path: 'reset-password',
          element: <ResetPassword />,
        },
      ],
    },
    {
      path: 'verify',
      element: <VerifyEmail />,
      errorElement: <RouteErrorBoundary />,
    },
    {
      path: 'test',
      element: <Layout />, // 全局只挂一次 Layout
      children: [
        { index: true, element: <Home /> }, // 默认路径
        // { path: "tar", element: <HomePage /> },
        // {
        //   path: ":sessionId",
        //   element: (
        //     <SessionRouter>
        //       <App />
        //     </SessionRouter>
        //   ),
        // },
        // { path: 'conversations', element: <Conversations /> },
        {
          path: 'conversations/:sessionId',
          element: (
            <SessionRouter>
              <div></div>
              {/* <Chat /> */}
            </SessionRouter>
          ),
        },
        // { path: 'setting', element: <Setting /> },
        // // { path: "appChat", element: <AppChat /> },
        // { path: 'application', element: <Applist /> },
        // { path: 'application/:id', element: <AppChat /> },
      ],
    },
    {
      element: <AuthLayout />,
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: '/',
          element: <LoginLayout />,
          children: [
            {
              path: 'login',
              element: <Login />,
            },
            {
              path: 'login/2fa',
              element: <TwoFactorScreen />,
            },
          ],
        },
        dashboardRoutes,
        {
          path: '/',
          element: <Root />,
          children: [
            {
              index: true,
              element: <Navigate to="/c/new" replace={true} />,
            },
            {
              path: 'c/:conversationId?',
              element: <ChatRoute />,
            },
            {
              path: 'search',
              element: <Search />,
            },
            { path: 'setting', element: <Settings /> },
            { path: 'conversations', element: <Conversations /> },
            { path: 'application', element: <AppList /> },
            { path: 'application/:id', element: <AppChat /> },
            { path: 'ocr', element: <Ocr /> },
            {
              path: 'agents',
              element: (
                <MarketplaceProvider>
                  <AgentMarketplace />
                </MarketplaceProvider>
              ),
            },
            {
              path: 'agents/:category',
              element: (
                <MarketplaceProvider>
                  <AgentMarketplace />
                </MarketplaceProvider>
              ),
            },
          ],
        },
      ],
    },
  ],
  { basename: baseHref },
);
