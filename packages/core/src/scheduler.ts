export const createScheduler = (callback: () => any) => {
  let isScheduled = false;

  return () => {
    if (isScheduled) {
      return;
    }
    isScheduled = true;
    queueMicrotask(() => {
      callback();
      isScheduled = false;
    });
  }
}
