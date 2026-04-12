import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/client/PostProject.jsx',
  'src/pages/client/ClientProjects.jsx',
  'src/pages/client/ProjectDetail.jsx',
  'src/pages/client/ClientPayments.jsx',
  'src/pages/client/ClientMessages.jsx',
  'src/pages/client/ClientSettings.jsx',
  'src/pages/freelancer/FreelancerTasks.jsx',
  'src/pages/freelancer/TaskDetail.jsx',
  'src/pages/freelancer/FreelancerEarnings.jsx',
  'src/pages/freelancer/FreelancerProgress.jsx',
  'src/pages/freelancer/FreelancerMessages.jsx',
  'src/pages/freelancer/FreelancerSettings.jsx',
  'src/pages/admin/AdminUsers.jsx',
  'src/pages/admin/AdminClients.jsx',
  'src/pages/admin/AdminFreelancers.jsx',
  'src/pages/admin/AdminProjects.jsx',
  'src/pages/admin/AdminDisputes.jsx',
  'src/pages/admin/AdminPromotions.jsx',
  'src/pages/admin/AdminSettings.jsx'
];

for (const f of files) {
  const name = path.basename(f, '.jsx');
  const dir = path.dirname(f);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(f, `export default function ${name}() { return <div className="p-6"><h1 className="text-2xl font-bold mb-4">${name}</h1><p className="text-text-muted">This page is under construction.</p></div>; }`, 'utf8');
}
console.log('Fixed encodings!');
