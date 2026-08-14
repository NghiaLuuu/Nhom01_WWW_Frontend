import React, { ReactNode } from 'react';

interface AdminPageLayoutProps {
  title: string;
  actionButton?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  title,
  actionButton,
  filters,
  children
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {actionButton && (
          <div>
            {actionButton}
          </div>
        )}
      </div>

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
