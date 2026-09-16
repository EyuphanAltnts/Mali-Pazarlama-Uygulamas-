import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Card, Input, Button } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error(t.auth.emailLabel, 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: trimmedEmail });
      setEmail(trimmedEmail);
      setSubmitted(true);
      toast.success(t.auth.sendResetLink);
    } catch (err: any) {
      toast.error(t.auth.sendResetLink, err.response?.data?.message || 'Error occurred');
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
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">{t.auth.forgotTitle}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.auth.forgotSubtitle}</p>
        </div>

        <Card className="p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">{t.auth.checkInbox}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists for <span className="text-purple-600 font-bold">{email}</span>, password reset instructions have been dispatched.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {t.auth.returnToLogin}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label={t.auth.emailLabel}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-3"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {t.auth.sendResetLink}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs font-medium text-slate-500 mt-6">
          {t.auth.alreadyAccount}{' '}
          <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">
            {t.auth.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
};
