import { createContext } from 'react';

export const LayoutContext = createContext<{
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}>({
  isSidebarOpen: false,
  setSidebarOpen: () => {},
});
