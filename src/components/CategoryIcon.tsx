import {
  Baby,
  Droplet,
  Flame,
  Hammer,
  HardHat,
  Home,
  Snowflake,
  Sparkles,
  Sun,
  Trees,
  Wrench,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Hammer,
  Zap,
  Droplet,
  Sparkles,
  Snowflake,
  HardHat,
  Trees,
  Wrench,
  Flame,
  Home,
  Baby,
  Sun,
};

export function CategoryIcon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Wrench;
  return <Icon className={className} />;
}
