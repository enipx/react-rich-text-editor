export enum ScreenSize {
  LG = 'lg',
  MD = 'md',
  SM = 'sm',
}

export const getWindowScreenSize = () => {
  const screenWidth = window.innerWidth;

  if (screenWidth >= 992) {
    return ScreenSize.LG;
  } else if (screenWidth >= 768) {
    return ScreenSize.MD;
  } else {
    return ScreenSize.SM;
  }
};
