'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';

import { projectService } from '@/app/[locale]/(protected)/dashboard/(_lib)/api/projects.service';
import { projectsListState, projectsLoadingState } from '@/app/[locale]/(protected)/dashboard/(_lib)/store/projects.atoms';
import { handleError } from '@/shared/infra/errors/error-handler';

/**
 * Hook: load projects list once on mount and expose a manual refetch.
 * - Caches the initial fetch with a ref to avoid duplicate API calls
 * - Stores loading flag in Recoil to sync with the rest of the app
 */
export const useProjects = () => {
  const [isLoading, setLoading] = useRecoilState(projectsLoadingState);
  const [, setProjects] = useRecoilState(projectsListState);
  const hasFetchedRef = useRef(false); // remember if we've already fetched

  /** Fetch projects from API and push into Recoil store */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll();
      setProjects(res.items);
      hasFetchedRef.current = true;
    } catch (error) {
      // Centralized error handling with optional user notification
      handleError(error, { showNotification: true });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProjects]);

  useEffect(() => {
    // Fetch once on mount to avoid duplicate API calls.
    // After create/update, the list is updated optimistically, so no auto-refetch here.
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      void fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  return { isLoading, refetch: fetchProjects };
};
