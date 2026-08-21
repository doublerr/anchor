import { Placeholder } from "@/components/app/placeholder";
import { SettingsIcon } from "@/components/marketing/icons";

export const metadata = { title: "Settings · Anchor" };

export default function SettingsPage() {
  return (
    <Placeholder
      title="Organization settings"
      description="Update your club's profile, contact details, branding, and operational settings."
      Icon={SettingsIcon}
    />
  );
}
