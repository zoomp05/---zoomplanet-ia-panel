import { FlowAction } from '../decorators/flowDecorators';
import { navigate } from '../utils/navigation';

class ShopPlanActions {
  @FlowAction({
    code: 'OPEN_PLAN_PAGE',
    name: 'Abrir Página de Planes',
    description: 'Redirecciona a la página de selección de planes',
    config: {
      route: '/shop/plan',
      cancelRoute: '/shop'
    }
  })
  async openPlanPage(context) {
    try {
      const { route } = context.config;
      await navigate(route);
      return { success: true, location: route };
    } catch (error) {
      console.error('Navigation error:', error);
      return { success: false, error: error.message };
    }
  }

  @FlowAction({
    code: 'CHECK_USER_AUTH',
    name: 'Verificar Autenticación',
    description: 'Verifica si el usuario está autenticado',
    config: {
      authMethods: ['email', 'google', 'facebook'],
      registerRoute: '/auth/register',
      loginRoute: '/auth/login'
    }
  })
  async checkUserAuth(context) {
    const { user } = context;
    if (!user) {
      return {
        success: false,
        action: 'AUTH_REQUIRED',
        options: {
          methods: context.config.authMethods,
          returnUrl: context.config.returnUrl
        }
      };
    }
    return { success: true, user };
  }

  @FlowAction({
    code: 'QUICK_REGISTER',
    name: 'Registro Rápido',
    description: 'Registra un usuario con email o red social',
    config: {
      allowedMethods: ['email', 'google', 'facebook'],
      requiredFields: ['email']
    }
  })
  async quickRegister(context) {
    const { method, email, socialData } = context;
    // Implementar lógica de registro según el método
    return { success: true, user: { email } };
  }

  @FlowAction({
    code: 'HANDLE_AUTH_CANCEL',
    name: 'Manejar Cancelación',
    description: 'Maneja la cancelación del proceso de autenticación',
    config: {
      redirectRoute: '/shop',
      showMessage: true
    }
  })
  async handleAuthCancel(context) {
    const navigate = getNavigate();
    if (context.config.showMessage) {
      // Mostrar mensaje de cancelación
    }
    navigate(context.config.redirectRoute);
    return { success: true, cancelled: true };
  }
}

export default new ShopPlanActions();
