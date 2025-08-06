export function getChangedPaths(
  original: any,
  diff: any,
  path: string = '',
  labelPath: string = ''
): string[] {
  const changes: string[] = [];

  if (Array.isArray(diff)) {
    for (let i = 0; i < diff.length; i++) {
      const val2 = diff[i];
      const val1 = original?.[i];

      const structuralPath = `${path}[${i}]`;
      const arrayKey = path.split('.').pop() ?? 'Item';
      const labelPathForItem = `${labelPath}.${arrayKey} ${i}`;

      if (
        typeof val1 === 'object' &&
        typeof val2 === 'object' &&
        val1 !== null &&
        val2 !== null
      ) {
        changes.push(...getChangedPaths(val1, val2, structuralPath, labelPathForItem));
      } else if (val1 !== val2) {
        changes.push(labelPathForItem);
      }
    }

    return changes;
  }

  if (typeof diff === 'object' && diff !== null) {
    for (const key of Object.keys(diff)) {
      const val2 = diff[key];
      const val1 = original?.[key];

      const nextPath = path ? `${path}.${key}` : key;
      const nextLabelPath = labelPath ? `${labelPath}.${key}` : key;

      if (
        typeof val1 === 'object' &&
        typeof val2 === 'object' &&
        val1 !== null &&
        val2 !== null
      ) {
        changes.push(...getChangedPaths(val1, val2, nextPath, nextLabelPath));
      } else if (val1 !== val2) {
        changes.push(nextLabelPath);
      }
    }

    return changes;
  }

  // diff is a primitive and doesn't match the original
  if (original !== diff && labelPath) {
    return [labelPath];
  }

  return [];
}
