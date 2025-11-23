import { useCallback } from 'react';
import type { DAppPage, DAppComponent } from '@/types/dapp-builder';
import { generateId } from '../utils/helpers';

export const useComponentActions = (
  pages: DAppPage[],
  setPages: React.Dispatch<React.SetStateAction<DAppPage[]>>,
  currentPageId: string,
  setHistory: React.Dispatch<React.SetStateAction<{ pages: DAppPage[]; theme: any }[]>>,
  historyIndex: number,
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  const updateHistory = useCallback((newPages: DAppPage[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ pages: newPages, theme: prev[historyIndex]?.theme });
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex, setHistory, setHistoryIndex]);

  const addComponent = useCallback(
    (component: DAppComponent, parentId?: string) => {
      const newPages = pages.map(page => {
        if (page.id === currentPageId) {
          if (parentId) {
            // Add to a specific parent component
            const addToParent = (components: DAppComponent[]): DAppComponent[] => {
              return components.map(comp => {
                if (comp.id === parentId) {
                  return {
                    ...comp,
                    children: [...(comp.children || []), component],
                  };
                }
                if (comp.children) {
                  return {
                    ...comp,
                    children: addToParent(comp.children),
                  };
                }
                return comp;
              });
            };
            return {
              ...page,
              components: addToParent(page.components),
            };
          } else {
            // Add to the root level
            return {
              ...page,
              components: [...page.components, component],
            };
          }
        }
        return page;
      });
      setPages(newPages);
      updateHistory(newPages);
    },
    [pages, currentPageId, setPages, updateHistory]
  );

  const updateComponent = useCallback(
    (componentId: string, updates: Partial<DAppComponent>) => {
      const newPages = pages.map(page => {
        if (page.id === currentPageId) {
          const updateInTree = (components: DAppComponent[]): DAppComponent[] => {
            return components.map(comp => {
              if (comp.id === componentId) {
                return { ...comp, ...updates };
              }
              if (comp.children) {
                return {
                  ...comp,
                  children: updateInTree(comp.children),
                };
              }
              return comp;
            });
          };
          return {
            ...page,
            components: updateInTree(page.components),
          };
        }
        return page;
      });
      setPages(newPages);
      updateHistory(newPages);
    },
    [pages, currentPageId, setPages, updateHistory]
  );

  const deleteComponent = useCallback(
    (componentId: string) => {
      const newPages = pages.map(page => {
        if (page.id === currentPageId) {
          const deleteFromTree = (components: DAppComponent[]): DAppComponent[] => {
            return components
              .filter(comp => comp.id !== componentId)
              .map(comp => {
                if (comp.children) {
                  return {
                    ...comp,
                    children: deleteFromTree(comp.children),
                  };
                }
                return comp;
              });
          };
          return {
            ...page,
            components: deleteFromTree(page.components),
          };
        }
        return page;
      });
      setPages(newPages);
      updateHistory(newPages);
    },
    [pages, currentPageId, setPages, updateHistory]
  );

  const duplicateComponent = useCallback(
    (componentId: string) => {
      const newPages = pages.map(page => {
        if (page.id === currentPageId) {
          const findAndDuplicate = (components: DAppComponent[]): DAppComponent[] => {
            const result: DAppComponent[] = [];
            components.forEach(comp => {
              result.push(comp);
              if (comp.id === componentId) {
                const duplicate: DAppComponent = {
                  ...comp,
                  id: generateId(),
                  children: comp.children ? [...comp.children] : undefined,
                };
                result.push(duplicate);
              }
              if (comp.children) {
                comp = {
                  ...comp,
                  children: findAndDuplicate(comp.children),
                };
              }
            });
            return result;
          };
          return {
            ...page,
            components: findAndDuplicate(page.components),
          };
        }
        return page;
      });
      setPages(newPages);
      updateHistory(newPages);
    },
    [pages, currentPageId, setPages, updateHistory]
  );

  const moveComponent = useCallback(
    (componentId: string, newIndex: number) => {
      const newPages = pages.map(page => {
        if (page.id === currentPageId) {
          const components = [...page.components];
          const oldIndex = components.findIndex(c => c.id === componentId);
          if (oldIndex !== -1) {
            const [component] = components.splice(oldIndex, 1);
            components.splice(newIndex, 0, component);
          }
          return {
            ...page,
            components,
          };
        }
        return page;
      });
      setPages(newPages);
      updateHistory(newPages);
    },
    [pages, currentPageId, setPages, updateHistory]
  );

  return {
    addComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    moveComponent,
  };
};