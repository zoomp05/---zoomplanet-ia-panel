import Flow from '../pages/flow';
import AuthGuard from '../../../components/Guards/AuthGuard';
import MainLayout from '../../../layouts/MainLayout';

export const flowRoutes = [
  {
    path: "/flows",
    element: {
      guard: AuthGuard,
      layout: MainLayout,
      component: Flow
    }
  },
  {
    path: "/flows/create",
    element: {
      guard: AuthGuard,
      layout: MainLayout,
      component: Flow
    }
  },
  {
    path: "/flows/edit/:id",
    element: {
      guard: AuthGuard,
      layout: MainLayout,
      component: Flow
    }
  }
];
