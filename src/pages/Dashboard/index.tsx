import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.tsx';
import AdmissionDashboard from '../../components/admissions/AdmissionDashboard.tsx';

const Dashboard = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string }[]>([]);

  return (
    <AppLayout breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}>
      <AdmissionDashboard onBreadcrumbChange={setBreadcrumbs} />
    </AppLayout>
  );
};

export default Dashboard;
