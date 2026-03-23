export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const createEmptyGrid = (): import('../types').GridData => {
  return Array.from({ length: 9 }).map(() => ({
    id: generateId(),
    text: '',
    children: null,
  }));
};
