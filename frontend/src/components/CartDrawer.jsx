import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  X, Trash2, Plus, Minus, ShoppingBag, Clock,
  Sparkles, CheckCircle2, Ticket, Tag, Building,
  CreditCard, Smartphone, Wallet, Landmark, Banknote, ShieldCheck
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'UPI',
    name: 'UPI / QR Code',
    desc: 'Google Pay, PhonePe, Paytm, BHIM',
    icon: Smartphone,
    color: 'emerald',
    badge: 'FASTEST'
  },
  {
    id: 'CAMPUS_WALLET',
    name: 'Campus RFID Wallet',
    desc: 'Deduct from Student Smart Card balance',
    icon: Wallet,
    color: 'indigo',
    badge: '₹480 BAL'
  },
  {
    id: 'CARD',
    name: 'Debit / Credit Card',
    desc: 'Visa, MasterCard, RuPay',
    icon: CreditCard,
    color: 'blue'
  },
  {
    id: 'NETBANKING',
    name: 'Net Banking',
    desc: 'SBI, HDFC, ICICI, Axis & 50+ Banks',
    icon: Landmark,
    color: 'purple'
  },
  {
    id: 'CASH_ON_PICKUP',
    name: 'Pay Cash at Counter',
    desc: 'Pay physical cash when collecting food tray',
    icon: Banknote,
    color: 'amber',
    badge: 'COUNTER'
  },
  {
    id: 'RAZORPAY',
    name: 'Razorpay Gateway',
    desc: 'Online checkout with 100+ digital methods',
    icon: ShieldCheck,
    color: 'slate'
  }
];

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cartItems, canteenId, selectedSlot, setSelectedSlot,
    orderType, setOrderType, cabinDetails, setCabinDetails,
    updateQuantity, removeFromCart, clearCart, getSubtotal
  } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [pickupSlots, setPickupSlots] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment Method States
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('student@okcampus');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Rishi Student');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    if (isOpen) {
      fetchPickupSlots();
    }
  }, [isOpen, canteenId]);

  const fetchPickupSlots = async () => {
    try {
      const res = await axios.get(`/api/orders/pickup-slots?canteen_id=${canteenId}`);
      if (res.data.slots) {
        setPickupSlots(res.data.slots);
        if (res.data.slots.length > 0 && !selectedSlot) {
          setSelectedSlot(res.data.slots[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching pickup slots:', err);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const subtotal = getSubtotal();
      const res = await axios.post('/api/rewards/coupons/apply', { code: couponCode, cart_amount: subtotal });
      if (res.data.valid) {
        setAppliedCoupon(res.data);
      }
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to complete order placement.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const subtotal = getSubtotal();
      const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
      const finalAmount = Math.max(0, subtotal - discount);

      const payload = {
        canteen_id: canteenId,
        items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        order_type: orderType,
        pickup_slot_id: selectedSlot,
        delivery_building: orderType === 'CABIN_DELIVERY' ? cabinDetails.building : null,
        delivery_floor: orderType === 'CABIN_DELIVERY' ? cabinDetails.floor : null,
        delivery_room: orderType === 'CABIN_DELIVERY' ? cabinDetails.room : null,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod
      };

      // 1. Create Order in Backend
      const orderRes = await axios.post('/api/orders', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const newOrder = orderRes.data.order;

      // 2. Process Chosen Payment Method
      if (paymentMethod === 'RAZORPAY') {
        const payRes = await axios.post('/api/payments/create-razorpay-order', {
          amount: newOrder.final_amount,
          order_id: newOrder.id
        }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

        await axios.post('/api/payments/verify', {
          order_id: newOrder.id,
          razorpay_order_id: payRes.data.id,
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_signature: 'sig_mock'
        }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } else {
        await axios.post('/api/payments/process-method', {
          order_id: newOrder.id,
          payment_method: paymentMethod,
          amount: newOrder.final_amount,
          method_details: {
            upi_id: paymentMethod === 'UPI' ? upiId : null,
            card_last4: paymentMethod === 'CARD' ? '8821' : null,
            bank_name: paymentMethod === 'NETBANKING' ? selectedBank : null
          }
        }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      }

      clearCart();
      onClose();
      navigate(`/orders/${newOrder.id}`);
    } catch (err) {
      console.error('Checkout Error:', err);
      alert(err.response?.data?.error || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Cart</h2>
            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Your cart is empty.</p>
              <p className="text-xs text-slate-400 mt-1">Add items from the menu to build your order.</p>
            </div>
          ) : (
            <>
              {/* ITEM LIST */}
              <div className="space-y-2.5">
                {cartItems.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* ORDER TYPE SELECTOR */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Fulfillment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('PICKUP')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'PICKUP'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Ticket className="w-4 h-4" /> Counter Pickup
                  </button>

                  <button
                    onClick={() => {
                      if (user?.role !== 'FACULTY' && user?.role !== 'COLLEGE_ADMIN') {
                        alert('Faculty Cabin Delivery is reserved for Faculty accounts.');
                        return;
                      }
                      setOrderType('CABIN_DELIVERY');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'CABIN_DELIVERY'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building className="w-4 h-4" /> Cabin Delivery
                  </button>
                </div>

                {orderType === 'CABIN_DELIVERY' && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Faculty Cabin Location:
                    </p>
                    <p className="text-amber-700 dark:text-amber-400">{cabinDetails.building} • {cabinDetails.floor} • {cabinDetails.room}</p>
                  </div>
                )}
              </div>

              {/* PICKUP TIME SLOT */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Select Time Slot
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {pickupSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-all ${
                        selectedSlot === slot.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{slot.slot_time}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                        {slot.current_booked}/{slot.max_capacity} booked
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT METHODS SELECTOR */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Select Payment Method
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Instant Token
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(m => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                          {m.badge && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          {m.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* DYNAMIC PAYMENT METHOD DETAILS */}
                {paymentMethod === 'UPI' && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Enter UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. rollnumber@oksbi"
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <span className="text-xs font-bold text-emerald-600 self-center">✓ Verified</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                      <span>Supported:</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">GPay • PhonePe • Paytm • BHIM</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CAMPUS_WALLET' && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Student ID Smart Card</span>
                      <span className="font-black text-indigo-700 dark:text-indigo-300">Available: ₹480.00</span>
                    </div>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      Amount ₹{finalTotal.toFixed(2)} will be debited instantly from your campus food allowance balance.
                    </p>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Expires</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={3}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Select University Partner Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="HDFC Bank">HDFC Bank (Campus Branch)</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'CASH_ON_PICKUP' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-amber-600" /> Cash Counter Collection
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Your token will be issued right now. Please keep exact change (₹{finalTotal.toFixed(2)}) ready at counter pickup.
                    </p>
                  </div>
                )}
              </div>

              {/* COUPON SECTION */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> Coupon / Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="WELCOME20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coupon '{appliedCoupon.code}' Applied! (-₹{discount.toFixed(2)})
                  </p>
                )}
                {couponError && <p className="text-xs text-rose-500 mt-1">{couponError}</p>}
              </div>
            </>
          )}
        </div>

        {/* FOOTER CHECKOUT BUTTON */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount ({paymentMethod.replace('_', ' ')})</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? 'Processing Order...'
                : paymentMethod === 'CASH_ON_PICKUP'
                ? `Confirm Cash Order (₹${finalTotal.toFixed(2)})`
                : `Pay ₹${finalTotal.toFixed(2)} via ${paymentMethod.replace('_', ' ')}`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
