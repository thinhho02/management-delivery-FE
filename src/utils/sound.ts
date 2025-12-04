export const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 1.0;
  audio.play().catch(() => {});
};