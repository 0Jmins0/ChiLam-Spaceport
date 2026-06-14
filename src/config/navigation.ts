export interface NavItem {
  label: string;
  labelEn: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: '主页', labelEn: 'Home', href: '/' },
  { label: '演出', labelEn: 'Performances', href: '/performances' },
  // { label: '动态', labelEn: 'Updates', href: '/updates' },
  { label: '影视综', labelEn: 'Screens', href: '/screens' },
  { label: '活动', labelEn: 'Activities', href: '/activities' },
  { label: '资料库', labelEn: 'Archives', href: '/archives' },
  { label: '霖言霖语', labelEn: 'Interviews', href: '/interviews' },
  { label: '留言板', labelEn: 'Guestbook', href: '/messages' },
  // { label: '公告', labelEn: 'Announcements', href: '/announcements' },
];
