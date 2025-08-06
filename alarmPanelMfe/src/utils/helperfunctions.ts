//function to capitalize first letter of the input text
export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function handleAxiosError(error: any) {
  if (error.response) {
    // Server responded with a status code outside the 2xx range
    console.error("Server responded with an error:", error.response.status, error.response.data);
  } else if (error.request) {
    // Request was made, but no response received
    console.error("No response received. Server may be down or unreachable.");
  } else {
    // Something else happened
    console.error("Error setting up the request:", error.message);
  }
}

export function formatRelativeTime(timestamp: string): string {
  const time = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - time.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}


export function formatDateTime(datetime: string): string {
  const date = new Date(datetime);
    return new Intl.DateTimeFormat('en-US', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date)
}

//function to get all ancestors path of a given path
export function getAncestorPaths(path: string): string[] {
  const parts = path.split(".");
  const ancestors: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    ancestors.push(parts.slice(0, i).join("."));
  }

  return ancestors;
}

//function to get collapsed accordion titles to highlight
export function getCollapsedAncestorsToHighlight(
  highlightedPaths: string[],
  accordionStates: Record<string, boolean>
): Set<string> {
  const result = new Set<string>();

  for (const path of highlightedPaths) {
    const ancestors = getAncestorPaths(path);

    for (const ancestor of ancestors) {        
      const isCollapsed = accordionStates[ancestor] === false;
      if (isCollapsed) {
        result.add(ancestor);
      }
    }
  }

  return result;
}






