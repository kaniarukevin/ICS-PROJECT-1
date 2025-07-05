
import React from 'react';
import './modal.css'; // We'll create this CSS file

function Modal({
  isOpen,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) {
  if (!isOpen) return null;

  const typeClass = `modal-${type}`;
  const hasConfirm = type === 'confirm';

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${typeClass}`}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {hasConfirm && (
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-btn modal-btn-${type}`} 
            onClick={onConfirm || onCancel}
          >
            {hasConfirm ? confirmText : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;