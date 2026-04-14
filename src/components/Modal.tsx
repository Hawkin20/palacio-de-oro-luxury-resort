import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-palacio-black/70 backdrop-blur-glass"
        onClick={onClose}
      />
      <div className="relative glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-palacio-gold/20 bg-palacio-black/40 backdrop-blur-glass">
          <h2 className="text-2xl font-playfair font-bold text-palacio-gold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-palacio-gold/10 rounded-lg smooth-transition"
          >
            <X size={24} className="text-palacio-gold" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="sticky bottom-0 p-6 border-t border-palacio-gold/20 bg-palacio-black/40 backdrop-blur-glass flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
