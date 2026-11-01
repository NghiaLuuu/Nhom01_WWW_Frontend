import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ModalType = 'danger' | 'warning' | 'info' | 'success';

export interface ModalOptions {
  title?: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  isAlert?: boolean;
}

interface ModalContextType {
  confirm: (options: ModalOptions | string) => Promise<boolean>;
  alert: (options: ModalOptions | string) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ModalOptions;
  }>({
    isOpen: false,
    options: { message: '' }
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ModalOptions | string): Promise<boolean> => {
    const opts: ModalOptions = typeof options === 'string' 
      ? { message: options, title: 'Xác nhận', type: 'warning', isAlert: false } 
      : { title: 'Xác nhận', type: 'warning', isAlert: false, ...options };

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setModalState({ isOpen: true, options: opts });
    });
  }, []);

  const alert = useCallback((options: ModalOptions | string): Promise<void> => {
    const opts: ModalOptions = typeof options === 'string'
      ? { message: options, title: 'Thông báo', type: 'info', isAlert: true }
      : { title: 'Thông báo', type: 'info', isAlert: true, ...options };

    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setModalState({ isOpen: true, options: opts });
    });
  }, []);

  // Intercept native window.alert so that any window.alert call shows this modal
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      alert({
        title: 'Thông báo',
        message: String(msg ?? ''),
        type: 'info'
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [alert]);

  const handleClose = (result: boolean) => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const { isOpen, options } = modalState;
  const {
    title = options.isAlert ? 'Thông báo' : 'Xác nhận',
    message,
    type = 'info',
    confirmText = options.isAlert ? 'Đã hiểu' : 'Xác nhận',
    cancelText = 'Hủy bỏ',
    isAlert = false
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleClose(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          iconBg: 'bg-red-100 ring-4 ring-red-50',
          btnConfirm: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-100 ring-4 ring-amber-50',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-100 ring-4 ring-emerald-50',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: 'bg-blue-100 ring-4 ring-blue-50',
          btnConfirm: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
        };
    }
  };

  const { icon, iconBg, btnConfirm } = getIconAndColors();

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose(isAlert);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  <button
                    onClick={() => handleClose(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors -mr-1 -mt-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {message}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              {!isAlert && (
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${btnConfirm}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
