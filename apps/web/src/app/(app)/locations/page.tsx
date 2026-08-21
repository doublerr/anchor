import { Placeholder } from "@/components/app/placeholder";
import { MapPinIcon } from "@/components/marketing/icons";

export const metadata = { title: "Locations · Anchor" };

export default function LocationsPage() {
  return (
    <Placeholder
      title="Locations"
      description="Add and edit the ranges and venues where your club shoots, each with its own directions."
      Icon={MapPinIcon}
    />
  );
}
