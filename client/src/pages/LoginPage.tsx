import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { Card, Input, Button } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const toast = useToast();
  const [email, setEmail] = useState('admin@mailpulse.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success(t.auth.welcomeBack, t.auth.signInSubtitle);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Invalid email or password.';
      toast.error(t.auth.registrationFailed, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-600 shadow-md shadow-purple-500/20 text-white group-hover:scale-105 transition-transform">
              <MailCheck className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">{t.auth.welcomeBack}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.auth.signInSubtitle}</p>
        </div>

        {/* Card */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t.auth.emailLabel}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mailpulse.com"
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              />
            </div>

              <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              >
              {t.auth.signInBtn}
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider">{t.auth.demoCredentials}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@mailpulse.com');
                  setPassword('Admin123!');
                }}
                className="text-xs font-semibold py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200/80 transition"
              >
                Admin (Admin123!)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@mailpulse.com');
                  setPassword('Demo1234');
                }}
                className="text-xs font-semibold py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200/80 transition"
              >
                Demo (Demo1234)
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs font-medium text-slate-500 mt-6">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="font-bold text-purple-600 hover:text-purple-700">
            {t.auth.createAccountTitle}
          </Link>
        </p>
      </div>
    </div>
  );
};
