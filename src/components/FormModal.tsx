import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-md'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className={`bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-cyan-950/60 border border-white/10 w-full ${maxWidth} flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-white`}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0 bg-slate-950/40">
          <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
};
