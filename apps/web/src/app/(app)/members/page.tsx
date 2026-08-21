import { Placeholder } from "@/components/app/placeholder";
import { MembersIcon } from "@/components/marketing/icons";

export const metadata = { title: "Members · Anchor" };

export default function MembersPage() {
  return (
    <Placeholder
      title="Members"
      description="Invite instructors, archers, and guardians to your club and manage their roles."
      Icon={MembersIcon}
    />
  );
}
