import { SVGProps } from 'react';

export type IconType = (props: SVGProps<SVGSVGElement>) => JSX.Element;

export const SearchIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeWidth="2" stroke="currentColor" />
  </svg>
);

export const BookIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const NotesIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PaperIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ForumIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.862 9.862 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LatestIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FileTextIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M9 12h6m-6 4h6M9 8h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GridIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MessageCircleIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChevronDownIcon: IconType = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M6 9l6 6 6-6" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);