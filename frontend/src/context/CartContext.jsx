import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [canteenId, setCanteenId] = useState('cnt_main');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [orderType, setOrderType] = useState('PICKUP'); // PICKUP or CABIN_DELIVERY
  const [cabinDetails, setCabinDetails] = useState({
    building: 'Tech Block A',
    floor: '2nd Floor',
    room: 'Cabin 204'
  });

  const addToCart = (item, selectedCanteenId = 'cnt_main') => {
    if (canteenId !== selectedCanteenId && cartItems.length > 0) {
      if (!window.confirm('Your cart contains items from another canteen. Clear cart and switch?')) {
        return;
      }
      setCartItems([]);
    }
    setCanteenId(selectedCanteenId);

    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, i) => acc + (parseFloat(i.price) * i.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems, canteenId, selectedSlot, setSelectedSlot,
      orderType, setOrderType, cabinDetails, setCabinDetails,
      addToCart, removeFromCart, updateQuantity, clearCart, getSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
