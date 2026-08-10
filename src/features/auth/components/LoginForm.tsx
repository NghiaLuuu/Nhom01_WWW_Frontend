import type { LoginFormProps } from '../types/auth.dto';

export const LoginForm: React.FC<LoginFormProps> = ({ content, onSubmit, isLoading = false }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{content.title}</h2>
        <p className="text-gray-500">{content.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {content.emailLabel}
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white/50"
            placeholder={content.emailPlaceholder}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {content.passwordLabel}
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white/50"
            placeholder={content.passwordPlaceholder}
          />
        </div>

        <div className="flex items-center justify-end">
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            {content.forgotPasswordText}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {isLoading ? '...' : content.submitButtonText}
        </button>
      </form>
    </div>
  );
};
