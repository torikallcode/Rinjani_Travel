import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './primitives';
import { Modal } from './primitives';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya, konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onClose,
  requireReason = false,
  reasonLabel = 'Alasan',
  reasonPlaceholder = '',
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            disabled={requireReason && !reason.trim()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-ink/60">{description}</p>}
      {requireReason && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-ink/70 mb-1">
            {reasonLabel}
          </label>
          <textarea
            className="w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm text-ink focus:border-biru-0 focus:ring-2 focus:ring-biru-0/20"
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
      )}
      {!requireReason && description && (
        <div className="mt-4 flex items-center gap-2 text-xs text-ink/50">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>Tindakan ini tidak dapat dibatalkan.</span>
        </div>
      )}
    </Modal>
  );
}

export default ConfirmDialog;