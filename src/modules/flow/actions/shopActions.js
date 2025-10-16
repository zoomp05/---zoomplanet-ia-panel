import { FlowAction } from '../decorators/flowDecorators';

class ShopActions {
  @FlowAction({
    code: 'VALIDATE_CART',
    name: 'Validar Carrito',
    description: 'Valida el contenido del carrito de compras',
    config: {
      requiredFields: ['items', 'total']
    }
  })
  async validateCart(context) {
    const { cart } = context;
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    return true;
  }

  @FlowAction({
    code: 'PROCESS_PAYMENT',
    name: 'Procesar Pago',
    description: 'Procesa el pago del carrito',
    config: {
      requiredFields: ['paymentMethod', 'amount']
    }
  })
  async processPayment(context) {
    const { payment } = context;
    // Lógica de procesamiento de pago
    return { success: true, transactionId: 'xxx' };
  }
}

export default new ShopActions();
