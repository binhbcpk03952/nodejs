import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title: title || 'Xác nhận',
        message: message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const confirm = useCallback((message, onConfirm) => {
    showConfirm('Xác nhận', message).then((ok) => {
      if (ok && typeof onConfirm === 'function') {
        onConfirm();
      }
    });
  }, [showConfirm]);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm, confirm }}>
      {children}

      {/* Toast Notification Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999, pointerEvents: 'none' }}
      >
        {toasts.map((t) => {
          let bgClass = 'bg-success text-white';
          let icon = 'bi-check-circle-fill';
          if (t.type === 'error') {
            bgClass = 'bg-danger text-white';
            icon = 'bi-exclamation-triangle-fill';
          } else if (t.type === 'warning') {
            bgClass = 'bg-warning text-dark';
            icon = 'bi-exclamation-circle-fill';
          } else if (t.type === 'info') {
            bgClass = 'bg-primary text-white';
            icon = 'bi-info-circle-fill';
          }

          return (
            <div
              key={t.id}
              className={`toast show align-items-center ${bgClass} border-0 shadow-lg mb-2 rounded-3 animate__animated animate__fadeInRight`}
              role="alert"
              style={{ pointerEvents: 'auto', minWidth: '280px', maxWidth: '380px' }}
            >
              <div className="d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${icon} fs-5`}></i>
                  <span className="fw-medium">{t.message}</span>
                </div>
                <button
                  type="button"
                  className={`btn-close ${t.type === 'warning' ? '' : 'btn-close-white'} ms-2`}
                  onClick={() => removeToast(t.id)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Confirm Modal */}
      {confirmDialog && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 10000 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle"
                    style={{ width: '44px', height: '44px' }}
                  >
                    <i className="bi bi-exclamation-triangle fs-4"></i>
                  </div>
                  <h5 className="modal-title fw-bold text-dark mb-0">{confirmDialog.title}</h5>
                </div>
              </div>
              <div className="modal-body px-4 py-3 text-secondary">
                {confirmDialog.message}
              </div>
              <div className="modal-footer border-0 px-4 pb-4 pt-1 d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-medium"
                  onClick={confirmDialog.onCancel}
                >
                  Huỷ bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-medium shadow-sm"
                  onClick={confirmDialog.onConfirm}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
