// On Native, Skia is built-in or linked.
// No extra initialization needed for native platforms.
export const initSkia = async () => {
  return Promise.resolve();
};
