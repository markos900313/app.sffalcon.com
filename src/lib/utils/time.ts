export const parseTime = (val: string) => {
  if (!val) return 0;
  const [h, m] = val.split(':').map(Number);
  return (h * 60) + m;
};

export const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};
