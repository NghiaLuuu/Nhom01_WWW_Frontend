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
    <div className="flex flex-col h-full space-y-4">
      {/* Header section with Toolbar */}
      {(actionButton || filters) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {filters}
          </div>
          <div className="flex items-center shrink-0">
            {actionButton}
          </div>
        </div>
      )}

      {/* Main content surface */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {children}
      </div>
    </div>
  );
};
