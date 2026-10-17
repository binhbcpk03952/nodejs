import React from 'react';

const PromotionModal = ({ show, promotions, onClose, onSelect }) => {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Mã Khuyến Mãi</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {promotions.length === 0 ? <p>Chưa có mã giảm giá nào.</p> : (
                            <ul className="list-group">
                                {promotions.map(promo => (
                                    <li key={promo.promotion_id} 
                                        className="list-group-item list-group-item-action"
                                        style={{cursor: 'pointer'}}
                                        onClick={() => { onSelect(promo.promotion_id); onClose(); }}
                                    >
                                        <div className="d-flex w-100 justify-content-between">
                                            <h5 className="mb-1 text-success">{promo.code}</h5>
                                            <small>
                                                Giảm: {promo.discount_type === 'percent' ? `${promo.discount_value}%` : `${promo.discount_value}đ`}
                                            </small>
                                        </div>
                                        <p className="mb-1">{promo.description}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;