import React, { useEffect, useState } from 'react';
import {
  Users,
  Send,
  CheckCircle2,
  Percent,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  DashboardSummary,
  DailySend,
  StatusDistribution,
  TemplatePerformance,
  RecentActivity,
  EmailSendingStatus,
} from '../types';
import { Card, Badge, Skeleton, Button } from '../components/ui';

const STATUS_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dailySends, setDailySends] = useState<DailySend[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [templatePerf, setTemplatePerf] = useState<TemplatePerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS = [t.status.pending, t.status.processing, t.status.sent, t.status.failed];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, dailyRes, statusRes, templateRes, activityRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/daily-sends?days=7'),
          api.get('/dashboard/status-distribution'),
          api.get('/dashboard/template-performance'),
          api.get('/dashboard/recent-activity?count=8'),
        ]);

        setSummary(sumRes.data.data);
        setDailySends(dailyRes.data.data || []);
        setStatusDist(statusRes.data.data || []);
        setTemplatePerf(templateRes.data.data || []);
        setRecentActivity(activityRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={80} className="rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton height={120} className="rounded-2xl" />
          <Skeleton height={120} className="rounded-2xl" />
          <Skeleton height={120} className="rounded-2xl" />
          <Skeleton height={120} className="rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton height={320} className="lg:col-span-2 rounded-2xl" />
          <Skeleton height={320} className="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="h-3.5 w-3.5" /> {t.dashboard.welcomeBack}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.dashboard.hello.replace('{name}', user?.fullName || 'Marketer')}
          </h1>
          <p className="text-sm text-purple-100 mt-1 max-w-xl">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/campaigns">
            <Button
              variant="secondary"
              className="bg-white text-purple-700 hover:bg-purple-50 font-bold border-0 shadow-sm"
              leftIcon={<Send className="h-4 w-4" />}
            >
              {t.dashboard.newCampaign}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.totalSubscribers}</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{summary?.totalSubscribers || 0}</span>
            <Badge variant="green" dot>{t.dashboard.activeList}</Badge>
          </div>
        </Card>

        <Card className="hover:border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.totalCampaigns}</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{summary?.totalCampaigns || 0}</span>
            <span className="text-xs font-semibold text-slate-500">
              {t.dashboard.templatesCount.replace('{count}', String(summary?.totalTemplates || 0))}
            </span>
          </div>
        </Card>

        <Card className="hover:border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.successfulSends}</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{summary?.successfulEmails || 0}</span>
            <span className="text-xs text-slate-500 font-medium">
              {t.dashboard.totalEmails.replace('{total}', String(summary?.totalEmailsSent || 0))}
            </span>
          </div>
        </Card>

        <Card className="hover:border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard.deliveryRate}</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{summary?.successRate || 0}%</span>
            <span className="text-xs font-semibold text-rose-600">
              {t.dashboard.failedCount.replace('{count}', String(summary?.failedEmails || 0))}
            </span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Send Velocity Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{t.dashboard.dispatchVelocity}</h3>
              <p className="text-xs text-slate-500">{t.dashboard.velocitySubtitle}</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="h-72 w-full">
            {dailySends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      color: '#0F172A',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="successful"
                    name={t.reports.successful}
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSuccessful)"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name={t.reports.failedDeliveries}
                    stroke="#EF4444"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t.dashboard.noActivity}
              </div>
            )}
          </div>
        </Card>

        {/* Status Breakdown Pie Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{t.dashboard.statusBreakdown}</h3>
              <p className="text-xs text-slate-500">{t.dashboard.statusSubtitle}</p>
            </div>
          </div>
          <div className="h-52 w-full">
            {statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDist}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0F172A',
                    }}
                    formatter={(val, name) => [val, STATUS_LABELS[Number(name)] || name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t.dashboard.noLogs}
              </div>
            )}
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            {STATUS_LABELS.map((label, idx) => (
              <div key={label} className="flex items-center gap-2 text-xs font-semibold">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[idx] }} />
                <span className="text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Section: Template Performance & Recent Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Performance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{t.dashboard.templatePerformance}</h3>
              <p className="text-xs text-slate-500">{t.dashboard.templatePerfSubtitle}</p>
            </div>
            <Link to="/templates" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              {t.actions.viewAll} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-64 w-full">
            {templatePerf.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templatePerf} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="templateName" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="successful" name={t.reports.successful} fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="failed" name={t.reports.failedDeliveries} fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t.dashboard.noTemplatesDispatched}
              </div>
            )}
          </div>
        </Card>

        {/* Live Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{t.dashboard.recentDispatches}</h3>
              <p className="text-xs text-slate-500">{t.dashboard.recentSubtitle}</p>
            </div>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-xs"
                >
                  <div className="truncate max-w-[220px]">
                    <p className="font-bold text-slate-900 truncate">{activity.email}</p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {activity.campaignName} • {activity.templateName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        activity.status === EmailSendingStatus.Sent
                          ? 'green'
                          : activity.status === EmailSendingStatus.Failed
                          ? 'red'
                          : 'yellow'
                      }
                      size="sm"
                    >
                      {STATUS_LABELS[activity.status] || t.status.pending}
                    </Badge>
                    <span className="text-[10px] font-medium text-slate-400">
                      {activity.sentAt ? new Date(activity.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                {t.dashboard.noLogs}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
