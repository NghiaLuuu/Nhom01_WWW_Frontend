import React, { type ReactNode } from 'react';

interface AdminPageLayoutProps {
  actionButton?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  actionButton,
  filters,
  children
}) => {
  return (
    <div className="flex flex-col space-y-6">
      {/* Header section with Toolbar */}
      {(actionButton || filters) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            {filters}
          </div>
          <div className="flex items-center shrink-0">
            {actionButton}
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
