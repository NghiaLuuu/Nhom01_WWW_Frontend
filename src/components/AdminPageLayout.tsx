import React, { type ReactNode } from 'react';

interface AdminPageLayoutProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  actionButton?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  title,
  description,
  action,
  actionButton,
  filters,
  children
}) => {
  const actualAction = action || actionButton;

  return (
    <div className="flex flex-col space-y-6">
      {/* Title & Description header if provided */}
      {(title || description) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>}
            {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
          </div>
          {actualAction && !filters && (
            <div className="flex items-center shrink-0">
              {actualAction}
            </div>
          )}
        </div>
      )}

      {/* Header section with Toolbar if filters or action needed */}
      {(actualAction || filters) && (filters || !title) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            {filters}
          </div>
          <div className="flex items-center shrink-0">
            {actualAction}
          </div>
        </div>
      )}

      {/* Main content surface */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};
