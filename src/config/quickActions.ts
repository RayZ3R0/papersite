import { QuickAction } from "@/types/actions";
import { BookIcon, PaperIcon, NotesIcon, ForumIcon, LatestIcon, SearchIcon } from "@/components/layout/icons";

export const quickActions: QuickAction[] = [
  {
    id: "books",
    label: "Textbooks",
    description: "Study materials & guides",
    icon: BookIcon,
    href: "/books",
    color: {
      gradientBg: "bg-gradient-to-br from-blue-950/20 via-blue-900/10 to-blue-950/5",
      highlight: "bg-blue-400",
      glow: "rgba(59, 130, 246, 0.07)",
      iconBg: "bg-blue-500/10",
      iconGlow: "bg-blue-400/20",
      icon: "text-blue-400",
      text: "text-blue-400",
      actionBg: "bg-blue-500/10",
      actionIcon: "text-blue-400",
      line: "bg-blue-400/20"
    },
  },
  {
    id: "papers",
    label: "Past Papers",
    description: "Previous exam questions",
    icon: PaperIcon,
    href: "/papers",
    color: {
      gradientBg: "bg-gradient-to-br from-purple-950/20 via-purple-900/10 to-purple-950/5",
      highlight: "bg-purple-400",
      glow: "rgba(147, 51, 234, 0.07)",
      iconBg: "bg-purple-500/10",
      iconGlow: "bg-purple-400/20",
      icon: "text-purple-400",
      text: "text-purple-400",
      actionBg: "bg-purple-500/10",
      actionIcon: "text-purple-400",
      line: "bg-purple-400/20"
    },
  },
  {
    id: "notes",
    label: "Notes",
    description: "Shared study materials",
    icon: NotesIcon,
    href: "/notes",
    color: {
      gradientBg: "bg-gradient-to-br from-teal-950/20 via-teal-900/10 to-teal-950/5",
      highlight: "bg-teal-400",
      glow: "rgba(20, 184, 166, 0.07)",
      iconBg: "bg-teal-500/10",
      iconGlow: "bg-teal-400/20",
      icon: "text-teal-400",
      text: "text-teal-400",
      actionBg: "bg-teal-500/10",
      actionIcon: "text-teal-400",
      line: "bg-teal-400/20"
    },
  },
  {
    id: "forum",
    label: "Community",
    description: "Discuss & get help",
    icon: ForumIcon,
    href: "/forum",
    color: {
      gradientBg: "bg-gradient-to-br from-orange-950/20 via-orange-900/10 to-orange-950/5",
      highlight: "bg-amber-400",
      glow: "rgba(251, 146, 60, 0.07)",
      iconBg: "bg-amber-500/10",
      iconGlow: "bg-amber-400/20",
      icon: "text-amber-400",
      text: "text-amber-400",
      actionBg: "bg-amber-500/10",
      actionIcon: "text-amber-400",
      line: "bg-amber-400/20"
    },
  },
  {
    id: "latest",
    label: "Latest",
    description: "Recently added resources",
    icon: LatestIcon,
    href: "/latest",
    color: {
      gradientBg: "bg-gradient-to-br from-pink-950/20 via-pink-900/10 to-pink-950/5",
      highlight: "bg-pink-400",
      glow: "rgba(236, 72, 153, 0.07)",
      iconBg: "bg-pink-500/10",
      iconGlow: "bg-pink-400/20",
      icon: "text-pink-400",
      text: "text-pink-400",
      actionBg: "bg-pink-500/10",
      actionIcon: "text-pink-400",
      line: "bg-pink-400/20"
    },
  },
  {
    id: "search",
    label: "Search",
    description: "Find specific resources",
    icon: SearchIcon,
    href: "/search",
    color: {
      gradientBg: "bg-gradient-to-br from-indigo-950/20 via-indigo-900/10 to-indigo-950/5",
      highlight: "bg-indigo-400",
      glow: "rgba(99, 102, 241, 0.07)",
      iconBg: "bg-indigo-500/10",
      iconGlow: "bg-indigo-400/20",
      icon: "text-indigo-400",
      text: "text-indigo-400",
      actionBg: "bg-indigo-500/10",
      actionIcon: "text-indigo-400",
      line: "bg-indigo-400/20"
    },
  },
];