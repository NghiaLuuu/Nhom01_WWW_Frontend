import React, { ReactNode } from 'react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header section */}
      {actionButton && (
        <div className="flex justify-end mb-6">
          {actionButton}
        </div>
      )}

      {/* Filters section */}
      {filters && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
          {filters}
        </div>
      )}

      {/* Main content */}
      <div>
        {children}
      </div>
    </div>
  );
};
