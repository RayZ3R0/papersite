import { IconType } from '@/components/layout/icons';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: IconType;
  href: string;
  color: {
    bg: string;
    hover: string;
    text: string;
  };
}