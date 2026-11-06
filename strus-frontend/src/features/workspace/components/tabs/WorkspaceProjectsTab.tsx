import React, { useState } from 'react';
import { useWorkspaceProjects } from '../../../project/hooks/useProjectQueries';
import { useWorkspaceMembers } from '../../hooks/useWorkspace';
import { ProjectCard } from '../../../project/components/ProjectCard';
import { CreateProjectModal } from '../../../project/components/modals/CreateProjectModal';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import type { WorkspaceDetail } from '../../types/workspace.types';
import type { Project, ProjectSortField, ProjectStatus } from '../../../project/types/project.types';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkspaceProjectsTabProps {
  workspace: WorkspaceDetail;
  memberRole: string;
}

export const WorkspaceProjectsTab: React.FC<WorkspaceProjectsTabProps> = ({ workspace }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [sortBy, setSortBy] =
  useState<ProjectSortField>('createdAt');

const [sortOrder, setSortOrder] =
  useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isError } = useWorkspaceProjects(
    workspace.id,
    { 
      page, 
      limit, 
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      sort: sortBy,
    order: sortOrder,
    }
  );

  const { data: membersData } = useWorkspaceMembers(workspace.id, 1, 50);
  const members = membersData?.members || [];

  const projects = data?.projects || [];
  const pagination = data?.pagination;

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Projects</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}>
            Manage projects inside this workspace.
          </p>
        </div>
        
        {/* All members can create projects according to business rules */}
        <Button onClick={() => setIsCreateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Create Project
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>
            <Search size={18} />
          </div>
          <Input 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value as ProjectStatus); setPage(1); }}
          style={{
            padding: '0 var(--space-12)',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)'
          }}
        >
          <option value="">All Statuses</option>
<option value="DRAFT">Draft</option>
<option value="ACTIVE">Active</option>
<option value="COMPLETED">Completed</option>
<option value="CANCELLED">Cancelled</option>
<option value="MUTUALLY_TERMINATED">Mutually Terminated</option>
<option value="DISPUTE_TERMINATED">Dispute Terminated</option>
        </select>

        <select
  value={sortBy}
  onChange={(e) => {
    setSortBy(e.target.value as ProjectSortField);
    setPage(1);
  }}
  style={{
    padding: '0 var(--space-12)',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
  }}
>
  <option value="createdAt">Created Date</option>
  <option value="title">Project Title</option>
  <option value="expectedStartDate">Expected Start Date</option>
  <option value="expectedCompletionDate">Expected Completion Date</option>
</select>

<select
  value={sortOrder}
  onChange={(e) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
    setPage(1);
  }}
  style={{
    padding: '0 var(--space-12)',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
  }}
>
  <option value="desc">Descending</option>
  <option value="asc">Ascending</option>
</select>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-16)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '150px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : isError ? (
        <div style={{ padding: 'var(--space-32)', textAlign: 'center', backgroundColor: 'var(--color-error-light)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--color-error)' }}>Failed to load projects. Please try again.</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: 'var(--space-48) 0', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>
            {searchTerm || statusFilter ? 'No projects match your search.' : 'No projects found in this workspace.'}
          </p>
          {!searchTerm && !statusFilter && (
            <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-16)' }}>
            {projects.map((project: Project) => {
              const creator = members.find(m => m.id === project.createdById);
              const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown Member';
              return (
                <ProjectCard key={project.id} project={project} workspaceId={workspace.id} creatorName={creatorName} />
              );
            })}
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
              <Button 
                variant="outline" 
                onClick={handlePrevPage} 
                disabled={page === 1}
              >
                Previous
              </Button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={handleNextPage} 
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <CreateProjectModal 
        workspaceId={workspace.id}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(projectId) => navigate(`/workspaces/${workspace.id}/projects/${projectId}`)}
      />
    </div>
  );
};
