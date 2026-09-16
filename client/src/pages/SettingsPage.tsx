import React, { useEffect, useState } from 'react';
import { Settings, Server, ShieldCheck, Key, Mail, Lock } from 'lucide-react';
import api from '../services/api';
import { SmtpSettings } from '../types';
import { Card, Input, Button, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const SettingsPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SmtpSettings>({
    host: '',
    port: 587,
    enableSsl: true,
    username: '',
    senderEmail: '',
    senderName: '',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/smtp');
        if (res.data.data) setSettings(res.data.data);
      } catch (err) {
        console.error('Failed to load SMTP settings', err);
        toast.error(t.settings.title);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/smtp', { ...settings, password });
      toast.success(t.settings.saveConfiguration, t.settings.subtitle);
    } catch (err) {
      toast.error(t.settings.saveConfiguration);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await api.post('/settings/smtp/test');
      if (res.data.data === true) {
        toast.success(t.settings.testConnection, t.settings.serverConnection);
      } else {
        toast.error(t.settings.testConnection, t.settings.subtitle);
      }
    } catch (err: any) {
      toast.error(t.settings.testConnection, err.response?.data?.message || t.status.failed);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton height={60} className="rounded-2xl" />
        <Skeleton height={400} className="rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-purple-600" /> {t.settings.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t.settings.subtitle}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card header={<h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Server className="h-4 w-4 text-purple-600" /> {t.settings.serverConnection}</h3>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label={t.settings.smtpHost} type="text" required value={settings.host} onChange={(e) => setSettings({ ...settings, host: e.target.value })} placeholder={t.settings.smtpPlaceholder} />
            <Input label={t.settings.portNumber} type="number" required value={settings.port} onChange={(e) => setSettings({ ...settings, port: Number(e.target.value) })} placeholder={t.settings.portPlaceholder} />
            <Input label={t.settings.username} type="text" required value={settings.username} onChange={(e) => setSettings({ ...settings, username: e.target.value })} placeholder={t.settings.usernamePlaceholder} leftIcon={<Key className="h-4 w-4 text-slate-400" />} />
            <Input label={t.settings.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.settings.passwordPlaceholder} leftIcon={<Lock className="h-4 w-4 text-slate-400" />} />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={settings.enableSsl} onChange={(e) => setSettings({ ...settings, enableSsl: e.target.checked })} className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4" />
              <span className="text-xs font-semibold text-slate-700">{t.settings.sslSecurity}</span>
            </label>
          </div>
        </Card>

        <Card header={<h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2"><Mail className="h-4 w-4 text-purple-600" /> {t.settings.defaultSender}</h3>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label={t.settings.senderEmail} type="email" required value={settings.senderEmail} onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })} placeholder={t.settings.senderEmailPlaceholder} />
            <Input label={t.settings.senderName} type="text" value={settings.senderName} onChange={(e) => setSettings({ ...settings, senderName: e.target.value })} placeholder={t.settings.senderNamePlaceholder} />
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={handleTestConnection} isLoading={testing} leftIcon={<Server className="h-4 w-4" />}>
            {t.settings.testConnection}
          </Button>
          <Button type="submit" isLoading={saving} leftIcon={<ShieldCheck className="h-4 w-4" />}>
            {t.settings.saveConfiguration}
          </Button>
        </div>
      </form>
    </div>
  );
};
