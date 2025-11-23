/**
 * Deep sanitize function to remove undefined values from objects
 * This is used to prepare data for Firebase, which doesn't accept undefined values
 */
export const deepSanitize = (obj: any): any => {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return null;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => deepSanitize(item))
      .filter(item => item !== undefined);
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = deepSanitize(value);
      }
    }
    
    return result;
  }
  
  // Return primitives as is
  return obj;
};

/**
 * Find undefined values in an object (for debugging)
 * Returns an array of paths to undefined values
 */
export const findUndefinedValues = (obj: any, path = ''): string[] => {
  if (obj === undefined) {
    return [path];
  }
  
  if (obj === null || typeof obj !== 'object') {
    return [];
  }
  
  let results: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === undefined) {
      results.push(currentPath);
    } else if (typeof value === 'object' && value !== null) {
      results = [...results, ...findUndefinedValues(value, currentPath)];
    }
  }
  
  return results;
};
