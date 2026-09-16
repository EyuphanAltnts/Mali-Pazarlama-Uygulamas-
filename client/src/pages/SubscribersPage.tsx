import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Subscriber, PagedResult } from '../types';
import { Card, Button, Input, Badge, Modal, Pagination, EmptyState, Skeleton, ConfirmDialog, Select } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const SubscribersPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: '', email: '' });

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const activeParam = isActiveFilter === 'all' ? '' : `&isActive=${isActiveFilter === 'active'}`;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await api.get(`/subscribers?pageNumber=${pageNumber}&pageSize=${pageSize}${searchParam}${activeParam}`);
      const data: PagedResult<Subscriber> = response.data.data;
      setSubscribers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load subscribers', err);
      toast.error(t.subscribers.title);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, [pageNumber, isActiveFilter]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      await api.post('/subscribers', { email: newEmail });
      toast.success(t.subscribers.addSubscriber, newEmail);
      setIsModalOpen(false);
      setNewEmail('');
      fetchSubscribers();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0] || t.status.failed;
      setCreateError(message);
      toast.error(t.subscribers.addSubscriber, message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const { id, email } = confirmDialog;
    try {
      await api.delete(`/subscribers/${id}`);
      toast.success(t.actions.delete, email);
      fetchSubscribers();
    } catch {
      toast.error(t.status.failed);
    } finally {
      setConfirmDialog({ isOpen: false, id: '', email: '' });
    }
  };

  const handleToggleActive = async (subscriber: Subscriber) => {
    try {
      await api.put(`/subscribers/${subscriber.id}`, { email: subscriber.email, isActive: !subscriber.isActive });
      toast.success(t.status.active, subscriber.email);
      fetchSubscribers();
    } catch {
      toast.error(t.status.failed);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2"><Users className="h-6 w-6 text-purple-600" /> {t.subscribers.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.subscribers.subtitle}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>{t.subscribers.addSubscriber}</Button>
      </div>

      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={(event) => { event.preventDefault(); setPageNumber(1); fetchSubscribers(); }} className="flex-1 w-full">
            <Input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.subscribers.searchPlaceholder} leftIcon={<Search className="h-4 w-4 text-slate-400" />} />
          </form>
          <div className="w-full sm:w-48"><Select value={isActiveFilter} onChange={(event) => { setIsActiveFilter(event.target.value); setPageNumber(1); }} options={[{ label: t.subscribers.allStatuses, value: 'all' }, { label: t.subscribers.activeOnly, value: 'active' }, { label: t.subscribers.inactiveOnly, value: 'inactive' }]} /></div>
        </div>
      </Card>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider"><tr>
              <th className="py-3.5 px-6">{t.subscribers.emailHeader}</th><th className="py-3.5 px-6">{t.subscribers.statusHeader}</th><th className="py-3.5 px-6">{t.subscribers.subscribedDate}</th><th className="py-3.5 px-6 text-right">{t.subscribers.actionsHeader}</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? Array.from({ length: 5 }).map((_, index) => <tr key={index}><td colSpan={4} className="p-4"><Skeleton variant="table-row" /></td></tr>) : subscribers.length > 0 ? subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{subscriber.email}</td>
                  <td className="py-4 px-6"><button onClick={() => handleToggleActive(subscriber)}><Badge variant={subscriber.isActive ? 'green' : 'gray'} dot>{subscriber.isActive ? t.status.active : t.status.inactive}</Badge></button></td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{new Date(subscriber.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="py-4 px-6 text-right"><button onClick={() => setConfirmDialog({ isOpen: true, id: subscriber.id, email: subscriber.email })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title={t.actions.delete}><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              )) : <tr><td colSpan={4} className="py-12"><EmptyState icon={Users} title={t.actions.noResults} description={t.subscribers.subtitle} actionLabel={t.subscribers.addSubscriber} onAction={() => setIsModalOpen(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={pageNumber} totalPages={totalPages} totalCount={totalCount} pageSize={pageSize} onPageChange={setPageNumber} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.subscribers.addModalTitle} subtitle={t.subscribers.addModalSubtitle}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label={t.auth.emailLabel} type="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="subscriber@domain.com" error={createError || undefined} />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100"><Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">{t.actions.cancel}</Button><Button type="submit" isLoading={createLoading}>{t.actions.save}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, id: '', email: '' })} onConfirm={handleDeleteConfirm} title={t.subscribers.deleteTitle} message={t.subscribers.deleteMessage.replace('{email}', confirmDialog.email)} confirmLabel={t.actions.delete} variant="danger" />
    </div>
  );
};
