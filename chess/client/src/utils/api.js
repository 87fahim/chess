const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

const normalizePath = (path) => (path.startsWith("/") ? path : `/${path}`);

export const apiUrl = (path) => {
  const normalizedPath = normalizePath(path);
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
};

export const apiFetch = (path, init = {}) => {
  const nextInit = { credentials: "include", ...init };
  return fetch(apiUrl(path), nextInit);
};