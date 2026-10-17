import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddressModal = ({ show, addresses, selectedId, onClose, onSelect }) => {
    const navigate = useNavigate();
    // Local state để quản lý lựa chọn tạm thời trước khi ấn Xác nhận
    const [tempSelectedId, setTempSelectedId] = useState(selectedId);

    // Update tempSelectedId khi prop selectedId thay đổi hoặc khi mở modal
    useEffect(() => {
        setTempSelectedId(selectedId);
    }, [selectedId, show]);

    if (!show) return null;

    const handleConfirm = () => {
        onSelect(tempSelectedId);
        onClose();
    };

    const handleEditRedirect = () => {
        // Chuyển hướng sang trang quản lý địa chỉ
        navigate('/address'); 
    };

    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Chọn địa chỉ nhận hàng</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {addresses.length === 0 ? (
                                <p className="text-center">Bạn chưa có địa chỉ nào.</p>
                            ) : (
                                <div className="list-group">
                                    {addresses.map((addr) => (
                                        <label 
                                            key={addr.address_id} 
                                            className={`list-group-item list-group-item-action d-flex gap-3 py-3 ${tempSelectedId === addr.address_id ? 'border-primary bg-light' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input 
                                                className="form-check-input flex-shrink-0" 
                                                type="radio" 
                                                name="listGroupRadios" 
                                                id={`addr-${addr.address_id}`} 
                                                value={addr.address_id} 
                                                checked={tempSelectedId === addr.address_id}
                                                onChange={() => setTempSelectedId(addr.address_id)}
                                            />
                                            <div className="d-flex gap-2 w-100 justify-content-between">
                                                <div>
                                                    <h6 className="mb-0">
                                                        {addr.recipient_name} <span className="text-muted fw-normal">| {addr.phone}</span>
                                                        {addr.is_default === 1 && <span className="badge bg-danger ms-2">Mặc định</span>}
                                                    </h6>
                                                    <p className="mb-0 opacity-75">{addr.address_line}</p>
                                                    <small className="opacity-50">{addr.ward}, {addr.district}, {addr.province}</small>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={handleEditRedirect}>
                                <i className="bi bi-gear me-1"></i> Quản lý địa chỉ
                            </button>
                            <div>
                                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Huỷ</button>
                                <button type="button" className="btn btn-success" onClick={handleConfirm}>Xác nhận</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressModal;