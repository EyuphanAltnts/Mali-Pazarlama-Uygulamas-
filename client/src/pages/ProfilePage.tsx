import React, { useEffect, useState } from 'react';
import { User, Lock, Save, Shield, Mail } from 'lucide-react';
import api from '../services/api';
import { Profile } from '../types';
import { Card, Input, Button, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const ProfilePage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile>({ firstName: '', lastName: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data.data) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        toast.error(t.profile.title);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedProfile = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: profile.email.trim(),
    };

    if (!trimmedProfile.firstName || !trimmedProfile.lastName) {
      toast.error(t.profile.title, 'Name and surname are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedProfile.email)) {
      toast.error(t.profile.title, 'Please enter a valid email address.');
      return;
    }

    setProfileSaving(true);
    try {
      await api.put('/profile', trimmedProfile);
      setProfile(trimmedProfile);
      toast.success(t.profile.updated);
    } catch (err) {
      toast.error(t.profile.saveFailed);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
      toast.error(t.profile.changePassword, 'All password fields are required.');
      return;
    }

    const hasValidPassword =
      trimmedNewPassword.length >= 8 &&
      /[A-Z]/.test(trimmedNewPassword) &&
      /[a-z]/.test(trimmedNewPassword) &&
      /[0-9]/.test(trimmedNewPassword);

    if (!hasValidPassword) {
      toast.error(t.profile.changePassword, 'Password must be at least 8 characters and include uppercase, lowercase and a number.');
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      toast.error(t.profile.passwordMismatch, t.profile.passwordMismatch);
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.put('/profile/password', {
        currentPassword: trimmedCurrentPassword,
        newPassword: trimmedNewPassword,
        confirmPassword: trimmedConfirmPassword,
      });
      if (res.data.success) {
        toast.success(t.profile.passwordUpdated);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(t.profile.saveFailed, res.data.message || t.status.failed);
      }
    } catch (err: any) {
      toast.error(t.profile.saveFailed, err.response?.data?.message || t.status.failed);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton height={100} className="rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={300} className="rounded-2xl" />
          <Skeleton height={300} className="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md shadow-purple-500/20">
            {profile.firstName.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-4 w-4 text-purple-600" /> {profile.email}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <Card header={<h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><User className="h-4 w-4 text-purple-600" /> {t.profile.title}</h3>}>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label={t.profile.firstName}
              type="text"
              required
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
            <Input
              label={t.profile.lastName}
              type="text"
              required
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
            <Input
              label={t.profile.emailAddress}
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={profileSaving} leftIcon={<Save className="h-4 w-4" />}>
                {t.profile.saveProfile}
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card header={<h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Lock className="h-4 w-4 text-purple-600" /> {t.profile.changePassword}</h3>}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label={t.profile.currentPassword}
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label={t.profile.newPassword}
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label={t.profile.confirmNewPassword}
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="pt-2">
              <Button type="submit" isLoading={passwordSaving} leftIcon={<Shield className="h-4 w-4" />}>
                {t.profile.updatePassword}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
