import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  levelName: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  levelName,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[#141523] border border-red-500/30 shadow-[0_0_50px_-10px_rgba(239,68,68,0.25)] p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1c1e2e] hover:bg-[#282b3f] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-400 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
            Destructive Action
          </span>
          <h3 className="text-lg font-black text-white font-['Outfit'] mt-2">Delete Level?</h3>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Are you sure you want to permanently remove <span className="text-white font-bold">"{levelName}"</span>? This will be removed from your showcase and cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#23263b]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-[#1f2133] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/40 transition-all active:scale-95 uppercase tracking-wide"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
};

