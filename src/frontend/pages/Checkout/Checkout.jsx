import { useEffect, useRef, useState } from 'react';
import { useAllProductsContext } from '../../contexts/ProductsContextProvider';
import { useNavigate } from 'react-router';
import {
  AddAddressBtn,
  AddressForm,
  CheckoutDetails,
  Modal,
  Title,
} from '../../components';
import CheckoutAddressCard from '../../components/CheckoutAddressCard/CheckoutAddressCard';
import CheckoutPaymentSelector from '../../components/CheckoutPaymentSelector/CheckoutPaymentSelector';
import styles from './Checkout.module.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart: cartFromContext, addressList: addressListFromContext } =
    useAllProductsContext();

  // states
  const [activeAddressId, setActiveAddressId] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethodData, setPaymentMethodData] = useState({
    method: 'cash',
    fee: 0,
    total: 0
  });

  const isCartEmpty = cartFromContext.length < 1;

  const timer = useRef(null);

  useEffect(() => {
    if (isCartEmpty && !isCheckoutSuccess) {
      navigate('/products');
    }
  }, [isCartEmpty]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleSelect = (addressIdClicked) => {
    setActiveAddressId(addressIdClicked);
  };

  const handlePaymentMethodChange = (paymentData) => {
    setPaymentMethodData(paymentData);
  };

  const updateCheckoutStatus = ({ showSuccessMsg }) => {
    setIsCheckoutSuccess(showSuccessMsg);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (isCheckoutSuccess)
    return (
      <main className='half-page container center-div'>
        <p className='success-text'>Tu pedido se ha realizado exitosamente 🎉</p>
      </main>
    );

  return (
    <main className='full-page container'>
      {isModalOpen && (
        <Modal closeModal={toggleModal}>
          <AddressForm isAdding closeForm={toggleModal} />
        </Modal>
      )}

      <Title>Finalizar Compra</Title>

      {/* Selector de Método de Pago - Movido fuera y reorganizado */}
      <CheckoutPaymentSelector 
        onPaymentMethodChange={handlePaymentMethodChange}
        selectedMethod={paymentMethodData.method}
      />

      <div className={styles.checkoutPage}>
        <section>
          <h3>Elige una dirección de entrega</h3>

          <AddAddressBtn openForm={toggleModal} />

          {addressListFromContext.length >= 1 ? (
            addressListFromContext.map((singleAddress) => (
              <CheckoutAddressCard
                singleAddress={singleAddress}
                activeAddressId={activeAddressId}
                handleSelect={handleSelect}
                key={singleAddress.addressId}
              />
            ))
          ) : (
            <p className='text-center bold'>No hay direcciones para mostrar</p>
          )}
        </section>

        <CheckoutDetails
          activeAddressId={activeAddressId}
          paymentMethodData={paymentMethodData}
          updateCheckoutStatus={updateCheckoutStatus}
          timer={timer}
        />
      </div>
    </main>
  );
};

export default Checkout;