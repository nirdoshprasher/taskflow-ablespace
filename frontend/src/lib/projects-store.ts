// Simple localStorage-based projects store
// Projects are stored as categories on tasks

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const KEY = 'taskflow_projects';

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', name: 'Design Homepage',      color: '#6c63ff', createdAt: '2024-01-10' },
  { id: '2', name: 'Develop Login Feature', color: '#10b981', createdAt: '2024-01-12' },
  { id: '3', name: 'Test Payment Gateway',  color: '#f59e0b', createdAt: '2024-01-14' },
];

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    // First time — seed defaults
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch {}
}

export function addProject(name: string, color: string): Project {
  const projects = getProjects();
  const newProject: Project = {
    id: Date.now().toString(),
    name: name.trim(),
    color,
    createdAt: new Date().toISOString().split('T')[0],
  };
  saveProjects([...projects, newProject]);
  return newProject;
}

export function deleteProject(id: string): void {
  const projects = getProjects();
  saveProjects(projects.filter(p => p.id !== id));
}
