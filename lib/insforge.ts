import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  baseUrl: "https://8qn72bza.us-east.insforge.app",
  anonKey: "ik_6d6c0108a931deb33707cad6a802a9ed",
});

export default insforge;
