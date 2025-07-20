import { useAllProductsContext } from '../../contexts/ProductsContextProvider';
import { useConfigContext } from '../../contexts/ConfigContextProvider';
import { useCurrencyContext } from '../../contexts/CurrencyContextProvider';
import Price from '../Price';
import styles from './CheckoutDetails.module.css';
import { useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

import { CHARGE_AND_DISCOUNT, ToastType, SERVICE_TYPES, PRODUCT_CATEGORY_ICONS } from '../../constants/constants';
import CouponSearch from './CouponSearch';
import { toastHandler, Popper, generateOrderNumber } from '../../utils/utils';

import { useAuthContext } from '../../contexts/AuthContextProvider';
import { useNavigate } from 'react-router-dom';

const CheckoutDetails = ({
  timer,
  activeAddressId: activeAddressIdFromProps,
  updateCheckoutStatus,
}) => {
  const {
    cartDetails: {
      totalAmount: totalAmountFromContext,
      totalCount: totalCountFromContext,
    },
    addressList: addressListFromContext,
    cart: cartFromContext,
    clearCartDispatch,
  } = useAllProductsContext();

  const { storeConfig } = useConfigContext();
  const { formatPriceWithCode, getCurrentCurrency, convertFromCUP } = useCurrencyContext();
  const SANTIAGO_ZONES = storeConfig.zones || [];

  const {
    user: { firstName, lastName, email },
  } = useAuthContext();
  const navigate = useNavigate();
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener la dirección seleccionada
  const selectedAddress = addressListFromContext.find(
    ({ addressId }) => addressId === activeAddressIdFromProps
  );

  // Calcular costo de entrega
  const deliveryCost = selectedAddress?.serviceType === SERVICE_TYPES.HOME_DELIVERY 
    ? (selectedAddress?.deliveryCost || 0)
    : 0;

  // Calcular descuento del cupón según la moneda seleccionada
  const priceAfterCouponApplied = activeCoupon
    ? -Math.floor((totalAmountFromContext * activeCoupon.discountPercent) / 100)
    : 0;

  const finalPriceToPay =
    totalAmountFromContext +
    deliveryCost +
    CHARGE_AND_DISCOUNT.discount +
    priceAfterCouponApplied;

  const updateActiveCoupon = (couponObjClicked) => {
    setActiveCoupon(couponObjClicked);
    
    // Notificación mejorada con información de descuento y moneda
    const currency = getCurrentCurrency();
    const discountAmount = Math.floor((totalAmountFromContext * couponObjClicked.discountPercent) / 100);
    
    toastHandler(
      ToastType.Success, 
      `🎫 Cupón ${couponObjClicked.couponCode} aplicado: ${couponObjClicked.discountPercent}% de descuento (${formatPriceWithCode(discountAmount)})`
    );
  };

  const cancelCoupon = () => {
    const currency = getCurrentCurrency();
    toastHandler(ToastType.Warn, `🗑️ Cupón removido - Descuento cancelado`);
    setActiveCoupon(null);
  };

  // Función para obtener icono según categoría del producto
  const getProductIcon = (category) => {
    const normalizedCategory = category.toLowerCase();
    return PRODUCT_CATEGORY_ICONS[normalizedCategory] || PRODUCT_CATEGORY_ICONS.default;
  };

  // FUNCIÓN MEJORADA PARA DETECTAR DISPOSITIVOS Y SISTEMAS OPERATIVOS
  const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const platform = navigator.platform || '';
    
    // Detectar iOS (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    // Detectar macOS
    const isMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent) || /Mac/.test(platform);
    
    // Detectar Android
    const isAndroid = /Android/.test(userAgent);
    
    // Detectar Windows
    const isWindows = /Windows/.test(userAgent) || /Win/.test(platform);
    
    // Detectar Linux
    const isLinux = /Linux/.test(userAgent) && !isAndroid;
    
    // Detectar si es móvil en general
    const isMobile = /Mobi|Android/i.test(userAgent) || isIOS || 
                    (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    
    // Detectar si es tablet
    const isTablet = (/iPad/.test(userAgent)) || 
                    (isAndroid && !/Mobile/.test(userAgent)) ||
                    (window.innerWidth >= 768 && window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    
    // Detectar navegador específico
    let browser = 'unknown';
    if (/Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent)) {
      browser = 'chrome';
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browser = 'safari';
    } else if (/Firefox/.test(userAgent)) {
      browser = 'firefox';
    } else if (/Edge|Edg/.test(userAgent)) {
      browser = 'edge';
    } else if (/Opera|OPR/.test(userAgent)) {
      browser = 'opera';
    }
    
    // Detectar capacidades del dispositivo
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isDesktop = !isMobile && !isTablet;
    
    return {
      isIOS,
      isMacOS,
      isAndroid,
      isWindows,
      isLinux,
      isMobile,
      isTablet,
      isDesktop,
      browser,
      hasTouch,
      isAppleDevice: isIOS || isMacOS,
      userAgent,
      platform
    };
  };

  // FUNCIÓN MEJORADA PARA GENERAR URL DE WHATSAPP COMPATIBLE CON TODOS LOS DISPOSITIVOS
  const generateWhatsAppURL = (message, phoneNumber) => {
    const device = detectDevice();
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    
    console.log('🔍 Dispositivo detectado:', device);
    console.log('📱 Número limpio:', cleanPhone);
    
    // URLs universales que funcionan en todos los dispositivos y navegadores
    const universalUrls = [];
    
    // 1. URL principal wa.me (funciona en todos los dispositivos y navegadores)
    universalUrls.push(`https://wa.me/${cleanPhone}?text=${encodedMessage}`);
    
    // 2. Para dispositivos móviles y tablets: intentar app nativa primero
    if (device.isMobile || device.isTablet) {
      universalUrls.unshift(`whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`);
    }
    
    // 3. Para escritorio: WhatsApp Web como alternativa
    if (device.isDesktop) {
      universalUrls.push(`https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`);
    }
    
    // 4. API de WhatsApp como fallback universal
    universalUrls.push(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`);
    
    console.log(`📱 URLs universales generadas para ${device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : device.isMacOS ? 'macOS' : device.isWindows ? 'Windows' : device.isLinux ? 'Linux' : 'Desconocido'}:`, universalUrls);
    return universalUrls;
  };

  // FUNCIÓN MEJORADA PARA INTENTAR ABRIR WHATSAPP CON MÚLTIPLES MÉTODOS
  const tryOpenWhatsApp = async (urls, orderNumber, phoneNumber) => {
    const device = detectDevice();
    let success = false;
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`🔄 Intentando método ${i + 1}/${urls.length}:`, url);
      
      try {
        // Método 1: Para URLs de esquema (whatsapp://) en móviles y tablets
        if (url.startsWith('whatsapp://') && (device.isMobile || device.isTablet)) {
          // Crear un enlace invisible y hacer clic
          const link = document.createElement('a');
          link.href = url;
          link.style.display = 'none';
          document.body.appendChild(link);
          
          // Detectar si la app se abre
          let appOpened = false;
          const startTime = Date.now();
          
          // Listener para detectar si la página pierde el foco (app se abre)
          const handleVisibilityChange = () => {
            if (document.hidden || Date.now() - startTime > 1000) {
              appOpened = true;
            }
          };
          
          const handleBlur = () => {
            appOpened = true;
          };
          
          document.addEventListener('visibilitychange', handleVisibilityChange);
          window.addEventListener('blur', handleBlur);
          
          // Hacer clic en el enlace
          link.click();
          
          // Esperar un momento para ver si la app se abre
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Limpiar
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('blur', handleBlur);
          document.body.removeChild(link);
          
          if (appOpened) {
            console.log('✅ App de WhatsApp abierta exitosamente');
            success = true;
            break;
          } else {
            console.log('⚠️ App de WhatsApp no disponible, intentando siguiente método...');
            continue;
          }
        }
        
        // Método 2: Para URLs HTTPS - abrir en nueva ventana/pestaña
        if (url.startsWith('https://')) {
          // Configurar opciones de ventana según el dispositivo
          let windowFeatures = 'noopener,noreferrer';
          
          if (device.isDesktop) {
            // Para escritorio: ventana popup centrada
            const width = 800;
            const height = 600;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,${windowFeatures}`;
          }
          
          const newWindow = window.open(url, '_blank', windowFeatures);
          
          if (newWindow) {
            console.log('✅ Ventana de WhatsApp abierta exitosamente');
            
            // Para móviles y tablets: cerrar la ventana después de un tiempo
            if (device.isMobile || device.isTablet) {
              setTimeout(() => {
                try {
                  if (!newWindow.closed) {
                    newWindow.close();
                  }
                } catch (e) {
                  console.log('ℹ️ No se pudo cerrar la ventana automáticamente');
                }
              }, 3000);
            }
            
            success = true;
            break;
          } else {
            console.log('⚠️ Bloqueador de ventanas emergentes activo, intentando método alternativo...');
            
            // Método alternativo: cambiar la ubicación actual
            if (i === urls.length - 1) {
              window.location.href = url;
              success = true;
              break;
            }
            continue;
          }
        }
        
        // Método 3: Fallback - crear enlace y hacer clic
        const fallbackLink = document.createElement('a');
        fallbackLink.href = url;
        fallbackLink.target = '_blank';
        fallbackLink.rel = 'noopener noreferrer';
        fallbackLink.style.display = 'none';
        document.body.appendChild(fallbackLink);
        
        fallbackLink.click();
        
        setTimeout(() => {
          document.body.removeChild(fallbackLink);
        }, 1000);
        
        console.log('✅ Enlace de fallback ejecutado');
        success = true;
        break;
        
      } catch (error) {
        console.log(`❌ Error en método ${i + 1}:`, error);
        
        // Si es el último intento y no hemos tenido éxito, intentar método de emergencia
        if (i === urls.length - 1 && !success) {
          try {
            // Método de emergencia: copiar al portapapeles y mostrar instrucciones
            const emergencyMessage = `WhatsApp: ${phoneNumber}\n\nPor favor contacta manualmente para completar tu pedido.`;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(emergencyMessage);
              console.log('📋 Mensaje copiado al portapapeles como método de emergencia');
              success = true;
            }
          } catch (clipboardError) {
            console.log('❌ Error al copiar al portapapeles:', clipboardError);
          }
        }
      }
      
      // Pequeña pausa entre intentos
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return success;
  };

  const sendToWhatsApp = async (orderData) => {
    const orderNumber = generateOrderNumber();
    const currency = getCurrentCurrency();
    const device = detectDevice();
    
    console.log('🚀 Iniciando envío a WhatsApp...');
    console.log('📱 Dispositivo:', device);
    console.log('📞 Número de WhatsApp:', storeConfig.storeInfo?.whatsappNumber || '+53 54690878');
    
    // LOGO Y HEADER PRINCIPAL CON IMAGEN OPTIMIZADA PARA VISTA PREVIA
    let message = `https://f005.backblazeb2.com/file/120000/Yero+Shop/lovepik.png\n\n`;
    
    // HEADER PRINCIPAL CON DISEÑO DE CATÁLOGO PROFESIONAL
    message += `🏪✨ *YERO SHOP!* ✨🏪\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🌟 *"Tu tienda online de confianza"* 🌟\n`;
    message += `🌐 ${window.location.origin}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // BANNER DE PEDIDO CONFIRMADO CON ESTILO CATÁLOGO
    message += `🎉 ═══════════════════════════════════ 🎉\n`;
    message += `🛍️ *PEDIDO CONFIRMADO EXITOSAMENTE* 🛍️\n`;
    message += `🎉 ═══════════════════════════════════ 🎉\n\n`;
    
    // INFORMACIÓN DE PEDIDO CON DISEÑO PREMIUM
    message += `🏷️ *INFORMACIÓN DEL PEDIDO*\n`;
    message += `┌─────────────────────────────────────┐\n`;
    message += `│ 🆔 *Número:* #${orderNumber}        │\n`;
    message += `│ 📅 *Fecha:* ${new Date().toLocaleDateString('es-CU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} │\n`;
    message += `│ ⏰ *Hora:* ${new Date().toLocaleTimeString('es-CU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Havana'
    })}                    │\n`;
    message += `│ 💱 *Moneda:* ${currency.flag} ${currency.code}              │\n`;
    message += `└─────────────────────────────────────┘\n\n`;
    
    // INFORMACIÓN DEL CLIENTE CON ESTILO MODERNO
    message += `👤 *DATOS DEL CLIENTE*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📝 *Nombre Completo:* ${firstName} ${lastName}\n`;
    message += `📧 *Correo Electrónico:* ${email}\n`;
    message += `📱 *Teléfono de Contacto:* ${selectedAddress.mobile}\n\n`;
    
    // DETALLES DE ENTREGA CON ICONOS TEMÁTICOS
    message += `🚚 *INFORMACIÓN DE ENTREGA*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (selectedAddress.serviceType === SERVICE_TYPES.HOME_DELIVERY) {
      const zoneName = SANTIAGO_ZONES.find(z => z.id === selectedAddress.zone)?.name;
      message += `🏠 *Modalidad:* 🚚 Entrega a domicilio\n`;
      message += `📍 *Zona de entrega:* ${zoneName}\n`;
      message += `🗺️ *Dirección completa:* ${selectedAddress.addressInfo}\n`;
      message += `👤 *Persona que recibe:* ${selectedAddress.receiverName}\n`;
      message += `☎️ *Teléfono del receptor:* ${selectedAddress.receiverPhone}\n`;
      message += `💵 *Costo de entrega:* ${formatPriceWithCode(deliveryCost)}\n`;
    } else {
      message += `🏪 *Modalidad:* 📦 Recoger en tienda\n`;
      message += `📍 *Ubicación:* Yero Shop! - Santiago de Cuba\n`;
      message += `🕐 *Horario:* Coordinar con la tienda\n`;
      if (selectedAddress.additionalInfo) {
        message += `💬 *Información adicional:* ${selectedAddress.additionalInfo}\n`;
      }
    }
    
    message += `\n`;
    
    // CATÁLOGO DE PRODUCTOS CON DISEÑO PREMIUM
    message += `🛍️ *CATÁLOGO DE PRODUCTOS SOLICITADOS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    cartFromContext.forEach((item, index) => {
      const productIcon = getProductIcon(item.category);
      const colorHex = item.colors[0]?.color || '#000000';
      const subtotal = item.price * item.qty;
      const discountPercent = calculateDiscountPercent(item.price, item.originalPrice);
      
      // HEADER DEL PRODUCTO CON NUMERACIÓN ELEGANTE
      message += `┌─ 🏷️ *PRODUCTO #${index + 1}* ─────────────────────┐\n`;
      message += `│                                                │\n`;
      message += `│ ${productIcon} *${item.name}*\n`;
      message += `│                                                │\n`;
      
      // DETALLES DEL PRODUCTO CON ICONOS ESPECÍFICOS
      message += `│ 🏷️ *Categoría:* ${item.category}               │\n`;
      message += `│ 🏢 *Marca:* ${item.company}                    │\n`;
      message += `│ 🎨 *Color seleccionado:* ${colorHex}           │\n`;
      message += `│ 📦 *Cantidad:* ${item.qty} unidad${item.qty > 1 ? 'es' : ''}             │\n`;
      message += `│                                                │\n`;
      
      // INFORMACIÓN DE PRECIOS CON FORMATO PROFESIONAL
      message += `│ 💰 *PRECIOS:*                                  │\n`;
      if (discountPercent > 0) {
        message += `│ 💸 *Precio original:* ${formatPriceWithCode(item.originalPrice)}        │\n`;
        message += `│ 🏷️ *Precio con descuento:* ${formatPriceWithCode(item.price)}          │\n`;
        message += `│ 🎉 *Descuento aplicado:* ${discountPercent}%              │\n`;
      } else {
        message += `│ 💵 *Precio unitario:* ${formatPriceWithCode(item.price)}               │\n`;
      }
      message += `│ 💎 *Subtotal:* ${formatPriceWithCode(subtotal)}                     │\n`;
      message += `│                                                │\n`;
      
      // CARACTERÍSTICAS ADICIONALES
      message += `│ ⭐ *Calificación:* ${item.stars}/5 (${item.reviewCount} reseñas)     │\n`;
      message += `│ 📦 *Stock disponible:* ${item.colors[0]?.colorQuantity || 0} unidades      │\n`;
      message += `│ 🚚 *Envío:* ${item.isShippingAvailable ? 'Disponible' : 'No disponible'}           │\n`;
      message += `│                                                │\n`;
      message += `└────────────────────────────────────────────────┘\n\n`;
    });
    
    // RESUMEN FINANCIERO CON DISEÑO PREMIUM
    message += `💳 *RESUMEN FINANCIERO DETALLADO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `┌─────────────────────────────────────┐\n`;
    message += `│ 🛍️ *Subtotal productos:*            │\n`;
    message += `│    ${formatPriceWithCode(totalAmountFromContext)}                        │\n`;
    message += `│                                     │\n`;
    
    if (activeCoupon) {
      message += `│ 🎫 *Cupón de descuento aplicado:*   │\n`;
      message += `│    Código: ${activeCoupon.couponCode}              │\n`;
      message += `│    Descuento: ${activeCoupon.discountPercent}%                │\n`;
      message += `│    Ahorro: -${formatPriceWithCode(Math.abs(priceAfterCouponApplied))}              │\n`;
      message += `│                                     │\n`;
    }
    
    if (deliveryCost > 0) {
      message += `│ 🚚 *Costo de entrega:*              │\n`;
      message += `│    ${formatPriceWithCode(deliveryCost)}                        │\n`;
      message += `│                                     │\n`;
    } else {
      message += `│ 🆓 *Entrega:* Sin costo adicional   │\n`;
      message += `│                                     │\n`;
    }
    
    message += `├─────────────────────────────────────┤\n`;
    message += `│ 💎 *TOTAL A PAGAR:*                 │\n`;
    message += `│    ${formatPriceWithCode(finalPriceToPay)}                        │\n`;
    message += `│ 💱 *Moneda:* ${currency.flag} ${currency.name} (${currency.code})      │\n`;
    message += `└─────────────────────────────────────┘\n\n`;
    
    // ESTADÍSTICAS DEL PEDIDO
    message += `📊 *ESTADÍSTICAS DEL PEDIDO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🔢 *Total de productos:* ${cartFromContext.length} tipo${cartFromContext.length > 1 ? 's' : ''} diferentes\n`;
    message += `📦 *Cantidad total:* ${totalCountFromContext} unidad${totalCountFromContext > 1 ? 'es' : ''}\n`;
    message += `💰 *Valor promedio por producto:* ${formatPriceWithCode(Math.round(totalAmountFromContext / cartFromContext.length))}\n`;
    if (activeCoupon) {
      message += `🎉 *Ahorro total con cupón:* ${formatPriceWithCode(Math.abs(priceAfterCouponApplied))}\n`;
    }
    message += `🚚 *Método de entrega:* ${selectedAddress.serviceType === SERVICE_TYPES.HOME_DELIVERY ? 'Domicilio' : 'Recogida en tienda'}\n\n`;
    
    // INFORMACIÓN DE SEGUIMIENTO
    message += `📋 *INFORMACIÓN DE SEGUIMIENTO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🆔 *Número de referencia:* #${orderNumber}\n`;
    message += `📅 *Fecha completa:* ${new Date().toLocaleString('es-CU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Havana'
    })}\n`;
    message += `🌍 *Zona horaria:* Cuba (GMT-5)\n`;
    message += `💻 *Plataforma:* ${device.isMobile ? '📱 Móvil' : device.isTablet ? '📱 Tablet' : '💻 Escritorio'} (${device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : device.isWindows ? 'Windows' : device.isMacOS ? 'macOS' : device.isLinux ? 'Linux' : 'Otro'})\n\n`;
    
    // PRÓXIMOS PASOS CON DISEÑO ATRACTIVO
    message += `🚀 *PRÓXIMOS PASOS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ 1. Confirmaremos la disponibilidad de productos\n`;
    message += `✅ 2. Verificaremos los datos de entrega\n`;
    message += `✅ 3. Coordinaremos horario de entrega/recogida\n`;
    message += `✅ 4. Te enviaremos confirmación final\n`;
    message += `✅ 5. Procesaremos tu pedido con máxima prioridad\n\n`;
    
    // INFORMACIÓN IMPORTANTE CON ICONOS LLAMATIVOS
    message += `⚠️ *INFORMACIÓN IMPORTANTE*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🔖 Guarda este número de pedido: *#${orderNumber}*\n`;
    message += `💱 Todos los precios están en ${currency.flag} ${currency.name} (${currency.code})\n`;
    message += `⏰ Tiempo estimado de respuesta: 30 minutos\n`;
    message += `📞 Para consultas urgentes, llama al mismo número\n`;
    message += `🔄 Cambios en el pedido: Contactar antes de 1 hora\n\n`;
    
    // FOOTER CORPORATIVO CON DISEÑO ELEGANTE
    message += `🏪 ═══════════════════════════════════ 🏪\n`;
    message += `✨ *YERO SHOP!* ✨\n`;
    message += `"La tienda online hecha a tu medida"\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📍 *Ubicación:* Santiago de Cuba, Cuba\n`;
    message += `📱 *WhatsApp:* ${storeConfig.storeInfo?.whatsappNumber || '+53 54690878'}\n`;
    message += `🌐 *Tienda Online:* https://yeroshop.vercel.app\n`;
    message += `📧 *Email:* yero.shop@gmail.com\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // MENSAJE DE AGRADECIMIENTO FINAL
    message += `🙏 *¡GRACIAS POR ELEGIR YERO SHOP!* 🙏\n`;
    message += `💯 Tu satisfacción es nuestra prioridad\n`;
    message += `⭐ Esperamos que disfrutes tu compra\n`;
    message += `🔄 ¡Vuelve pronto por más ofertas!\n\n`;
    
    message += `🎉 *¡Que tengas un excelente día!* 🎉`;

    // Generar URLs según el dispositivo
    const whatsappUrls = generateWhatsAppURL(message, storeConfig.storeInfo?.whatsappNumber || '+53 54690878');
    
    // Mostrar notificación específica según el dispositivo
    if (device.isIOS) {
      toastHandler(ToastType.Info, `📱 Abriendo WhatsApp en iOS...`);
    } else if (device.isMacOS) {
      toastHandler(ToastType.Info, `💻 Abriendo WhatsApp en macOS...`);
    } else if (device.isAndroid) {
      toastHandler(ToastType.Info, `🤖 Abriendo WhatsApp en Android...`);
    } else if (device.isWindows) {
      toastHandler(ToastType.Info, `🪟 Abriendo WhatsApp en Windows...`);
    } else if (device.isLinux) {
      toastHandler(ToastType.Info, `🐧 Abriendo WhatsApp en Linux...`);
    } else if (device.isTablet) {
      toastHandler(ToastType.Info, `📱 Abriendo WhatsApp en tablet...`);
    } else {
      toastHandler(ToastType.Info, `💻 Abriendo WhatsApp...`);
    }
    
    // Intentar abrir WhatsApp con múltiples métodos
    const success = await tryOpenWhatsApp(whatsappUrls, orderNumber, storeConfig.storeInfo?.whatsappNumber || '+53 54690878');
    
    if (success) {
      console.log('✅ WhatsApp abierto exitosamente');
      toastHandler(ToastType.Success, `✅ Pedido #${orderNumber} enviado a WhatsApp exitosamente`);
    } else {
      console.log('❌ No se pudo abrir WhatsApp automáticamente');
      
      // Fallback: mostrar información manual
      let fallbackMessage = `📱 Por favor, abre WhatsApp manualmente y contacta a ${storeConfig.storeInfo?.whatsappNumber || '+53 54690878'} con el pedido #${orderNumber}`;
      
      if (device.isDesktop) {
        fallbackMessage = `💻 Por favor, abre WhatsApp Web (web.whatsapp.com) o la aplicación de escritorio y contacta a ${storeConfig.storeInfo?.whatsappNumber || '+53 54690878'} con el pedido #${orderNumber}`;
      }
      
      toastHandler(ToastType.Warn, fallbackMessage);
      
      // Copiar número al portapapeles como ayuda adicional
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(storeConfig.storeInfo?.whatsappNumber || '+53 54690878');
          toastHandler(ToastType.Info, `📋 Número de WhatsApp copiado: ${storeConfig.storeInfo?.whatsappNumber || '+53 54690878'}`);
        }
      } catch (error) {
        console.log('No se pudo copiar al portapapeles:', error);
      }
    }
    
    return orderNumber;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toastHandler(ToastType.Error, 'Por favor selecciona una dirección de entrega');
      return;
    }

    setIsProcessing(true);

    try {
      // Animación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderNumber = await sendToWhatsApp({
        orderNumber: generateOrderNumber(),
        customer: { firstName, lastName, email },
        address: selectedAddress,
        products: cartFromContext,
        pricing: {
          subtotal: totalAmountFromContext,
          deliveryCost,
          coupon: activeCoupon,
          total: finalPriceToPay
        }
      });

      await clearCartDispatch();
      updateCheckoutStatus({ showSuccessMsg: true });

      Popper();
      toastHandler(ToastType.Success, `🎉 Pedido #${orderNumber} procesado exitosamente`);

      timer.current = setTimeout(() => {
        updateCheckoutStatus({ showSuccessMsg: false });
        navigate('/');
      }, 4000);

    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      toastHandler(ToastType.Error, 'Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article className={styles.checkout}>
      <div className={styles.checkoutHeader}>
        <h3 className={styles.priceTitle}>
          <span className={styles.titleIcon}>💰</span>
          <span className={styles.titleText}>Detalles del Precio</span>
          <div className={styles.titleUnderline}></div>
        </h3>
      </div>

      <CouponSearch
        activeCoupon={activeCoupon}
        updateActiveCoupon={updateActiveCoupon}
      />

      <hr />

      <div className={styles.priceBreakdown}>
        <div className={styles.row}>
          <span>
            🛍️ Precio ({totalCountFromContext} artículo{totalCountFromContext > 1 && 's'})
          </span>
          <Price amount={totalAmountFromContext} />
        </div>

        {activeCoupon && (
          <div className={styles.row}>
            <div className={styles.couponApplied}>
              <VscChromeClose
                type='button'
                className={styles.closeBtn}
                onClick={cancelCoupon}
              />{' '}
              <p className={styles.couponText}>
                🎫 Cupón {activeCoupon.couponCode} aplicado ({activeCoupon.discountPercent}%)
              </p>
            </div>
            <Price amount={priceAfterCouponApplied} />
          </div>
        )}

        <div className={styles.row}>
          <span>
            {selectedAddress?.serviceType === SERVICE_TYPES.HOME_DELIVERY 
              ? '🚚 Entrega a domicilio' 
              : '📦 Gastos de Envío'
            }
          </span>
          <Price amount={deliveryCost} />
        </div>
      </div>

      <hr />

      <div className={`${styles.row} ${styles.totalPrice}`}>
        <span>💰 Precio Total</span>
        <Price amount={finalPriceToPay} />
      </div>

      <button 
        onClick={handlePlaceOrder} 
        className={`btn btn-width-100 ${styles.orderBtn} ${isProcessing ? styles.processing : ''}`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className={styles.processingContent}>
            <span className={styles.spinner}></span>
            Procesando pedido...
          </div>
        ) : (
          <>
            <span className={styles.whatsappIcon}>📱</span>
            Realizar Pedido por WhatsApp
          </>
        )}
      </button>
    </article>
  );
};

export default CheckoutDetails;