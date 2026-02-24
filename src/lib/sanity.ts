import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "q1x0tclx",
  dataset: "production",
  useCdn: true, // `false` if you want fresh data on every request
  apiVersion: "2024-03-24",
});