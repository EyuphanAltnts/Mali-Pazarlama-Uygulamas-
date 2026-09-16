import React, { useEffect, useState } from 'react';
import {
  Send,
  Plus,
  Play,
  Trash2,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import {
  Campaign,
  CampaignDetail,
  EmailTemplate,
  Subscriber,
  CampaignStatus,
  PagedResult,
} from '../types';
import {
  Card,
  Button,
  Input,
  Badge,
  Modal,
  EmptyState,
  Skeleton,
  ConfirmDialog,
  Select,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const CampaignsPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'send' | 'delete';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'delete', id: '', name: '' });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns?pageNumber=1&pageSize=50');
      const data: PagedResult<Campaign> = res.data.data;
      setCampaigns(data.items || []);
    } catch (err) {
      console.error('Failed to load campaigns', err);
      toast.error(t.campaigns.title);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openCreateModal = async () => {
    try {
      const [tplRes, subRes] = await Promise.all([
        api.get('/templates?pageNumber=1&pageSize=100'),
        api.get('/subscribers?pageNumber=1&pageSize=1000&isActive=true'),
      ]);
      setTemplates(tplRes.data.data?.items || []);
      const subs = subRes.data.data?.items || [];
      setSubscribers(subs);
      setSelectedSubscribers(subs.map((s: Subscriber) => s.id));
      if (tplRes.data.data?.items?.length > 0) {
        setTemplateId(tplRes.data.data.items[0].id);
      }
      setIsCreateOpen(true);
    } catch (err) {
      toast.error(t.campaigns.newCampaign, t.campaigns.subtitle);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubscribers.length === 0) {
      setCreateError('Please select at least one subscriber recipient.');
      return;
    }
    setCreateError(null);
    setCreating(true);

    try {
      await api.post('/campaigns', {
        name: campaignName,
        templateId,
        subscriberIds: selectedSubscribers,
      });
      toast.success('Campaign created successfully!', campaignName);
      setIsCreateOpen(false);
      setCampaignName('');
      fetchCampaigns();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create campaign';
      setCreateError(msg);
      toast.error(t.campaigns.newCampaign, msg);
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmAction = async () => {
    const { type, id, name } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (type === 'send') {
      try {
        await api.post(`/campaigns/${id}/send`);
        toast.success('Campaign execution started!', `Sending emails asynchronously for "${name}".`);
        fetchCampaigns();
      } catch (err: any) {
        toast.error(t.campaigns.startDispatching, err.response?.data?.message || t.status.failed);
      }
    } else if (type === 'delete') {
      try {
        await api.delete(`/campaigns/${id}`);
        toast.success('Draft campaign deleted', name);
        fetchCampaigns();
      } catch (err: any) {
        toast.error(t.actions.delete, err.response?.data?.message || t.status.failed);
      }
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/campaigns/${id}`);
      setSelectedCampaign(res.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error(t.campaigns.executionProgress);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Send className="h-6 w-6 text-purple-600" /> Email Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch bulk marketing campaigns with real-time background channel queues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchCampaigns} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
          <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">{t.campaigns.campaignName}</th>
                <th className="py-3.5 px-6">{t.campaigns.templateName}</th>
                <th className="py-3.5 px-6">{t.campaigns.recipientsCount}</th>
                <th className="py-3.5 px-6">{t.status.active}</th>
                <th className="py-3.5 px-6">{t.campaigns.createdDate}</th>
                <th className="py-3.5 px-6 text-right">{t.subscribers.actionsHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <Skeleton variant="table-row" />
                    </td>
                  </tr>
                ))
              ) : campaigns.length > 0 ? (
                campaigns.map((c) => {
                  const statusInfo = {
                    [CampaignStatus.Draft]: { label: t.status.draft, variant: 'gray' as const },
                    [CampaignStatus.Processing]: { label: t.status.processing, variant: 'blue' as const },
                    [CampaignStatus.Completed]: { label: t.status.completed, variant: 'green' as const },
                    [CampaignStatus.Failed]: { label: t.status.failed, variant: 'red' as const },
                    [CampaignStatus.Cancelled]: { label: t.status.cancelled, variant: 'yellow' as const },
                  }[c.status] || { label: t.actions.noResults, variant: 'gray' as const };
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <button
                          onClick={() => handleViewDetail(c.id)}
                          className="hover:text-purple-600 text-left transition"
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{c.templateName}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{c.totalRecipients} recipients</td>
                      <td className="py-4 px-6">
                        <Badge variant={statusInfo.variant} dot>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === CampaignStatus.Draft && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  type: 'send',
                                  id: c.id,
                                  name: c.name,
                                })
                              }
                              leftIcon={<Play className="h-3 w-3" />}
                            >
                              Send Now
                            </Button>
                          )}
                          <button
                            onClick={() => handleViewDetail(c.id)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition"
                              title={t.campaigns.viewProgress}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          {c.status === CampaignStatus.Draft && (
                            <button
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  type: 'delete',
                                  id: c.id,
                                  name: c.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title={t.campaigns.deleteDraft}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={Send}
                      title={t.campaigns.noCampaigns}
                      description={t.campaigns.noCampaignsDescription}
                      actionLabel={t.campaigns.newCampaign}
                      onAction={openCreateModal}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail & Progress Modal */}
      <Modal
        isOpen={isDetailOpen && selectedCampaign !== null}
        onClose={() => setIsDetailOpen(false)}
        maxWidth="2xl"
        title={selectedCampaign?.name}
        subtitle={`Template: ${selectedCampaign?.templateName}`}
      >
        {selectedCampaign && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-700">{t.campaigns.executionProgress}</span>
                <span className="text-purple-600 font-mono">{selectedCampaign.progressPercentage}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-500"
                  style={{ width: `${selectedCampaign.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Metric Counters */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t.status.pending}</span>
                <p className="text-xl font-extrabold text-amber-600 mt-1">{selectedCampaign.pending}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t.status.processing}</span>
                <p className="text-xl font-extrabold text-blue-600 mt-1">{selectedCampaign.processing}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t.status.sent}</span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">{selectedCampaign.sent}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">{t.status.failed}</span>
                <p className="text-xl font-extrabold text-rose-600 mt-1">{selectedCampaign.failed}</p>
              </div>
            </div>

            {selectedCampaign.status === CampaignStatus.Draft && (
              <div className="pt-2 flex justify-end">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                  leftIcon={<Play className="h-4 w-4" />}
                  onClick={() => {
                    setIsDetailOpen(false);
                    setConfirmDialog({
                      isOpen: true,
                      type: 'send',
                      id: selectedCampaign.id,
                      name: selectedCampaign.name,
                    });
                  }}
                >
                  Start Dispatching Emails Now
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="lg"
        title={t.campaigns.newCampaign}
        subtitle={t.campaigns.targetSubscribers.replace('({count} selected)', '')}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t.campaigns.campaignName}
            type="text"
            required
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder={t.campaigns.campaignName}
            error={createError || undefined}
          />

          <Select
            label={t.campaigns.templateName}
            required
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            options={templates.map((t) => ({ label: t.title, value: t.id }))}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {t.campaigns.targetSubscribers.replace('{count}', String(selectedSubscribers.length))}
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedSubscribers(
                    selectedSubscribers.length === subscribers.length
                      ? []
                      : subscribers.map((s) => s.id)
                  )
                }
                className="text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                {selectedSubscribers.length === subscribers.length ? t.actions.deselectAll : t.actions.selectAll}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
              {subscribers.map((sub) => (
                <label key={sub.id} className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.includes(sub.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubscribers([...selectedSubscribers, sub.id]);
                      } else {
                        setSelectedSubscribers(selectedSubscribers.filter((id) => id !== sub.id));
                      }
                    }}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="font-medium">{sub.email}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Create Campaign
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.type === 'send' ? t.campaigns.launchTitle : t.campaigns.deleteTitle}
        message={
          confirmDialog.type === 'send'
            ? t.campaigns.launchMessage.replace('{name}', confirmDialog.name)
            : t.campaigns.deleteMessage.replace('{name}', confirmDialog.name)
        }
        confirmLabel={confirmDialog.type === 'send' ? t.campaigns.startDispatching : t.campaigns.deleteDraft}
        variant={confirmDialog.type === 'send' ? 'primary' : 'danger'}
      />
    </div>
  );
};
