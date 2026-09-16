import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailCheck, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Card, Input, Button } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const toast = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const passwordRequirements = [
    { label: t.auth.passwordRequirements, valid: password.length >= 8 },
    { label: t.auth.passwordRequirements, valid: /[A-Z]/.test(password) },
    { label: t.auth.passwordRequirements, valid: /[a-z]/.test(password) },
    { label: t.auth.passwordRequirements, valid: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordRequirements.some((requirement) => !requirement.valid)) {
      toast.error(t.auth.invalidPassword, t.auth.passwordRequirements);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.auth.passwordMismatch, t.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      await register(firstName, lastName, email, password, confirmPassword);
      toast.success(t.auth.accountCreated, t.auth.welcomeBack);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed.';
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
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">{t.auth.createAccountTitle}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.auth.createAccountSubtitle}</p>
        </div>

        {/* Card */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t.auth.firstName}
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ahmet"
                leftIcon={<User className="h-4 w-4 text-slate-400" />}
              />
              <Input
                label={t.auth.lastName}
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Yılmaz"
                leftIcon={<User className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <Input
              label={t.auth.emailLabel}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmet@example.com"
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            />

            <Input
              label={t.auth.passwordLabel}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
                helperText={t.auth.passwordRequirements}
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            />

            <Input
              label={t.auth.confirmPasswordLabel}
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.auth.confirmPasswordPlaceholder}
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 mt-2"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {t.auth.createAccountTitle}
            </Button>
          </form>
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
