export const getActiveRoute = () => {
  const route = window.location.hash.slice(1).split('?')[0];
  return route || '/home';
};
