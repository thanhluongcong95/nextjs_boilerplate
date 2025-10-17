'use client';

import React from 'react';

import { CreateProjectModal } from '@/app/[locale]/(protected)/dashboard/(_lib)/components/modals/CreateProjectModal';
import { EditProjectModal } from '@/app/[locale]/(protected)/dashboard/(_lib)/components/modals/EditProjectModal';
import { ProfileModal } from '@/app/[locale]/(protected)/dashboard/(_lib)/components/modals/ProfileModal';
import { ProjectsGrid } from '@/app/[locale]/(protected)/dashboard/(_lib)/components/ProjectsGrid';
import { useProjects } from '@/app/[locale]/(protected)/dashboard/(_lib)/hooks/useProjects';
import { LoadingOverlay } from '@/shared/ui/feedback/loading/LoadingOverlay';

/**
 * Dashboard page component
 * Displays projects grid with loading state and manages project modals
 */
const DashboardPage = (): React.ReactElement => {
  const { isLoading } = useProjects();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
        {isLoading ? <LoadingOverlay /> : <ProjectsGrid />}
      </section>

      {/* Modals for project management */}
      <CreateProjectModal />
      <EditProjectModal />
      <ProfileModal />
    </div>
  );
};

export default DashboardPage;
