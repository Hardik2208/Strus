import React, { useState, useEffect } from 'react';
import { useProfessionalProjects } from '../../project/hooks/useProjectQueries';
import { ProfessionalProjectCard } from '../components/ProfessionalProjectCard';
import { type ProjectStatus } from '../../project/types/project.types';
import { Search } from 'lucide-react';

export const ProfessionalProjectsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = useProfessionalProjects({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: statusFilter ? statusFilter : undefined,
    sort: 'createdAt',
    order: 'desc'
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ProjectStatus | '');
    setPage(1);
  };

  return (
    <div style={{ padding: 'var(--space-24)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>My Projects</h1>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: 'var(--space-8) var(--space-12) var(--space-8) var(--space-40)',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)'
            }}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={handleStatusChange}
          style={{
            padding: 'var(--space-8) var(--space-12)',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="MUTUALLY_TERMINATED">Terminated</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-24)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '220px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-48)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-error)' }}>Failed to load projects</h3>
          <button onClick={() => refetch()} style={{ marginTop: 'var(--space-16)', padding: 'var(--space-8) var(--space-16)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      ) : !data || data.projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-64) var(--space-24)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
            {searchTerm || statusFilter ? 'No projects found matching your criteria.' : "You don't have any active project assignments yet."}
          </h3>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-24)' }}>
            {data.projects.map((project) => (
              <ProfessionalProjectCard key={project.id} project={project} />
            ))}
          </div>

          {data.pagination && data.pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-32)' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: 'var(--space-8) var(--space-16)', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: page === 1 ? 'var(--color-surface-subtle)' : 'var(--color-surface)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ padding: 'var(--space-8) var(--space-16)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center' }}>
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                disabled={!data.pagination.hasNext}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: 'var(--space-8) var(--space-16)', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: !data.pagination.hasNext ? 'var(--color-surface-subtle)' : 'var(--color-surface)', cursor: !data.pagination.hasNext ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
