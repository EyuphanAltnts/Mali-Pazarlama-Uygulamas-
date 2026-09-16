import React, { useEffect, useState } from 'react';
import {
  FileCode,
  Plus,
  Trash2,
  Edit,
  Eye,
  Code2,
  Sparkles,
  Code,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import { EmailTemplate, PagedResult } from '../types';
import {
  Card,
  Button,
  Input,
  Badge,
  Modal,
  EmptyState,
  Skeleton,
  ConfirmDialog,
  RichTextEditor,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const TemplatesPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({ isOpen: false, id: '', title: '' });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/templates?pageNumber=1&pageSize=50');
      const data: PagedResult<EmailTemplate> = response.data.data;
      setTemplates(data.items || []);
    } catch (err) {
      console.error('Failed to load templates', err);
      toast.error(t.templates.title);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setCurrentTemplate(null);
    setTitle('');
    setIsActive(true);
    setHtmlContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px; }
    p { color: #475569; font-size: 15px; line-height: 1.6; }
    .btn { display: inline-block; background-color: #7c3aed; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; margin-top: 20px; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${t.templates.defaultWelcomeTitle}</h1>
    <p>${t.templates.defaultWelcomeBody}</p>
    <a href="https://example.com" class="btn">${t.templates.defaultExplore}</a>
    <div class="footer">
      <p>${t.templates.defaultFooter}</p>
    </div>
  </div>
</body>
</html>`);
    setEditorMode('visual');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setTitle(template.title);
    setHtmlContent(template.htmlContent);
    setIsActive(template.isActive);
    setEditorMode('visual');
    setIsModalOpen(true);
  };

  const handleOpenPreview = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      await api.put(`/templates/${template.id}`, {
        title: template.title,
        htmlContent: template.htmlContent,
        isActive: !template.isActive,
      });
      toast.success(
        `${template.title}: ${!template.isActive ? t.templates.active : t.templates.inactive}`
      );
      fetchTemplates();
    } catch (err) {
      toast.error(t.status.failed);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (currentTemplate) {
        await api.put(`/templates/${currentTemplate.id}`, {
          title,
          htmlContent,
          isActive,
        });
        toast.success(t.actions.save);
      } else {
        await api.post('/templates', { title, htmlContent, isActive });
        toast.success(t.templates.createTemplate);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save template.';
      setError(msg);
      toast.error(t.actions.save, msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const { id, title: tTitle } = confirmDialog;
    try {
      await api.delete(`/templates/${id}`);
      toast.success(t.actions.delete, tTitle);
      fetchTemplates();
    } catch (err: any) {
      toast.error(t.actions.delete, err.response?.data?.message || t.status.failed);
    } finally {
      setConfirmDialog({ isOpen: false, id: '', title: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCode className="h-6 w-6 text-purple-600" /> {t.templates.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Design responsive HTML email marketing templates with full WYSIWYG support.
                      {t.templates.subtitle}
          </p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
          Create Template
                  {t.templates.createTemplate}
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton height={220} className="rounded-2xl" />
          <Skeleton height={220} className="rounded-2xl" />
          <Skeleton height={220} className="rounded-2xl" />
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col justify-between hover:border-purple-200">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                    <Code2 className="h-5 w-5" />
                  </div>
                  {/* Clickable Active/Inactive Toggle Badge */}
                  <button
                    onClick={() => handleToggleActive(template)}
                    title={t.templates.toggleStatus}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <Badge variant={template.isActive ? 'green' : 'gray'} dot>
                      {template.isActive ? t.templates.active : t.templates.inactive}
                    </Badge>
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{template.title}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  {t.templates.createdBy} {template.createdByName} • {new Date(template.createdAt).toLocaleDateString()}
                </p>
                <div className="h-28 rounded-xl bg-slate-50 border border-slate-200/80 p-3 overflow-hidden text-[11px] font-mono text-slate-600 select-none">
                  {template.htmlContent.substring(0, 160)}...
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenPreview(template)}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-bold"
                >
                  <Eye className="h-3.5 w-3.5" /> {t.templates.preview}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(template)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title={t.templates.edit}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, id: template.id, title: template.title })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title={t.actions.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCode}
          title={t.templates.noTemplates}
          description={t.templates.noTemplatesDescription}
          actionLabel={t.templates.createTemplate}
          onAction={handleOpenCreate}
        />
      )}

      {/* Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="3xl"
        title={currentTemplate ? t.templates.editTitle : t.templates.createTitle}
        subtitle={currentTemplate ? t.templates.editTitle : t.templates.createTitle}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Input
                label={t.templates.templateTitleLabel}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.templates.titlePlaceholder}
                error={error || undefined}
              />
            </div>
            <div className="pb-1">
              <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700">{t.templates.activeLabel}</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {t.templates.contentEditor}
              </label>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditorMode('visual')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    editorMode === 'visual'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" /> {t.templates.visualEditor}
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('code')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    editorMode === 'code'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" /> {t.templates.codeEditor}
                </button>
              </div>
            </div>

            {editorMode === 'visual' ? (
              <RichTextEditor content={htmlContent} onChange={setHtmlContent} />
            ) : (
              <textarea
                required
                rows={12}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                placeholder="<html>...</html>"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              {t.actions.cancel}
            </Button>
            <Button type="submit" isLoading={saving}>
              {t.actions.save}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="3xl"
        title={`${t.templates.preview}: ${currentTemplate?.title || ''}`}
      >
        <div className="h-[450px] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            title={t.templates.previewTitle}
            srcDoc={currentTemplate?.htmlContent || ''}
            className="w-full h-full border-0"
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: '', title: '' })}
        onConfirm={handleDeleteConfirm}
        title={t.templates.deleteTitle}
        message={t.templates.deleteMessage.replace('{title}', confirmDialog.title)}
        confirmLabel={t.actions.delete}
        variant="danger"
      />
    </div>
  );
};
