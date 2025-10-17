'use client';

import { App } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { projectService } from '@/app/[locale]/(protected)/dashboard/(_lib)/api/projects.service';
import type { TCreateProjectPayload, TUpdateProjectPayload } from '@/app/[locale]/(protected)/dashboard/(_lib)/model/projects.schemas';
import { projectsListState } from '@/app/[locale]/(protected)/dashboard/(_lib)/store/projects.atoms';

/**
 * Hook: expose project mutations and loading flags.
 * - createProject: call API, prepend new project to list, show toast
 * - updateProject: call API, replace updated project in list, show toast
 */
export const useProjectMutations = () => {
  const t = useTranslations('dashboard');
  const { notification } = App.useApp();
  const setProjects = useSetRecoilState(projectsListState);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  /** Create a new project and update local state */
  const createProject = useCallback(
    async (payload: TCreateProjectPayload) => {
      setCreating(true);
      try {
        const { project, message: apiMessage } = await projectService.create(payload);
        // Prepend newly created project to the list
        setProjects(prev => [project, ...prev]);
        notification.success({
          message: apiMessage || t('notifications.createSuccess'),
          placement: 'topRight',
        });
        return { project, message: apiMessage };
      } catch (error) {
        notification.error({
          message: t('notifications.createError'),
          placement: 'topRight',
        });
        throw error;
      } finally {
        setCreating(false);
      }
    },
    [setProjects, notification]
  );

  /** Update an existing project and sync local list */
  const updateProject = useCallback(
    async (id: string, payload: TUpdateProjectPayload) => {
      setUpdating(true);
      try {
        const { project, message: apiMessage } = await projectService.update(id, payload);
        // Replace the updated project in the list by id
        setProjects(prev => prev.map(p => (p.id === id ? project : p)));
        notification.success({
          message: apiMessage || t('notifications.updateSuccess'),
          placement: 'topRight',
        });
        return { project, message: apiMessage };
      } catch (error) {
        notification.error({
          message: t('notifications.updateError'),
          placement: 'topRight',
        });
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [setProjects, notification]
  );

  return { createProject, updateProject, creating, updating };
};
