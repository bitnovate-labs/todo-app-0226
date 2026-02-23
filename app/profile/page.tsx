import { redirect } from "next/navigation";

/** Redirect /profile to /settings for backwards compatibility. */
export default function ProfileRedirect() {
  redirect("/settings");
}
