import { atom, selector } from 'recoil';

import type { TProject } from '@/app/[locale]/(protected)/dashboard/(_lib)/model/projects.schemas';

export const projectsListState = atom<TProject[]>({
  key: 'dashboard/projects/list',
  default: [],
});

export const projectsLoadingState = atom<boolean>({
  key: 'dashboard/projects/loading',
  default: false,
});

export const dashboardModalState = atom({
  key: 'dashboard/modals',
  default: {
    create: false,
    edit: false,
    profile: false,
    password: false,
  },
});

export const selectedProjectIdState = atom<string | null>({
  key: 'dashboard/projects/selectedId',
  default: null,
});

export const selectedProjectSelector = selector<TProject | null>({
  key: 'dashboard/projects/selected',
  get: ({ get }) => {
    const id = get(selectedProjectIdState);
    const list = get(projectsListState);
    if (!id) return null;
    return list.find(p => p.id === id) ?? null;
  },
});
