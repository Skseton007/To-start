import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Delete', danger = true }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {danger && (
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#ef444420', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            </div>
          )}
          <div>
            <div className="confirm-title">{title}</div>
            <div className="confirm-message" style={{ marginBottom: 0 }}>{message}</div>
          </div>
        </div>
        <div className="confirm-actions" style={{ marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
