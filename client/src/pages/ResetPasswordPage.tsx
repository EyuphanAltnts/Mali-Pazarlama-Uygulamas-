import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, Lock, MailCheck } from 'lucide-react';
import api from '../services/api';
import { Card, Input, Button } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedToken = token.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedToken) {
      toast.error(t.auth.resetPassword, 'Reset token is missing or invalid. Please request a new password reset link.');
      navigate('/forgot-password');
      return;
    }

    const hasValidPassword =
      trimmedNewPassword.length >= 8 &&
      /[A-Z]/.test(trimmedNewPassword) &&
      /[a-z]/.test(trimmedNewPassword) &&
      /[0-9]/.test(trimmedNewPassword);

    if (!hasValidPassword) {
      toast.error(t.auth.invalidPassword, t.auth.passwordRequirements);
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      toast.error(t.auth.passwordMismatch, t.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token: trimmedToken, newPassword: trimmedNewPassword, confirmPassword: trimmedConfirmPassword });
      toast.success(t.auth.resetPasswordSuccess);
      navigate('/login');
    } catch (error: any) {
      toast.error(t.auth.resetPassword, error.response?.data?.message || error.response?.data?.errors?.[0] || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-600 shadow-md shadow-purple-500/20 text-white group-hover:scale-105 transition-transform">
              <MailCheck className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">{t.auth.resetPassword}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.auth.forgotSubtitle}</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t.auth.newPassword}
              type="password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="••••••••"
              helperText={t.auth.passwordRequirements}
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            />
            <Input
              label={t.auth.confirmPasswordLabel}
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            />
            <Button type="submit" isLoading={loading} className="w-full py-3" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {t.auth.resetPassword}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs font-medium text-slate-500 mt-6">
          {t.auth.alreadyAccount}{' '}
          <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">{t.auth.signIn}</Link>
        </p>
      </div>
    </div>
  );
};
