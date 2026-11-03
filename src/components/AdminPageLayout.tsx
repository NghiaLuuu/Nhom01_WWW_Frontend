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
    <div className="flex flex-col space-y-5">
      {/* Header section with Toolbar */}
      {(actionButton || filters) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {filters}
          </div>
          <div className="flex items-center shrink-0">
            {actionButton}
          </div>
        </div>
      )}

      {/* Main content surface */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
};
