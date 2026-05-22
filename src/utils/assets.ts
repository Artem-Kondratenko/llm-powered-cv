export function publicAsset(path: string) {
  if (/^(https?:|mailto:|tel:)/.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL || "/";

  if (path.startsWith("/")) {
    return `${base}${path.slice(1)}`;
  }

  return `${base}${path}`;
}
