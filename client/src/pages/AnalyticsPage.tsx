import React, { useEffect, useState } from 'react';
import { LineChart, RefreshCw } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { DashboardSummary, DailySend, StatusDistribution, TemplatePerformance } from '../types';
import { Card, Badge, Button, Skeleton } from '../components/ui';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dailySends, setDailySends] = useState<DailySend[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [templatePerf, setTemplatePerf] = useState<TemplatePerformance[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [sumRes, dailyRes, statusRes, templateRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get(`/dashboard/daily-sends?days=${days}`),
        api.get('/dashboard/status-distribution'),
        api.get('/dashboard/template-performance'),
      ]);

      setSummary(sumRes.data.data);
      setDailySends(dailyRes.data.data || []);
      setStatusDist(statusRes.data.data || []);
      setTemplatePerf(templateRes.data.data || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={60} className="rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton height={280} className="md:col-span-2 rounded-2xl" />
          <Skeleton height={280} className="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <LineChart className="h-6 w-6 text-purple-600" /> {t.analytics.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.analytics.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value={7}>{t.analytics.last7Days}</option>
            <option value={14}>{t.analytics.last14Days}</option>
            <option value={30}>{t.analytics.last30Days}</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            {t.actions.refresh}
          </Button>
        </div>
      </div>

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.analytics.totalSent}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{summary?.totalEmailsSent || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.analytics.successfulDeliveries}</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{summary?.successfulEmails || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.analytics.failedAttempts}</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{summary?.failedEmails || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.analytics.overallSuccessRate}</p>
          <p className="text-3xl font-extrabold text-purple-600 mt-1">{summary?.successRate || 0}%</p>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {t.analytics.historicalVelocity.replace('{days}', String(days))}
            </h3>
            <p className="text-xs text-slate-500">{t.dashboard.velocitySubtitle}</p>
          </div>
          <Badge variant="purple" dot>{t.analytics.liveMetrics}</Badge>
        </div>
        <div className="h-80 w-full">
          {dailySends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="successful"
                  name={t.reports.successful}
                  stroke="#7C3AED"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleGrad)"
                />
                <Area type="monotone" dataKey="failed" name={t.reports.failedDeliveries} stroke="#EF4444" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              {t.dashboard.noActivity}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
