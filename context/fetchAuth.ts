export const fetchAuth = (
  url: string,
  token?: string,
  options: RequestInit = {},
) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};