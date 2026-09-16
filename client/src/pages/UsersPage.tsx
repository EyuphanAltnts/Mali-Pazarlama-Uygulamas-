import React, { useEffect, useState } from 'react';
import { UserCog, Search } from 'lucide-react';
import api from '../services/api';
import { User, PagedResult } from '../types';
import { Card, Input, Badge, Button, EmptyState, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const UsersPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/users${searchParam}`);
      const data: PagedResult<User> = res.data.data;
      setUsers(data.items || []);
    } catch (err) {
      console.error('Failed to load users', err);
      toast.error(t.users.title);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}/status`, { isActive: !user.isActive });
      toast.success(!user.isActive ? t.users.activateUser : t.users.disableAccess, `${user.firstName} ${user.lastName}`);
      fetchUsers();
    } catch (err) {
      toast.error(t.status.failed);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <UserCog className="h-6 w-6 text-purple-600" /> {t.users.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t.users.subtitle}
        </p>
      </div>

      {/* Search Bar */}
      <Card noPadding className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="max-w-md"
        >
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.users.searchPlaceholder}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </form>
      </Card>

      {/* Users Table */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">{t.users.userHeader}</th>
                <th className="py-3.5 px-6">{t.users.emailHeader}</th>
                <th className="py-3.5 px-6">{t.users.statusHeader}</th>
                <th className="py-3.5 px-6">{t.users.registeredDate}</th>
                <th className="py-3.5 px-6 text-right">{t.users.toggleAccess}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4">
                      <Skeleton variant="table-row" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs">
                        {u.firstName.charAt(0)}
                      </div>
                      <span>
                        {u.firstName} {u.lastName}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{u.email}</td>
                    <td className="py-4 px-6">
                      <Badge variant={u.isActive ? 'green' : 'red'} dot>
                        {u.isActive ? t.users.active : t.users.disabled}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant={u.isActive ? 'danger' : 'secondary'}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? t.users.disableAccess : t.users.activateUser}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={UserCog}
                      title={t.users.noUsers}
                      description={t.users.noUsersDescription}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
