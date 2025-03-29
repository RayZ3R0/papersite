import { QuickAction } from '@/types/actions';
import { BookIcon, PaperIcon, NotesIcon, ForumIcon, LatestIcon, SearchIcon } from '@/components/layout/icons';

export const quickActions: QuickAction[] = [
  {
    id: 'books',
    label: 'Books',
    description: 'Browse textbooks and study materials',
    icon: BookIcon,
    href: '/books',
    color: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
      hover: 'hover:from-blue-500/20 hover:to-blue-600/20',
      text: 'text-blue-500',
    },
  },
  {
    id: 'papers',
    label: 'Past Papers',
    description: 'Access previous exam papers',
    icon: PaperIcon,
    href: '/subjects',
    color: {
      bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
      hover: 'hover:from-purple-500/20 hover:to-purple-600/20',
      text: 'text-purple-500',
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'View shared study notes',
    icon: NotesIcon,
    href: '/notes',
    color: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-600/10',
      hover: 'hover:from-green-500/20 hover:to-green-600/20',
      text: 'text-green-500',
    },
  },
  {
    id: 'forum',
    label: 'Forum',
    description: 'Join discussions with others',
    icon: ForumIcon,
    href: '/forum',
    color: {
      bg: 'bg-gradient-to-br from-orange-500/10 to-orange-600/10',
      hover: 'hover:from-orange-500/20 hover:to-orange-600/20',
      text: 'text-orange-500',
    },
  },
  {
    id: 'latest',
    label: 'Latest',
    description: 'See recent additions',
    icon: LatestIcon,
    href: '/latest',
    color: {
      bg: 'bg-gradient-to-br from-pink-500/10 to-pink-600/10',
      hover: 'hover:from-pink-500/20 hover:to-pink-600/20',
      text: 'text-pink-500',
    },
  },
  {
    id: 'search',
    label: 'Advanced Search',
    description: 'Search with filters',
    icon: SearchIcon,
    href: '/search',
    color: {
      bg: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/10',
      hover: 'hover:from-indigo-500/20 hover:to-indigo-600/20',
      text: 'text-indigo-500',
    },
  },
];