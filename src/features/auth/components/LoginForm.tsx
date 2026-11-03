import React from 'react';
import type { LoginFormProps } from '../types/auth.dto';

export const LoginForm: React.FC<LoginFormProps> = ({ content, onSubmit, isLoading = false }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 text-slate-100">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-xs text-slate-400">{content.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {content.emailLabel}
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 transition-colors outline-none bg-slate-900 text-white text-sm placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
            placeholder={content.emailPlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {content.passwordLabel}
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 transition-colors outline-none bg-slate-900 text-white text-sm placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
            placeholder={content.passwordPlaceholder}
          />
        </div>

        <div className="flex items-center justify-end">
          <a href="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
            {content.forgotPasswordText}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? '...' : content.submitButtonText}
        </button>
      </form>
    </div>
  );
};
