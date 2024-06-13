type Task = () => any;

const queue: Task[] = [];

const enqueue = (task: Task) => {
  if (queue.length === 0) {
    queueMicrotask(() => {
      queue.forEach(task => task());
      queue.length = 0;
    });
  }
  queue.push(task);
};

export const createScheduler = (callback: Task) => {
  let isScheduled = false;

  return () => {
    if (isScheduled) {
      return;
    }
    isScheduled = true;
    enqueue(() => {
      callback();
      isScheduled = false;
    });
  }
}
