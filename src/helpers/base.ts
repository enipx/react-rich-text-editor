export const classNamesLists = {
  toolbar: 'enipx-rich-text-toolbar',
  dropdown: 'enipx-rich-text-dropdown',
};

export const updateDropdownPosition = () => {
  const toolbar = document.querySelector(
    `.${classNamesLists.toolbar}`
  ) as HTMLElement | null;
  const dropdown = document.querySelector(
    `.${classNamesLists.dropdown}`
  ) as HTMLElement | null;

  if (!toolbar || !dropdown) {
    return;
  }

  const { left, top } = toolbar.getBoundingClientRect();

  const topOffset = top + window.scrollY + toolbar.clientHeight;

  dropdown.style.top = `${topOffset}px`;
  dropdown.style.left = `${left}px`;
};
