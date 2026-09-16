import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Search,
  Calendar,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { ReportItem, ReportSummary, EmailSendingStatus, PagedResult, EmailTemplate } from '../types';
import { Card, Input, Badge, Pagination, EmptyState, Skeleton, Select, Button } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const ReportsPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [emailSearch, setEmailSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch templates list for dropdown
  useEffect(() => {
    const fetchTemplatesList = async () => {
      try {
        const res = await api.get('/templates?pageNumber=1&pageSize=100');
        setTemplates(res.data.data?.items || []);
      } catch (err) {
        console.error('Failed to load templates list', err);
      }
    };
    fetchTemplatesList();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`;
      const emailParam = emailSearch ? `&email=${encodeURIComponent(emailSearch)}` : '';
      const templateParam = selectedTemplateId === 'all' ? '' : `&templateId=${selectedTemplateId}`;
      const startParam = startDate ? `&startDate=${encodeURIComponent(startDate)}` : '';
      const endParam = endDate ? `&endDate=${encodeURIComponent(endDate)}` : '';

      const queryParams = `?pageNumber=${pageNumber}&pageSize=${pageSize}${emailParam}${statusParam}${templateParam}${startParam}${endParam}`;
      const summaryParams = `?${emailParam.replace(/^&/, '')}${statusParam}${templateParam}${startParam}${endParam}`.replace(/^\?&/, '?');

      const [listRes, sumRes] = await Promise.all([
        api.get(`/reports${queryParams}`),
        api.get(`/reports/summary${summaryParams}`),
      ]);

      const data: PagedResult<ReportItem> = listRes.data.data;
      setReports(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
      setSummary(sumRes.data.data);
    } catch (err) {
      console.error('Failed to load reports', err);
      toast.error(t.reports.title);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pageNumber, statusFilter, selectedTemplateId, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchReports();
  };

  const handleResetFilters = () => {
    setEmailSearch('');
    setStatusFilter('all');
    setSelectedTemplateId('all');
    setStartDate('');
    setEndDate('');
    setPageNumber(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-600" /> {t.reports.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t.reports.subtitle}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.reports.totalDispatches}</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{summary?.totalSent || 0}</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.reports.successful}</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{summary?.successful || 0}</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.reports.failedDeliveries}</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">{summary?.failed || 0}</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.reports.successRate}</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">{summary?.successRate || 0}%</p>
        </Card>
      </div>

      {/* Search & Comprehensive Filters */}
      <Card noPadding className="p-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Email Search */}
            <Input
              type="text"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              placeholder={t.reports.searchPlaceholder}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />

            {/* Template Filter */}
            <Select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setPageNumber(1);
              }}
              options={[
                { label: t.reports.allTemplates, value: 'all' },
                ...templates.map((t) => ({ label: t.title, value: t.id })),
              ]}
            />

            {/* Delivery Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
              }}
              options={[
                { label: t.reports.allDeliveryStates, value: 'all' },
                { label: t.reports.sentSuccessful, value: '2' },
                { label: t.status.failed, value: '3' },
                { label: t.status.pending, value: '0' },
                { label: t.status.processing, value: '1' },
              ]}
            />

            {/* Reset Filters Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              {t.actions.resetFilters}
            </Button>
          </div>

          {/* Date Range Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <Input
                label={t.reports.startDate}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPageNumber(1);
                }}
                leftIcon={<Calendar className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <div>
              <Input
                label={t.reports.endDate}
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPageNumber(1);
                }}
                leftIcon={<Calendar className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">{t.reports.recipientEmail}</th>
                <th className="py-3.5 px-6">{t.reports.campaignHeader}</th>
                <th className="py-3.5 px-6">{t.reports.templateHeader}</th>
                <th className="py-3.5 px-6">{t.reports.sentTimestamp}</th>
                <th className="py-3.5 px-6">{t.status.active}</th>
                <th className="py-3.5 px-6">{t.reports.errorNotes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <Skeleton variant="table-row" />
                    </td>
                  </tr>
                ))
              ) : reports.length > 0 ? (
                reports.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{r.email}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{r.campaignName}</td>
                    <td className="py-4 px-6 text-slate-500">{r.templateName}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {r.sentAt ? new Date(r.sentAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          r.status === EmailSendingStatus.Sent
                            ? 'green'
                            : r.status === EmailSendingStatus.Failed
                            ? 'red'
                            : 'yellow'
                        }
                        dot
                      >
                        {EmailSendingStatus[r.status] || 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-rose-600 font-mono text-[11px] max-w-xs truncate">
                      {r.errorMessage || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={BarChart3}
                      title={t.reports.noRecords}
                      description={t.reports.noRecordsDescription}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPageNumber}
        />
      </Card>
    </div>
  );
};
