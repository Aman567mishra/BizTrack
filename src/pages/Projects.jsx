import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineFolderOpen, HiOutlinePlus } from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useProjectsList } from '../hooks/useDataCache';
import { createProject, updateProjectMeta } from '../services/projectService';
import { syncAfterMutation } from '../utils/mutationSync';
import { PROJECT_STATUSES } from '../utils/constants';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Input, Select } from '../components/ui/FormFields';

export default function Projects() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { projects, hasMore, loading, loadMore, reload } = useProjectsList(
    statusFilter,
    debouncedSearch
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProjectMeta(user.uid, editing.id, form, editing);
        await syncAfterMutation(editing.id);
      } else {
        await createProject(user.uid, form);
        await syncAfterMutation();
      }
      setModalOpen(false);
      setEditing(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500">All data stored in one project document</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <HiOutlinePlus className="h-5 w-5" />
          New Project
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-border-light bg-card-light p-4 dark:border-border-dark dark:bg-card-dark">
        <Input
          placeholder="Search projects or customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option value="All">All Statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {loading && !projects.length ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={HiOutlineFolderOpen}
          title="No projects found"
          description="Create your first project with deal amount and optional advance payment."
          action={
            <Button onClick={() => setModalOpen(true)}>Create Project</Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Project' : 'New Project'}
        size="lg"
      >
        <ProjectForm
          isEdit={Boolean(editing)}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
