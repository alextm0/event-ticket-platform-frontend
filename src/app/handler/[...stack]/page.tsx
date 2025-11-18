// Stack Auth handler removed
// This route is no longer needed after removing Stack Auth

import { redirect } from "next/navigation";

export default function Handler() {
  // Redirect to home page since Stack Auth is no longer used
  redirect("/");
}
