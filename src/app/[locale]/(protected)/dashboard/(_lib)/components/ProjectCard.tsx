'use client';

import { EditOutlined } from '@ant-design/icons';
import { Card, Image, Typography } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import React, { type ReactNode } from 'react';

import type { TProject } from '@/app/[locale]/(protected)/dashboard/(_lib)/model/projects.schemas';

interface ProjectCardProps {
  readonly project: TProject;
  readonly onEdit?: (project: TProject) => void;
  readonly onOpen?: (project: TProject) => void;
  readonly isNavigating?: boolean;
}

/**
 * Project card component with image, title, and actions
 * Displays project thumbnail, name, creation date, and edit/view actions
 */
export const ProjectCard = ({ project, onEdit, onOpen, isNavigating = false }: ProjectCardProps): React.ReactElement => {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  // Get project image (prefer avatar over imageUrl)
  const imageUrl = project.avatar || project.imageUrl || null;

  // Format creation date
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(project.createdAt));

  // Handle edit action
  const handleEdit = (): void => {
    onEdit?.(project);
  };

  // Handle open/detail action
  const handleOpen = (): void => {
    onOpen?.(project);
  };

  // Render card actions
  const cardActions: ReactNode[] = [
    <EditOutlined key="edit" className="text-lg text-slate-600 transition-colors hover:text-indigo-600" onClick={handleEdit} />,
  ];

  return (
    <Card
      hoverable
      className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      cover={
        imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              alt={project.name}
              src={imageUrl}
              preview={false}
              className="h-full w-full object-cover"
              width={400}
              height={192}
              fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f1f5f9' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <span className="text-sm font-medium text-slate-400">{t('projects.noThumbnail')}</span>
          </div>
        )
      }
      actions={cardActions}
      styles={{ body: { padding: '16px' } }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Typography.Text strong className="line-clamp-2 text-base text-slate-900">
            {project.name}
          </Typography.Text>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{formattedDate}</span>
          {onOpen && (
            <button
              className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 hover:underline disabled:opacity-50"
              type="button"
              onClick={handleOpen}
              disabled={isNavigating}
            >
              {isNavigating ? t('projects.opening') : t('projects.viewDetails')}
            </button>
          )}
        </div>

        {/* Creator info if available */}
        {project.creator && (
          <div className="mt-2 border-t border-slate-100 pt-2">
            <Typography.Text className="text-xs text-slate-500">{t('projects.createdBy', { name: project.creator.fullName })}</Typography.Text>
          </div>
        )}
      </div>
    </Card>
  );
};
