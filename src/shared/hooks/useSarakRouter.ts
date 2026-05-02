import { useState, useEffect, useCallback } from 'react';

/**
 * Interface that defines the return of the routing hook
 */
export interface SarakRouterState {
  currentPath: string;
  segments: string[];
  navigate: (path: string, replace?: boolean) => void;
  getParam: (index: number) => string | undefined;
}

/**
 * Hook for native routing based on the browser's History API.
 * Designed to replace memory-based activeModuleId state and allow deep linking.
 */
export function useSarakRouter(basePath: string = '/'): SarakRouterState {
  // Read current path from window.location, falling back to '/'
  const getCurrentPath = useCallback(() => {
    if (typeof window === 'undefined') return '/';
    let path = window.location.pathname;
    
    // Remove basePath if it exists
    if (basePath !== '/' && path.startsWith(basePath)) {
      path = path.substring(basePath.length);
    }
    
    return path || '/';
  }, [basePath]);

  const [currentPath, setCurrentPath] = useState<string>(getCurrentPath());

  // Derive segments from current path, filtering out empty strings
  const segments = currentPath.split('/').filter(Boolean);

  // Navigate to a new path
  const navigate = useCallback((path: string, replace: boolean = false) => {
    if (typeof window === 'undefined') return;

    // Normalize path to ensure it starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Construct full path with basePath
    const fullPath = basePath === '/' 
      ? normalizedPath 
      : `${basePath}${normalizedPath === '/' ? '' : normalizedPath}`;

    if (replace) {
      window.history.replaceState(null, '', fullPath);
    } else {
      window.history.pushState(null, '', fullPath);
    }

    // Manually dispatch a popstate event so listeners can update
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
  }, [basePath]);

  // Handle popstate events (back/forward browser buttons and programmatic pushes)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      setCurrentPath(getCurrentPath());
    };

    // Initial read
    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [getCurrentPath]);

  // Utility to get a segment by index safely
  const getParam = useCallback((index: number) => {
    return segments[index];
  }, [segments]);

  return {
    currentPath,
    segments,
    navigate,
    getParam
  };
}
