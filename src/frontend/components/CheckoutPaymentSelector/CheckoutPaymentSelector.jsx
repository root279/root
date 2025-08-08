import React, { useState, useEffect } from 'react';
import { useCurrencyContext } from '../../contexts/CurrencyContextProvider';
import { useAllProductsContext } from '../../contexts/ProductsContextProvider';
import { toastHandler } from '../../utils/utils';
import { ToastType } from '../../constants/constants';
import Price from '../Price';
import styles from './CheckoutPaymentSelector.module.css';

const CheckoutPaymentSelector = ({ onPaymentMethodChange, selectedMethod = 'cash' }) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod);
  const { formatPriceWithCode, getCurrentCurrency } = useCurrencyContext();
  const { cart, cartDetails: { totalAmount } } = useAllProductsContext();

  // Calcular recargo del 20% para transferencia bancaria
  const bankTransferFee = totalAmount * 0.20;
  const totalWithBankFee = totalAmount + bankTransferFee;

  const handlePaymentMethodChange = (method) => {
    if (method === paymentMethod) return;

    setPaymentMethod(method);
    
    // Notificar al componente padre
    if (onPaymentMethodChange) {
      onPaymentMethodChange({
        method,
        fee: method === 'bank_transfer' ? bankTransferFee : 0,
        total: method === 'bank_transfer' ? totalWithBankFee : totalAmount
      });
    }

    // Mostrar notificación
    if (method === 'bank_transfer') {
      toastHandler(
        ToastType.Info, 
        `💳 Transferencia bancaria activada: +20% de recargo (${formatPriceWithCode(bankTransferFee)})`
      );
    } else {
      toastHandler(
        ToastType.Success, 
        `💰 Pago en efectivo activado: Sin recargos adicionales`
      );
    }
  };

  useEffect(() => {
    // Notificar cambio inicial
    if (onPaymentMethodChange) {
      onPaymentMethodChange({
        method: paymentMethod,
        fee: paymentMethod === 'bank_transfer' ? bankTransferFee : 0,
        total: paymentMethod === 'bank_transfer' ? totalWithBankFee : totalAmount
      });
    }
  }, [totalAmount]); // Recalcular cuando cambie el total del carrito

  return (
    <div className={styles.checkoutPaymentSelector}>
      <div className={styles.selectorHeader}>
        <h3>💳 Método de Pago</h3>
        <p>Selecciona cómo deseas realizar el pago</p>
      </div>

      <div className={styles.paymentToggle}>
        <div className={styles.toggleLabels}>
          <span className={`${styles.toggleLabel} ${paymentMethod === 'cash' ? styles.active : ''}`}>
            💰 Pago en Efectivo
          </span>
          <span className={`${styles.toggleLabel} ${paymentMethod === 'bank_transfer' ? styles.active : ''}`}>
            🏦 Transferencia Bancaria
          </span>
        </div>
        
        <div className={styles.switchContainer}>
          <input
            type="checkbox"
            id="payment-switch"
            checked={paymentMethod === 'bank_transfer'}
            onChange={(e) => handlePaymentMethodChange(e.target.checked ? 'bank_transfer' : 'cash')}
            className={styles.switchInput}
          />
          <label htmlFor="payment-switch" className={styles.switch}>
            <span className={styles.switchSlider}></span>
            <span className={styles.switchIcon}>
              {paymentMethod === 'cash' ? '💰' : '🏦'}
            </span>
          </label>
        </div>
      </div>

      {paymentMethod === 'bank_transfer' && (
        <div className={styles.bankInfo}>
          <div className={styles.bankInfoSection}>
            <h5>📋 Información Bancaria:</h5>
            <div className={styles.bankDetails}>
              <div className={styles.bankItem}>
                <span className={styles.bankLabel}>🏦 Banco:</span>
                <span>Banco Popular de Ahorro (BPA)</span>
              </div>
              <div className={styles.bankItem}>
                <span className={styles.bankLabel}>💳 Cuenta:</span>
                <span>9205-9876-5432-1098</span>
              </div>
              <div className={styles.bankItem}>
                <span className={styles.bankLabel}>👤 Titular:</span>
                <span>Yero Shop S.A.</span>
              </div>
              <div className={styles.bankItem}>
                <span className={styles.bankLabel}>🆔 CI:</span>
                <span>12345678901</span>
              </div>
            </div>
          </div>

          <div className={styles.instructionsSection}>
            <h5>📝 Instrucciones:</h5>
            <ol>
              <li>Realiza la transferencia por el monto total exacto</li>
              <li>Envía el comprobante por WhatsApp</li>
              <li>Incluye tu número de pedido en el concepto</li>
              <li>Espera confirmación antes de recoger</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPaymentSelector;
            </div>

            <div className={styles.transferInstructions}>
              <h5>📝 Instrucciones:</h5>
              <ol>
                <li>Realiza la transferencia por el monto total exacto</li>
                <li>Envía el comprobante por WhatsApp</li>
                <li>Incluye tu número de pedido en el concepto</li>
                <li>Espera confirmación antes de recoger</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Resumen visual del método seleccionado */}
      <div className={styles.selectedMethodSummary}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryIcon}>
            {paymentMethod === 'cash' ? '💰' : '🏦'}
          </span>
          <span className={styles.summaryText}>
            Método seleccionado: {paymentMethod === 'cash' ? 'Pago en Efectivo' : 'Transferencia Bancaria'}
          </span>
        </div>
        
        <div className={styles.summaryAmount}>
          <span className={styles.summaryLabel}>Total a pagar:</span>
          <span className={`${styles.summaryTotal} ${paymentMethod === 'bank_transfer' ? styles.withFee : ''}`}>
            <Price 
              amount={paymentMethod === 'bank_transfer' ? totalWithBankFee : totalAmount} 
              showCurrencyCode={true} 
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaymentSelector;