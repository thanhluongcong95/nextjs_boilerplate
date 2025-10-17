type LoadingSetter = (updater: (prev: number) => number) => void;

let setLoadingCount: LoadingSetter | null = null;

export function registerGlobalLoading(setter: LoadingSetter | null) {
  setLoadingCount = setter;
}

function updateCount(delta: number) {
  if (!setLoadingCount) {
    return;
  }
  setLoadingCount(prev => {
    const next = prev + delta;
    return Math.max(0, next);
  });
}

export function startGlobalLoading() {
  updateCount(1);
}

export function stopGlobalLoading() {
  updateCount(-1);
}
