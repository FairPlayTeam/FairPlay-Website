import { VideoCard as BaseVideoCard } from "@/app/components/ui/VideoCard";

type Props = {
  thumbnailUrl: string | null;
  title: string;
  displayName?: string | null;
  meta?: string;
  onPress?: () => void;
  style?: string;
};

export default function VideoCard(props: Props) {
  return <BaseVideoCard {...props} variant="grid" />;
}
