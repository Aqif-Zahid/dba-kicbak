import axios from "axios";

/**
 * Frontend should always call same-origin (/api/*) so Next rewrites can proxy
 * to apps/api. This preserves cookies and avoids CORS/network errors.
 */
export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});
