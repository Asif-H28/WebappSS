import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.tsx';
import LibraryDashboard from '../../components/library/LibraryDashboard.tsx';

const Library = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<{ title: string }[]>([]);

  return (
    <AppLayout breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}>
      <LibraryDashboard onBreadcrumbChange={setBreadcrumbs} />
    </AppLayout>
  );
};

export default Library;
