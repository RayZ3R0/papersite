import { IconType } from '@/components/layout/icons';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: any;
  href: string;
  color: {
    gradientBg: string;
    highlight: string;
    glow: string;
    iconBg: string;
    iconGlow: string;
    icon: string;
    text: string;
    actionBg: string;
    actionIcon: string;
    line: string;
  };
}