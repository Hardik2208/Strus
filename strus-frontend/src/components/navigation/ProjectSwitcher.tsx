import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfessionalProjects } from '../../features/project/hooks/useProjectQueries';
import { Briefcase, ChevronDown, Plus } from 'lucide-react';

export const ProjectSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useProfessionalProjects({ limit: 50 });
  const projects = data?.projects || [];

  // Determine active project if we are inside a professional project route
  const currentPath = location.pathname;
  const activeProjectMatch = currentPath.match(/\/dashboard\/professional\/projects\/([a-zA-Z0-9-]+)/);
  const activeProjectId = activeProjectMatch ? activeProjectMatch[1] : null;
  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative', width: '100%', padding: '0 var(--space-16)', marginBottom: 'var(--space-16)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: isOpen ? 'var(--color-surface-hover)' : 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--color-text-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <div style={{ 
            width: '24px', height: '24px', borderRadius: '4px', 
            backgroundColor: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Briefcase size={14} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeProject ? activeProject.title : 'Select Project'}
          </span>
        </div>
        <ChevronDown size={16} color="var(--color-text-secondary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 'var(--space-16)',
          right: 'var(--space-16)',
          marginTop: '4px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              Loading projects...
            </div>
          ) : (
            <>
              {projects.length > 0 ? (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '0 12px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>ACTIVE PROJECTS</div>
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { navigate(`/dashboard/professional/projects/${p.id}`); setIsOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', padding: '6px 12px',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        backgroundColor: p.id === activeProjectId ? 'var(--color-surface-hover)' : 'transparent',
                        color: 'var(--color-text-primary)', fontSize: '13px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = p.id === activeProjectId ? 'var(--color-surface-hover)' : 'transparent'}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                        {p.workspace && <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.workspace.name}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  No active projects
                </div>
              )}

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
              <button
                onClick={() => { navigate('/dashboard/professional/projects'); setIsOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--color-primary)', fontSize: '13px', fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={14} /> View All Projects
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
