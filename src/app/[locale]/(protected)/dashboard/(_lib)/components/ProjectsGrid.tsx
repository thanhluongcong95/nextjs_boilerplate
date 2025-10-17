'use client';

import { Button, Empty } from 'antd';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactElement, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ProjectCard } from '@/app/[locale]/(protected)/dashboard/(_lib)/components/ProjectCard';
import type { TProject } from '@/app/[locale]/(protected)/dashboard/(_lib)/model/projects.schemas';
import { dashboardModalState, projectsListState, selectedProjectIdState } from '@/app/[locale]/(protected)/dashboard/(_lib)/store/projects.atoms';

/**
 * Responsive projects gallery:
 * - Mobile: horizontal scrollable list (card width ~300px)
 * - Desktop: responsive grid (1/2/3/4 columns)
 * Includes a primary action to create a new project and edit handlers per card.
 */
export const ProjectsGrid = (): ReactElement => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const locale = useLocale();
  const projects = useRecoilValue(projectsListState);
  const setSelectedId = useSetRecoilState(selectedProjectIdState);
  const setModals = useSetRecoilState(dashboardModalState);
  const [navigating, setNavigating] = useState<string | null>(null);

  const hasProjects = useMemo(() => projects.length > 0, [projects.length]);

  // Open create project modal
  const handleCreateClick = (): void => {
    setModals(prev => ({ ...prev, create: true }));
  };

  // Open edit modal for a specific project
  const handleEdit = (proj: TProject): void => {
    setSelectedId(proj.id);
    setModals(prev => ({ ...prev, edit: true }));
  };

  // Navigate to project detail page
  const handleOpen = (proj: TProject): void => {
    setNavigating(proj.id);
    router.push(`/${locale}/project?projectId=${proj.id}&tab=database-dashboard`);
    // Reset navigating state after a short delay
    setTimeout(() => setNavigating(null), 1000);
  };

  return (
    <section className="w-full">
      {/* Header: title + create action */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{t('projects.heading')}</h2>
        <Button type="primary" className="rounded-md" onClick={handleCreateClick}>
          {t('projects.createNew')}
        </Button>
      </div>

      {hasProjects ? (
        <div className="space-y-6">
          {/* Mobile: horizontal scroll list */}
          <div className="-mx-4 block overflow-x-auto px-4 pb-2 md:hidden">
            <div className="flex flex-nowrap gap-4">
              {projects.map((p: TProject) => (
                <div key={p.id} className="w-[300px] flex-none">
                  <ProjectCard project={p} onEdit={handleEdit} onOpen={handleOpen} isNavigating={navigating === p.id} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: responsive grid */}
          <div className="hidden grid-cols-1 gap-4 sm:grid-cols-2 md:grid lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p: TProject) => (
              <div key={p.id}>
                <ProjectCard project={p} onEdit={handleEdit} onOpen={handleOpen} isNavigating={navigating === p.id} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <Empty description={t('projects.empty')} />
          <div className="mt-4">
            <Button type="primary" onClick={handleCreateClick}>
              {t('projects.emptyCta')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
