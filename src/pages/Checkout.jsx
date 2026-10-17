import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import AddressModal from '../components/client/AddressModal';
import PromotionModal from '../components/client/PromotionModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { fetchCart } = useCart();

    // --- State ---
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [promotions, setPromotions] = useState([]);
    
    // Selection State
    const [selectedPromotionId, setSelectedPromotionId] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    
    // UI State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Form State
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [note, setNote] = useState('');

    const shipping = 30000;

    // --- Helpers ---
    const formatPrice = (num) =>
        num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // --- Effects (Fetch Data) ---
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const res = await api.get('/cart');
                if (res.status === 200 && Array.isArray(res.data)) {
                    setCartItems(res.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải đơn hàng:", err);
            }
        };

        const listAddress = async () => {
            try {
                if (!user) {
                    setAddresses([]);
                    return;
                }
                const res = await api.get('/address');
                if (res.status === 200 && Array.isArray(res.data)) {
                    setAddresses(res.data);
                }
            } catch (err) {
                console.log("Lỗi khi lấy địa chỉ: ", err);
            }
        };

        const listPromotions = async () => {
            try {
                const res = await api.get('/promotion');
                if (res.status === 200) {
                    setPromotions(res.data);
                }
            } catch (err) {
                console.log("Lỗi khi lấy khuyến mãi: ", err);
            }
        };

        fetchCartItems();
        listAddress();
        listPromotions();
    }, [searchParams, user]);

    // Recalculate Total when cartItems changes
    useEffect(() => {
        const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setCartTotal(total);
    }, [cartItems]);

    // --- Computed Values (useMemo) ---
    
    // Tìm địa chỉ mặc định hoặc địa chỉ được chọn
    const addressDefault = useMemo(() => {
        if (selectedAddressId) {
            return addresses.find(item => item.address_id === selectedAddressId);
        }
        return addresses.find(item => item.is_default === 1) || addresses[0];
    }, [addresses, selectedAddressId]);

    // Tìm khuyến mãi được chọn
    const promotionSelected = useMemo(() => {
        return promotions.find(promo => promo.promotion_id === selectedPromotionId);
    }, [promotions, selectedPromotionId]);

    // Tính giá trị giảm giá ước tính trên UI
    const discountValue = useMemo(() => {
        if (promotionSelected) {
            if (promotionSelected.discount_type === 'percent') {
                const calculated = cartTotal * (promotionSelected.discount_value / 100);
                return promotionSelected.max_discount ? Math.min(calculated, promotionSelected.max_discount) : calculated;
            } else {
                return promotionSelected.discount_value;
            }
        }
        return 0;
    }, [promotionSelected, cartTotal]);

    // --- Handlers ---
    const placeOrder = async () => {
        if (!user) {
            showToast("Vui lòng đăng nhập trước khi tiến hành thanh toán!", "warning");
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }

        if (cartItems.length === 0) {
            showToast("Giỏ hàng của bạn đang trống!", "warning");
            navigate('/products');
            return;
        }

        if (!addressDefault) {
            showToast("Vui lòng chọn hoặc thêm địa chỉ giao hàng trước khi đặt hàng!", "warning");
            return;
        }

        if (paymentMethod === 'vnpay') {
            showToast("Cổng thanh toán VNPay đang trong quá trình nghiệm thu. Vui lòng chọn COD để hoàn tất đặt hàng!", "info");
            return;
        }

        setLoading(true);
        setAlertMsg('');

        const orderData = {
            address_id: addressDefault.address_id,
            payment_method: paymentMethod,
            note: note,
            promotion_id: selectedPromotionId || null,
            items: cartItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity
            }))
        };

        try {
            const res = await api.post('/order', orderData);
            if (res.status === 201 || res.status === 200) {
                await fetchCart();
                showToast('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý', 'success');
                navigate(`/order_success?id=${res.data.order_id}`);
            } else {
                setAlertMsg('Không thể đặt hàng ngay lúc này');
            }
        } catch (err) {
            console.error("Lỗi tạo đơn hàng:", err);
            const errDetail = err.response?.data?.error || 'Không thể đặt hàng ngay lúc này. Vui lòng kiểm tra lại';
            setAlertMsg(errDetail);
            showToast(errDetail, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            {/* Modals */}
            <AddressModal 
                show={showAddressModal} 
                addresses={addresses} 
                selectedId={selectedAddressId || (addressDefault?.address_id)} 
                onClose={() => setShowAddressModal(false)}
                onSelect={(id) => setSelectedAddressId(id)}
            />
            
            <PromotionModal 
                show={showPromotionModal}
                promotions={promotions}
                onClose={() => setShowPromotionModal(false)}
                onSelect={(id) => setSelectedPromotionId(id)}
            />

            <h2 className="text-center mb-4 text-success fw-bold">Núi Xanh Badminton - Thanh Toán</h2>
            
            {alertMsg && <div className="alert alert-danger mt-3">{alertMsg}</div>}

            <div className="row g-4">
                {/* Cột trái: Thông tin giao hàng */}
                <div className="col-md-7">
                    <div className="card border rounded-1 p-2">
                        <h5 className="card-title mb-3 text-primary">Thông tin giao hàng</h5>
                        
                        {!addressDefault ? (
                            <div className="list_address fs-5 fw-medium">
                                Bạn chưa có địa chỉ nhận hàng {' '}
                                <Link className="btn btn-primary" to="/add_address?back=checkout">Thêm địa chỉ</Link>
                            </div>
                        ) : (
                            <div className="list_address-default d-flex justify-content-between">
                                <div className="condition">
                                    <div className="name_phone">
                                        <span className="recipient_name">{addressDefault.recipient_name}</span> | {addressDefault.phone}
                                    </div>
                                    <div className="address_line">
                                        {addressDefault.address_line}
                                    </div>
                                    <div className="address">
                                        {addressDefault.ward}, {addressDefault.district}, {addressDefault.province}
                                    </div>
                                </div>
                                <button className="change-address" onClick={() => setShowAddressModal(true)}>
                                    Thay đổi
                                </button>
                            </div>
                        )}

                        <div className="order_note mt-2">
                            <label htmlFor="order_note" className="text-primary">Ghi chú: </label>
                            <textarea 
                                id="order_note" 
                                className="form-control"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="card border-0">
                            <div className="mt-3">
                                <div className="card-title text-primary">Phương thức thanh toán</div>
                                <div className="form-check mb-2">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="payment"
                                        id="cod" 
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
                                </div>
                                <div className="form-check mb-3">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="payment"
                                        id="vnpay" 
                                        value="vnpay"
                                        checked={paymentMethod === 'vnpay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor="vnpay">Thanh toán qua VNPay</label>
                                </div>
                            </div>

                            <div className="coupon d-flex justify-content-between mb-2">
                                <h5 className="card-title text-primary">Mã giảm giá</h5>
                                <span 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={() => setShowPromotionModal(true)} 
                                    className="text-success"
                                >
                                    Chọn mã
                                </span>
                            </div>

                            {promotionSelected && (
                                <div className="list_promotion">
                                    <div className="d-flex justify-content-between mb-2">
                                        <div className="code fw-bold">
                                            {promotionSelected.code}
                                        </div>
                                        <div className="discount">
                                            {promotionSelected.discount_type === 'percent'
                                                ? promotionSelected.discount_value + '%'
                                                : promotionSelected.discount_value.toLocaleString('vi-VN') + ' ₫'
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button className="btn btn-success w-100 py-2" onClick={placeOrder} disabled={loading}>
                                <i className="bi bi-cart-check me-2"></i>
                                {loading ? (
                                    <span>Đang đặt hàng...</span>
                                ) : (
                                    <span>Đặt hàng ngay</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 mb-3">
                        <div className="card-body">
                            <h5 className="card-title text-primary">Tóm tắt đơn hàng</h5>
                            <ul className="list-group list-group-flush mb-3">
                                {cartItems.map(item => (
                                    <li key={item.cart_item_id || item.variant_id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{item.name}</strong>
                                            <div className="text-muted small">
                                                {item.quantity} x {formatPrice(item.price)}
                                            </div>
                                        </div>
                                        <span className="fw-bold">{formatPrice(item.price * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="d-flex justify-content-between">
                                <span>Tổng tiền hàng:</span>
                                <strong>{formatPrice(cartTotal)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Phí vận chuyển:</span>
                                <strong>{formatPrice(shipping)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Giảm giá:</span>
                                <strong>{formatPrice(discountValue)}</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fs-5 fw-bold">
                                <span>Tổng thanh toán:</span>
                                <span className="text-success">{formatPrice(cartTotal + shipping - discountValue)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="modal fade show d-block custom-loading-modal" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 bg-transparent shadow-none">
                            <div className="text-center text-white">
                                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                                <p className="mt-3 fs-5">Đang đặt hàng...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;