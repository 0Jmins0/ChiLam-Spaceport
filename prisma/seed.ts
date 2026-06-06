import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─────────────────────────────────────────────
  // 清空数据（注意外键约束顺序，先清关联表）
  // ─────────────────────────────────────────────
  console.log('Clearing existing data...');

  await prisma.fanShot.deleteMany();
  await prisma.performanceMedia.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.production.deleteMany();
  await prisma.sighting.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.tag.deleteMany();

  // ─────────────────────────────────────────────
  // 1. Tags（8 个）
  // ─────────────────────────────────────────────
  console.log('Creating tags...');

  const tags = await Promise.all([
    // platform 组
    prisma.tag.create({
      data: { name: '微博', slug: 'weibo', tagGroup: 'platform' },
    }),
    prisma.tag.create({
      data: { name: '小红书', slug: 'xiaohongshu', tagGroup: 'platform' },
    }),
    prisma.tag.create({
      data: { name: '抖音', slug: 'douyin', tagGroup: 'platform' },
    }),
    prisma.tag.create({
      data: { name: 'Instagram', slug: 'instagram', tagGroup: 'platform' },
    }),
    prisma.tag.create({
      data: { name: 'Facebook', slug: 'facebook', tagGroup: 'platform' },
    }),
    // sighting_type 组
    prisma.tag.create({
      data: { name: '机场', slug: 'airport', tagGroup: 'sighting_type' },
    }),
    prisma.tag.create({
      data: { name: '片场', slug: 'filming-set', tagGroup: 'sighting_type' },
    }),
    prisma.tag.create({
      data: { name: '偶遇', slug: 'encounter', tagGroup: 'sighting_type' },
    }),
    // language 组
    prisma.tag.create({
      data: { name: '粤语', slug: 'cantonese', tagGroup: 'language' },
    }),
    prisma.tag.create({
      data: { name: '普通话', slug: 'mandarin', tagGroup: 'language' },
    }),
    // variety_region 组
    prisma.tag.create({
      data: { name: '内地', slug: 'mainland', tagGroup: 'variety_region' },
    }),
    prisma.tag.create({
      data: { name: '香港', slug: 'hongkong', tagGroup: 'variety_region' },
    }),
    prisma.tag.create({
      data: { name: '台湾', slug: 'taiwan', tagGroup: 'variety_region' },
    }),
    // variety_role 组
    prisma.tag.create({
      data: { name: '常驻', slug: 'resident', tagGroup: 'variety_role' },
    }),
    prisma.tag.create({
      data: { name: '飞行嘉宾', slug: 'guest', tagGroup: 'variety_role' },
    }),
    // performance_type 组
    prisma.tag.create({
      data: { name: '演唱会嘉宾', slug: 'concert-guest', tagGroup: 'performance_type' },
    }),
    prisma.tag.create({
      data: { name: '其他', slug: 'stage-other', tagGroup: 'performance_type' },
    }),
  ]);

  const tagMap: Record<string, string> = {};
  for (const tag of tags) {
    tagMap[tag.slug] = tag.id;
  }

  // ─────────────────────────────────────────────
  // 2. TimelineEvent（20 个）
  // ─────────────────────────────────────────────
  console.log('Creating timeline events...');

  const timelineEvents = [
    {
      date: new Date('1991-01-01'),
      title: '出道，签约华纳唱片',
      description: '张智霖正式出道，签约华纳唱片公司，开启演艺生涯。',
    },
    {
      date: new Date('1992-06-01'),
      title: '出演首部电视剧《魔域桃源》',
      description: '首次出演电视剧《魔域桃源》，开始演员生涯。',
    },
    {
      date: new Date('1994-01-01'),
      title: '出演《射雕英雄传》饰演郭靖',
      description: '在经典武侠剧《射雕英雄传》中饰演男主角郭靖，人气急升。',
    },
    {
      date: new Date('1996-03-01'),
      title: '发行专辑《现代爱情故事》',
      description: '发行经典专辑《现代爱情故事》，同名歌曲成为华语经典情歌。',
    },
    {
      date: new Date('1998-08-01'),
      title: '出演《天地豪情》',
      description: '在TVB经典剧集《天地豪情》中担任重要角色。',
    },
    {
      date: new Date('2000-10-01'),
      title: '出演《十月初五的月光》饰演文初',
      description: '在经典剧集《十月初五的月光》中饰演文初，成为最经典角色之一。',
    },
    {
      date: new Date('2003-02-14'),
      title: '与袁咏仪结婚',
      description: '与影后袁咏仪（靓靓）结婚，成为娱乐圈模范夫妻。',
    },
    {
      date: new Date('2004-11-12'),
      title: '儿子张慕童(Morton)出生',
      description: '儿子张慕童（Morton）出生，家庭美满。',
    },
    {
      date: new Date('2006-05-01'),
      title: '出演《大人物》',
      description: '出演电影《大人物》。',
    },
    {
      date: new Date('2011-09-01'),
      title: '"我是外星人"世界巡回演唱会',
      description: '举办"我是外星人"世界巡回演唱会，足迹遍布多个城市。',
    },
    {
      date: new Date('2013-06-01'),
      title: '出演《冲上云霄II》饰演Cool魔',
      description: '在TVB大型剧集《冲上云霄II》中饰演Cool魔，角色深入人心。',
    },
    {
      date: new Date('2014-12-01'),
      title: '"Crazy Hours" 演唱会',
      description: '举办"Crazy Hours"演唱会，展现音乐才华。',
    },
    {
      date: new Date('2017-07-01'),
      title: '出演《使徒行者2》',
      description: '出演电影《使徒行者2：谍影行动》，再度诠释经典卧底角色。',
    },
    {
      date: new Date('2019-06-01'),
      title: '代言尊尼获加蓝牌',
      description: '成为尊尼获加蓝牌（Johnnie Walker Blue Label）代言人。',
    },
    {
      date: new Date('2021-08-01'),
      title: '参加《披荆斩棘的哥哥》第一季',
      description: '参加芒果TV综艺《披荆斩棘的哥哥》第一季，展现多面魅力，圈粉无数。',
    },
    {
      date: new Date('2022-03-01'),
      title: '"ChiLam in Rock & 在" 演唱会',
      description: '举办"ChiLam in Rock & 在"演唱会，摇滚风格令人惊艳。',
    },
    {
      date: new Date('2022-07-01'),
      title: '出演《家族荣耀》',
      description: '出演TVB与优酷合拍剧《家族荣耀》，饰演重要角色。',
    },
    {
      date: new Date('2024-03-01'),
      title: '出演新作品',
      description: '2024年出演新影视作品，持续活跃在演艺圈。',
    },
    {
      date: new Date('2025-06-01'),
      title: '参加《披荆斩棘2025》',
      description: '再次参加《披荆斩棘》系列综艺节目。',
    },
    {
      date: new Date('2026-01-01'),
      title: 'Chilam Is Here 网站上线',
      description: '张智霖全面资讯网站"Chilam Is Here"正式上线，为粉丝提供一站式资讯。',
    },
  ];

  for (let i = 0; i < timelineEvents.length; i++) {
    await prisma.timelineEvent.create({
      data: {
        ...timelineEvents[i],
        isVisible: true,
        sortOrder: i,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 3. SocialPost（30 个）
  // ─────────────────────────────────────────────
  console.log('Creating social posts...');

  interface SocialPostInput {
    platform: string;
    tagSlug: string;
    originalUrl: string;
    originalId: string;
    title: string;
    summary: string;
    thumbnailUrl: string;
    publishedAt: Date;
    importMethod: 'LINK_PARSE' | 'MANUAL';
  }

  const socialPosts: SocialPostInput[] = [
    // 微博 15 条
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post001',
      originalId: 'wb-001',
      title: '今日健身打卡',
      summary: '坚持健身第100天，感觉状态越来越好了！',
      thumbnailUrl: 'https://picsum.photos/seed/wb001/400/500',
      publishedAt: new Date('2024-01-15'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post002',
      originalId: 'wb-002',
      title: '新剧开机啦',
      summary: '新项目正式开机，期待和大家见面！',
      thumbnailUrl: 'https://picsum.photos/seed/wb002/400/500',
      publishedAt: new Date('2024-03-20'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post003',
      originalId: 'wb-003',
      title: '和靓靓的周末',
      summary: '难得的周末，一家人出去走走。',
      thumbnailUrl: 'https://picsum.photos/seed/wb003/400/500',
      publishedAt: new Date('2024-05-10'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post004',
      originalId: 'wb-004',
      title: '演唱会彩排中',
      summary: '演唱会彩排进行中，这次的舞台效果超赞！',
      thumbnailUrl: 'https://picsum.photos/seed/wb004/400/500',
      publishedAt: new Date('2024-07-05'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post005',
      originalId: 'wb-005',
      title: '感谢粉丝的支持',
      summary: '感谢大家一直以来的陪伴和支持，我会继续努力！',
      thumbnailUrl: 'https://picsum.photos/seed/wb005/400/500',
      publishedAt: new Date('2024-09-01'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post006',
      originalId: 'wb-006',
      title: '新年快乐',
      summary: '祝大家新年快乐，2025一切顺利！',
      thumbnailUrl: 'https://picsum.photos/seed/wb006/400/500',
      publishedAt: new Date('2025-01-01'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post007',
      originalId: 'wb-007',
      title: '健身房偶遇',
      summary: '今天在健身房遇到老朋友，一起练了一下午。',
      thumbnailUrl: 'https://picsum.photos/seed/wb007/400/500',
      publishedAt: new Date('2025-02-14'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post008',
      originalId: 'wb-008',
      title: '拍摄花絮分享',
      summary: '分享一些拍摄现场的花絮照片，工作中的快乐。',
      thumbnailUrl: 'https://picsum.photos/seed/wb008/400/500',
      publishedAt: new Date('2025-04-10'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post009',
      originalId: 'wb-009',
      title: '旅行中的风景',
      summary: '去了一趟日本，风景真的太美了。',
      thumbnailUrl: 'https://picsum.photos/seed/wb009/400/500',
      publishedAt: new Date('2025-06-20'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post010',
      originalId: 'wb-010',
      title: '新歌录制完成',
      summary: '新歌终于录制完成了，敬请期待！',
      thumbnailUrl: 'https://picsum.photos/seed/wb010/400/500',
      publishedAt: new Date('2025-08-15'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post011',
      originalId: 'wb-011',
      title: '广告拍摄花絮',
      summary: '今天拍广告，造型师把我弄得很帅（自己说的）。',
      thumbnailUrl: 'https://picsum.photos/seed/wb011/400/500',
      publishedAt: new Date('2025-10-01'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post012',
      originalId: 'wb-012',
      title: '圣诞快乐',
      summary: '圣诞快乐！希望每个人都能收到想要的礼物。',
      thumbnailUrl: 'https://picsum.photos/seed/wb012/400/500',
      publishedAt: new Date('2025-12-25'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post013',
      originalId: 'wb-013',
      title: '2026开工大吉',
      summary: '新的一年，开工大吉！今年有很多新计划。',
      thumbnailUrl: 'https://picsum.photos/seed/wb013/400/500',
      publishedAt: new Date('2026-01-05'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post014',
      originalId: 'wb-014',
      title: '和Morton的日常',
      summary: '儿子越来越高了，快要比我高了。',
      thumbnailUrl: 'https://picsum.photos/seed/wb014/400/500',
      publishedAt: new Date('2026-03-15'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung/post015',
      originalId: 'wb-015',
      title: '综艺录制中',
      summary: '录制现场太欢乐了，笑到肚子疼。',
      thumbnailUrl: 'https://picsum.photos/seed/wb015/400/500',
      publishedAt: new Date('2026-05-20'),
      importMethod: 'MANUAL',
    },
    // Instagram 5 条
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/p/chilam_ig001',
      originalId: 'ig-001',
      title: 'Gym day',
      summary: 'Another day, another workout. Stay strong!',
      thumbnailUrl: 'https://picsum.photos/seed/ig001/400/500',
      publishedAt: new Date('2024-02-20'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/p/chilam_ig002',
      originalId: 'ig-002',
      title: 'Family time',
      summary: 'Quality time with the family. Blessed.',
      thumbnailUrl: 'https://picsum.photos/seed/ig002/400/500',
      publishedAt: new Date('2024-08-10'),
      importMethod: 'MANUAL',
    },
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/p/chilam_ig003',
      originalId: 'ig-003',
      title: 'Behind the scenes',
      summary: 'Sneak peek from the set!',
      thumbnailUrl: 'https://picsum.photos/seed/ig003/400/500',
      publishedAt: new Date('2025-01-15'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/p/chilam_ig004',
      originalId: 'ig-004',
      title: 'Concert vibes',
      summary: 'What an incredible night! Thank you all!',
      thumbnailUrl: 'https://picsum.photos/seed/ig004/400/500',
      publishedAt: new Date('2025-07-22'),
      importMethod: 'MANUAL',
    },
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/p/chilam_ig005',
      originalId: 'ig-005',
      title: 'Travel diaries',
      summary: 'Exploring new places, making new memories.',
      thumbnailUrl: 'https://picsum.photos/seed/ig005/400/500',
      publishedAt: new Date('2026-02-10'),
      importMethod: 'LINK_PARSE',
    },
    // 小红书 4 条
    {
      platform: '小红书',
      tagSlug: 'xiaohongshu',
      originalUrl: 'https://www.xiaohongshu.com/explore/chilam_xhs001',
      originalId: 'xhs-001',
      title: '穿搭分享 | 秋冬男士穿搭',
      summary: '最近很喜欢这种简约风格，分享给大家。',
      thumbnailUrl: 'https://picsum.photos/seed/xhs001/400/500',
      publishedAt: new Date('2024-11-05'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '小红书',
      tagSlug: 'xiaohongshu',
      originalUrl: 'https://www.xiaohongshu.com/explore/chilam_xhs002',
      originalId: 'xhs-002',
      title: '美食探店 | 香港必吃',
      summary: '推荐几家我常去的餐厅，味道真的绝了！',
      thumbnailUrl: 'https://picsum.photos/seed/xhs002/400/500',
      publishedAt: new Date('2025-03-18'),
      importMethod: 'MANUAL',
    },
    {
      platform: '小红书',
      tagSlug: 'xiaohongshu',
      originalUrl: 'https://www.xiaohongshu.com/explore/chilam_xhs003',
      originalId: 'xhs-003',
      title: '健身笔记 | 保持身材的秘诀',
      summary: '分享我的健身心得，坚持最重要。',
      thumbnailUrl: 'https://picsum.photos/seed/xhs003/400/500',
      publishedAt: new Date('2025-09-10'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '小红书',
      tagSlug: 'xiaohongshu',
      originalUrl: 'https://www.xiaohongshu.com/explore/chilam_xhs004',
      originalId: 'xhs-004',
      title: '旅行日记 | 京都之行',
      summary: '京都的春天太美了，樱花满开。',
      thumbnailUrl: 'https://picsum.photos/seed/xhs004/400/500',
      publishedAt: new Date('2026-04-01'),
      importMethod: 'MANUAL',
    },
    // 抖音 4 条
    {
      platform: '抖音',
      tagSlug: 'douyin',
      originalUrl: 'https://www.douyin.com/video/chilam_dy001',
      originalId: 'dy-001',
      title: '挑战最新热门舞蹈',
      summary: '大家说我跳得怎么样？',
      thumbnailUrl: 'https://picsum.photos/seed/dy001/400/500',
      publishedAt: new Date('2024-06-15'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '抖音',
      tagSlug: 'douyin',
      originalUrl: 'https://www.douyin.com/video/chilam_dy002',
      originalId: 'dy-002',
      title: '幕后花絮大公开',
      summary: '拍摄幕后的搞笑瞬间，差点笑场。',
      thumbnailUrl: 'https://picsum.photos/seed/dy002/400/500',
      publishedAt: new Date('2025-02-28'),
      importMethod: 'MANUAL',
    },
    {
      platform: '抖音',
      tagSlug: 'douyin',
      originalUrl: 'https://www.douyin.com/video/chilam_dy003',
      originalId: 'dy-003',
      title: '清唱经典歌曲',
      summary: '下雨天，随便唱几句。',
      thumbnailUrl: 'https://picsum.photos/seed/dy003/400/500',
      publishedAt: new Date('2025-11-11'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: '抖音',
      tagSlug: 'douyin',
      originalUrl: 'https://www.douyin.com/video/chilam_dy004',
      originalId: 'dy-004',
      title: '日常Vlog | 一天的行程',
      summary: '跟拍我忙碌的一天，从早到晚。',
      thumbnailUrl: 'https://picsum.photos/seed/dy004/400/500',
      publishedAt: new Date('2026-05-01'),
      importMethod: 'MANUAL',
    },
    // Facebook 2 条
    {
      platform: 'Facebook',
      tagSlug: 'facebook',
      originalUrl: 'https://www.facebook.com/chilamcheung/posts/fb001',
      originalId: 'fb-001',
      title: 'Thanks for the love',
      summary: 'Thank you everyone for the birthday wishes! Feeling so grateful.',
      thumbnailUrl: 'https://picsum.photos/seed/fb001/400/500',
      publishedAt: new Date('2024-11-27'),
      importMethod: 'LINK_PARSE',
    },
    {
      platform: 'Facebook',
      tagSlug: 'facebook',
      originalUrl: 'https://www.facebook.com/chilamcheung/posts/fb002',
      originalId: 'fb-002',
      title: 'New project announcement',
      summary: 'Excited to share some big news coming soon! Stay tuned.',
      thumbnailUrl: 'https://picsum.photos/seed/fb002/400/500',
      publishedAt: new Date('2025-05-15'),
      importMethod: 'MANUAL',
    },
  ];

  for (const post of socialPosts) {
    await prisma.socialPost.create({
      data: {
        platform: post.platform,
        originalUrl: post.originalUrl,
        originalId: post.originalId,
        title: post.title,
        summary: post.summary,
        thumbnailUrl: post.thumbnailUrl,
        publishedAt: post.publishedAt,
        importMethod: post.importMethod,
        tags: { connect: [{ id: tagMap[post.tagSlug] }] },
      },
    });
  }

  // ─────────────────────────────────────────────
  // 4. NewsArticle（15 个）
  // ─────────────────────────────────────────────
  console.log('Creating news articles...');

  const newsArticles = [
    {
      slug: 'news-2024-new-drama',
      originalUrl: 'https://orientaldaily.on.cc/news/2024/chilam-new-drama',
      title: '张智霖新剧开拍 搭档人气花旦',
      summary: '张智霖确认参演新剧，将与人气花旦搭档出演。',
      source: '东方日报',
      thumbnailUrl: 'https://picsum.photos/seed/news001/400/500',
      publishedAt: new Date('2024-02-15'),
    },
    {
      slug: 'news-2024-concert-announcement',
      originalUrl: 'https://www.mingpao.com/2024/chilam-concert',
      title: '张智霖宣布2024巡回演唱会 首站香港红馆',
      summary: '张智霖宣布举办新一轮巡回演唱会，首站将在香港红磡体育馆举行。',
      source: '明报',
      thumbnailUrl: 'https://picsum.photos/seed/news002/400/500',
      publishedAt: new Date('2024-04-01'),
    },
    {
      slug: 'news-2024-family-trip',
      originalUrl: 'https://www.scmp.com/2024/chilam-family',
      title: 'Chilam Cheung spotted on family vacation in Maldives',
      summary: '张智霖一家三口被拍到在马尔代夫度假，一家人其乐融融。',
      source: '南华早报',
      thumbnailUrl: 'https://picsum.photos/seed/news003/400/500',
      publishedAt: new Date('2024-07-20'),
    },
    {
      slug: 'news-2024-endorsement',
      originalUrl: 'https://www.hk01.com/2024/chilam-brand',
      title: '张智霖获国际品牌邀请 成为大中华区代言人',
      summary: '张智霖获得国际知名品牌邀请，正式成为大中华区品牌代言人。',
      source: '香港01',
      thumbnailUrl: 'https://picsum.photos/seed/news004/400/500',
      publishedAt: new Date('2024-09-10'),
    },
    {
      slug: 'news-2024-awards',
      originalUrl: 'https://std.stheadline.com/2024/chilam-award',
      title: '张智霖获颁年度最受欢迎男艺人',
      summary: '在年度颁奖典礼上，张智霖凭借出色表现获得最受欢迎男艺人奖。',
      source: '星岛日报',
      thumbnailUrl: 'https://picsum.photos/seed/news005/400/500',
      publishedAt: new Date('2024-12-20'),
    },
    {
      slug: 'news-2025-variety-show',
      originalUrl: 'https://orientaldaily.on.cc/news/2025/chilam-variety',
      title: '张智霖加盟内地综艺 展现幽默一面',
      summary: '张智霖确认加盟内地热门综艺节目，将在节目中展现不一样的自己。',
      source: '东方日报',
      thumbnailUrl: 'https://picsum.photos/seed/news006/400/500',
      publishedAt: new Date('2025-01-20'),
    },
    {
      slug: 'news-2025-movie-premiere',
      originalUrl: 'https://www.mingpao.com/2025/chilam-movie',
      title: '张智霖新电影首映礼 与袁咏仪甜蜜同行',
      summary: '张智霖出席新电影首映礼，袁咏仪到场支持，二人甜蜜互动。',
      source: '明报',
      thumbnailUrl: 'https://picsum.photos/seed/news007/400/500',
      publishedAt: new Date('2025-03-08'),
    },
    {
      slug: 'news-2025-fitness',
      originalUrl: 'https://www.hk01.com/2025/chilam-fitness',
      title: '张智霖分享健身秘诀 55岁仍保持完美身材',
      summary: '张智霖接受专访，分享其多年坚持的健身习惯和饮食原则。',
      source: '香港01',
      thumbnailUrl: 'https://picsum.photos/seed/news008/400/500',
      publishedAt: new Date('2025-05-15'),
    },
    {
      slug: 'news-2025-charity',
      originalUrl: 'https://www.scmp.com/2025/chilam-charity',
      title: '张智霖出席慈善活动 呼吁关注儿童教育',
      summary: '张智霖作为公益大使出席慈善晚会，呼吁社会关注贫困儿童教育问题。',
      source: '南华早报',
      thumbnailUrl: 'https://picsum.photos/seed/news009/400/500',
      publishedAt: new Date('2025-08-22'),
    },
    {
      slug: 'news-2025-music-comeback',
      originalUrl: 'https://std.stheadline.com/2025/chilam-music',
      title: '张智霖宣布推出新专辑 时隔多年重返乐坛',
      summary: '张智霖宣布将推出个人新专辑，时隔多年再次以歌手身份回归。',
      source: '星岛日报',
      thumbnailUrl: 'https://picsum.photos/seed/news010/400/500',
      publishedAt: new Date('2025-10-30'),
    },
    {
      slug: 'news-2026-new-year',
      originalUrl: 'https://orientaldaily.on.cc/news/2026/chilam-newyear',
      title: '张智霖2026新年寄语：珍惜每一天',
      summary: '张智霖在社交媒体发布新年寄语，回顾过去一年的成长与感悟。',
      source: '东方日报',
      thumbnailUrl: 'https://picsum.photos/seed/news011/400/500',
      publishedAt: new Date('2026-01-02'),
    },
    {
      slug: 'news-2026-drama-hit',
      originalUrl: 'https://www.mingpao.com/2026/chilam-drama-hit',
      title: '张智霖主演新剧收视爆红 成年度热播剧',
      summary: '张智霖主演的新剧首播收视率创新高，成为2026年开年最热播的剧集。',
      source: '明报',
      thumbnailUrl: 'https://picsum.photos/seed/news012/400/500',
      publishedAt: new Date('2026-02-20'),
    },
    {
      slug: 'news-2026-concert-tour',
      originalUrl: 'https://www.hk01.com/2026/chilam-tour',
      title: '张智霖世界巡回演唱会加场 粉丝热情高涨',
      summary: '由于粉丝反响热烈，张智霖世界巡回演唱会宣布加开多场。',
      source: '香港01',
      thumbnailUrl: 'https://picsum.photos/seed/news013/400/500',
      publishedAt: new Date('2026-04-10'),
    },
    {
      slug: 'news-2026-interview-family',
      originalUrl: 'https://www.scmp.com/2026/chilam-family-interview',
      title: '张智霖专访：谈家庭与事业的平衡',
      summary: '张智霖接受深度专访，畅谈如何在繁忙的事业中兼顾家庭生活。',
      source: '南华早报',
      thumbnailUrl: 'https://picsum.photos/seed/news014/400/500',
      publishedAt: new Date('2026-05-18'),
    },
    {
      slug: 'news-2026-website-launch',
      originalUrl: 'https://std.stheadline.com/2026/chilam-website',
      title: '张智霖粉丝网站"Chilam Is Here"正式上线',
      summary: '张智霖全面资讯网站"Chilam Is Here"正式上线，整合各平台资讯。',
      source: '星岛日报',
      thumbnailUrl: 'https://picsum.photos/seed/news015/400/500',
      publishedAt: new Date('2026-06-01'),
    },
  ];

  for (const article of newsArticles) {
    await prisma.newsArticle.create({ data: article });
  }

  // ─────────────────────────────────────────────
  // 5. Sighting（10 个）
  // ─────────────────────────────────────────────
  console.log('Creating sightings...');

  interface SightingInput {
    slug: string;
    title: string;
    summary: string;
    thumbnailUrl: string;
    sightedAt: Date;
    authorName: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    tagSlug: string;
  }

  const sightings: SightingInput[] = [
    {
      slug: 'sighting-2024-hk-airport',
      title: '香港国际机场偶遇张智霖',
      summary: '在香港国际机场出发大堂偶遇Chilam，戴着墨镜很低调。',
      thumbnailUrl: 'https://picsum.photos/seed/sight001/400/500',
      sightedAt: new Date('2024-03-10'),
      authorName: '机场偶遇',
      status: 'APPROVED',
      tagSlug: 'airport',
    },
    {
      slug: 'sighting-2024-tvb-studio',
      title: 'TVB电视城片场拍摄中',
      summary: '路过TVB电视城看到张智霖在拍新剧，穿着西装很帅。',
      thumbnailUrl: 'https://picsum.photos/seed/sight002/400/500',
      sightedAt: new Date('2024-05-22'),
      authorName: '路人甲',
      status: 'APPROVED',
      tagSlug: 'filming-set',
    },
    {
      slug: 'sighting-2024-central',
      title: '中环逛街偶遇',
      summary: '在中环IFC偶遇张智霖和袁咏仪一起逛街购物。',
      thumbnailUrl: 'https://picsum.photos/seed/sight003/400/500',
      sightedAt: new Date('2024-08-15'),
      authorName: '霖霖粉丝',
      status: 'APPROVED',
      tagSlug: 'encounter',
    },
    {
      slug: 'sighting-2024-beijing-airport',
      title: '北京首都机场出发',
      summary: '在北京首都机场偶遇张智霖，应该是去参加活动。',
      thumbnailUrl: 'https://picsum.photos/seed/sight004/400/500',
      sightedAt: new Date('2024-10-08'),
      authorName: '北京粉丝',
      status: 'APPROVED',
      tagSlug: 'airport',
    },
    {
      slug: 'sighting-2025-shanghai-set',
      title: '上海横店片场偶遇',
      summary: '在横店影视城看到张智霖在拍戏，剧组很大阵仗。',
      thumbnailUrl: 'https://picsum.photos/seed/sight005/400/500',
      sightedAt: new Date('2025-01-20'),
      authorName: '影视城游客',
      status: 'APPROVED',
      tagSlug: 'filming-set',
    },
    {
      slug: 'sighting-2025-gym',
      title: '健身房偶遇Chilam',
      summary: '在健身房偶遇张智霖做重训，身材真的太好了。',
      thumbnailUrl: 'https://picsum.photos/seed/sight006/400/500',
      sightedAt: new Date('2025-04-12'),
      authorName: '健身同好',
      status: 'APPROVED',
      tagSlug: 'encounter',
    },
    {
      slug: 'sighting-2025-tokyo-airport',
      title: '东京成田机场入境',
      summary: '在成田机场看到张智霖，可能是去日本度假。',
      thumbnailUrl: 'https://picsum.photos/seed/sight007/400/500',
      sightedAt: new Date('2025-07-05'),
      authorName: '日本霖迷',
      status: 'APPROVED',
      tagSlug: 'airport',
    },
    {
      slug: 'sighting-2025-restaurant',
      title: '餐厅偶遇一家三口',
      summary: '在尖沙咀某餐厅偶遇张智霖、袁咏仪和Morton一家三口用餐。',
      thumbnailUrl: 'https://picsum.photos/seed/sight008/400/500',
      sightedAt: new Date('2025-11-20'),
      authorName: '霖霖粉丝',
      status: 'APPROVED',
      tagSlug: 'encounter',
    },
    {
      slug: 'sighting-2026-guangzhou-set',
      title: '广州拍摄现场疑似张智霖',
      summary: '疑似在广州某拍摄现场看到张智霖，但不太确定。',
      thumbnailUrl: 'https://picsum.photos/seed/sight009/400/500',
      sightedAt: new Date('2026-02-15'),
      authorName: '广州路人',
      status: 'PENDING',
      tagSlug: 'filming-set',
    },
    {
      slug: 'sighting-2026-fake',
      title: '某商场疑似张智霖',
      summary: '后来证实不是本人，是长得像的路人。',
      thumbnailUrl: 'https://picsum.photos/seed/sight010/400/500',
      sightedAt: new Date('2026-03-01'),
      authorName: '认错了',
      status: 'REJECTED',
      tagSlug: 'encounter',
    },
  ];

  for (const sighting of sightings) {
    await prisma.sighting.create({
      data: {
        slug: sighting.slug,
        title: sighting.title,
        summary: sighting.summary,
        thumbnailUrl: sighting.thumbnailUrl,
        sightedAt: sighting.sightedAt,
        authorName: sighting.authorName,
        status: sighting.status,
        originalUrl: `https://example.com/sighting/${sighting.slug}`,
        tags: { connect: [{ id: tagMap[sighting.tagSlug] }] },
      },
    });
  }

  // ─────────────────────────────────────────────
  // 6. Production（38 条影视综数据）
  // ─────────────────────────────────────────────
  console.log('Creating productions...');

  // 电视剧 15 部
  const tvSeries = [
    {
      title: '冲天小子',
      slug: 'chongtian-xiaozi-1992',
      year: 1992,
      role: '张培俊',
      synopsis: '出道作品',
      language: '粤语',
    },
    {
      title: '射雕英雄传',
      slug: 'she-diao-1994',
      year: 1994,
      role: '郭靖',
      synopsis:
        '在经典武侠剧中饰演男主角郭靖，与朱茵合演，演唱主题曲《绝世绝招》，人气急升。',
      language: '粤语',
    },
    {
      title: '天地男儿',
      slug: 'tiandi-naner-1996',
      year: 1996,
      role: '罗子健',
      synopsis: '演唱主题曲。',
      language: '粤语',
    },
    {
      title: '十月初五的月光',
      slug: 'october-moonlight-2000',
      year: 2000,
      role: '文初',
      synopsis:
        '经典代表作，最高收视46点，获亚太电视大奖最佳连续剧。',
      language: '粤语',
    },
    {
      title: '谈判专家',
      slug: 'negotiator-2002',
      year: 2002,
      role: '杨光',
      synopsis: '获"我最喜爱的电视角色"奖。',
      language: '粤语',
    },
    {
      title: '冲上云霄II',
      slug: 'triumph-skies-2-2013',
      year: 2013,
      role: '顾夏阳 (Cool魔)',
      synopsis: '男主角，航空题材，人气极高。',
      language: '粤语',
    },
    {
      title: '逆水寒',
      slug: 'ni-shui-han-2004',
      year: 2004,
      role: '戚少商',
      synopsis: '古装武侠。',
      language: '普通话',
    },
    {
      title: '飞刀又见飞刀',
      slug: 'feidao-2003',
      year: 2003,
      role: '李坏',
      synopsis: '男主角，古龙小说改编。',
      language: '普通话',
    },
    {
      title: '陆小凤传奇',
      slug: 'lu-xiaofeng-2007',
      year: 2007,
      role: '陆小凤',
      synopsis:
        '系列电视电影，获第7届数字电影百合奖最佳男演员。',
      language: '普通话',
    },
    {
      title: '蚀日风暴',
      slug: 'shadow-of-justice-2018',
      year: 2018,
      role: '凌风',
      synopsis: '犯罪动作，与薛凯琪合演。',
      language: '粤语',
    },
    {
      title: '家族荣耀',
      slug: 'family-glory-2022',
      year: 2022,
      role: '马展鸿',
      synopsis: '香港家族题材。',
      language: '粤语',
    },
    {
      title: '赴山海',
      slug: 'fu-shanhai-2025',
      year: 2025,
      role: '燕狂徒',
      synopsis: '最新作品。',
      language: '普通话',
    },
    {
      title: '白发魔女',
      slug: 'white-hair-1999',
      year: 1999,
      role: '卓一航',
      synopsis: '古装武侠。',
      language: '普通话',
    },
    {
      title: '西关大少',
      slug: 'xiguan-dashao-2003',
      year: 2003,
      role: '周天赐',
      synopsis: '演唱主题曲。',
      language: '粤语',
    },
    {
      title: '鱼跃在花见',
      slug: 'yueyue-2011',
      year: 2011,
      role: '鱼至嬴',
      synopsis: '大结局收视38点。',
      language: '粤语',
    },
  ];

  for (const tv of tvSeries) {
    const langTag = tv.language === '粤语' ? 'cantonese' : 'mandarin';
    await prisma.production.create({
      data: {
        type: 'TV_SERIES',
        slug: tv.slug,
        title: tv.title,
        year: tv.year,
        role: tv.role,
        synopsis: tv.synopsis,
        language: tv.language,
        tags: { connect: [{ id: tagMap[langTag] }] },
      },
    });
  }

  // 电影 15 部
  const movies = [
    {
      title: '一代宗师',
      slug: 'grandmaster-2013',
      year: 2013,
      role: '伶人/宫二未婚夫',
      synopsis: '王家卫执导。',
      language: '粤语',
    },
    {
      title: 'S风暴',
      slug: 's-storm-2016',
      year: 2016,
      role: '刘保强',
      synopsis: '反贪风暴系列，重案组高级督察。',
      language: '粤语',
    },
    {
      title: 'L风暴',
      slug: 'l-storm-2018',
      year: 2018,
      role: '刘保强',
      synopsis: '反贪风暴系列。',
      language: '粤语',
    },
    {
      title: 'P风暴',
      slug: 'p-storm-2019',
      year: 2019,
      role: '刘保强',
      synopsis: '反贪风暴系列。',
      language: '粤语',
    },
    {
      title: 'G风暴',
      slug: 'g-storm-2021',
      year: 2021,
      role: '刘保强/廖保强',
      synopsis: '反贪风暴系列最终章。',
      language: '粤语',
    },
    {
      title: '冲上云霄',
      slug: 'triumph-skies-movie-2015',
      year: 2015,
      role: '顾夏阳 (Jayden)',
      synopsis: '全国票房破亿。',
      language: '粤语',
    },
    {
      title: '十月初五的月光',
      slug: 'october-moonlight-movie-2015',
      year: 2015,
      role: '文初 (初哥哥)',
      synopsis: '获"真情演绎"及"浪漫爱情"奖。',
      language: '粤语',
    },
    {
      title: '误判',
      slug: 'misjudge-2024',
      year: 2024,
      role: '欧柏文',
      synopsis: '甄子丹执导。',
      language: '粤语',
    },
    {
      title: '暗杀风暴',
      slug: 'assassination-storm-2023',
      year: 2023,
      role: '罗飞',
      synopsis: '邱礼涛执导，与古天乐、吴镇宇合演。',
      language: '粤语',
    },
    {
      title: '扫黑行动',
      slug: 'anti-crime-2022',
      year: 2022,
      role: '赵羡鱼',
      synopsis: '林德禄执导。',
      language: '粤语',
    },
    {
      title: '天生爱情狂',
      slug: 'natural-born-lover-2012',
      year: 2012,
      role: '张泰林',
      synopsis: '与刘心悠合演。',
      language: '粤语',
    },
    {
      title: 'G4特工',
      slug: 'g4-agent-1997',
      year: 1997,
      role: '陈羿',
      synopsis: '动作片。',
      language: '粤语',
    },
    {
      title: '飞虎雄心2',
      slug: 'flying-tiger-2-1996',
      year: 1996,
      role: '何志林 (Coolman)',
      synopsis: '动作片。',
      language: '粤语',
    },
    {
      title: '边城浪子',
      slug: 'border-town-1993',
      year: 1993,
      role: '路小佳',
      synopsis: '古龙小说改编。',
      language: '粤语',
    },
    {
      title: '栋笃特工',
      slug: 'agent-mr-chan-2018b',
      year: 2018,
      role: '张智霖 (本人)',
      synopsis: '喜剧。',
      language: '粤语',
    },
  ];

  for (const movie of movies) {
    const langTag = movie.language === '粤语' ? 'cantonese' : 'mandarin';
    await prisma.production.create({
      data: {
        type: 'MOVIE',
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        role: movie.role,
        synopsis: movie.synopsis,
        language: movie.language,
        tags: { connect: [{ id: tagMap[langTag] }] },
      },
    });
  }

  // 综艺 8 档
  const varietyShows = [
    {
      title: '披荆斩棘的哥哥',
      slug: 'pi-jing-2021',
      year: 2021,
      role: null,
      synopsis: '芒果TV，"大湾区"组合。',
      varietyRegion: '内地',
      varietyRole: '常驻',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'resident',
    },
    {
      title: '大湾仔的夜 第一季',
      slug: 'dawanzai-s1-2022',
      year: 2022,
      role: null,
      synopsis: '芒果TV/湖南卫视，合伙人。',
      varietyRegion: '内地',
      varietyRole: '常驻',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'resident',
    },
    {
      title: '大湾仔的夜 第二季',
      slug: 'dawanzai-s2-2023',
      year: 2023,
      role: null,
      synopsis: '芒果TV，合伙人。',
      varietyRegion: '内地',
      varietyRole: '常驻',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'resident',
    },
    {
      title: '披荆斩棘 2025',
      slug: 'pi-jing-2025',
      year: 2025,
      role: null,
      synopsis: '芒果TV，"大湾仔"战队。',
      varietyRegion: '内地',
      varietyRole: '常驻',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'resident',
    },
    {
      title: '妻子的浪漫旅行 第二季',
      slug: 'wife-travel-s2-2019',
      year: 2019,
      role: null,
      synopsis: '芒果TV，与袁咏仪参加。',
      varietyRegion: '内地',
      varietyRole: '常驻',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'resident',
    },
    {
      title: '一路上有你',
      slug: 'with-you-2015',
      year: 2015,
      role: null,
      synopsis: '夫妻档真人秀（与袁咏仪）。',
      varietyRegion: '内地',
      varietyRole: '常驻',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'resident',
    },
    {
      title: '会画少年的天空',
      slug: 'painting-youth-2022',
      year: 2022,
      role: null,
      synopsis: '湖南卫视。',
      varietyRegion: '内地',
      varietyRole: '飞行嘉宾',
      language: '普通话',
      regionSlug: 'mainland',
      roleSlug: 'guest',
    },
    {
      title: '奖门人系列',
      slug: 'super-trio-tvb',
      year: 2000,
      role: null,
      synopsis: 'TVB经典游戏综艺，多次参加。',
      varietyRegion: '香港',
      varietyRole: '飞行嘉宾',
      language: '粤语',
      regionSlug: 'hongkong',
      roleSlug: 'guest',
    },
  ];

  for (const show of varietyShows) {
    const langTag = show.language === '粤语' ? 'cantonese' : 'mandarin';
    await prisma.production.create({
      data: {
        type: 'VARIETY_SHOW',
        slug: show.slug,
        title: show.title,
        year: show.year,
        role: show.role,
        synopsis: show.synopsis,
        language: show.language,
        varietyRegion: show.varietyRegion,
        varietyRole: show.varietyRole,
        tags: {
          connect: [
            { id: tagMap[langTag] },
            { id: tagMap[show.regionSlug] },
            { id: tagMap[show.roleSlug] },
          ],
        },
      },
    });
  }

  // ─────────────────────────────────────────────
  // 7. Performance（11 条演出数据）
  // ─────────────────────────────────────────────
  console.log('Creating performances...');

  // 演唱会 4 场
  const concerts = [
    {
      title: '我是外星人演唱会',
      titleEn: 'I Am An Alien Concert',
      slug: 'alien-concert-2011',
      year: 2011,
      venue: '香港红磡体育馆',
      city: '香港',
      series: '我是外星人',
      setlist: ['现代爱情故事', '祝君好', '我一个人住', '你太善良', '相爱无梦', '岁月如歌', '片片枫叶情', '逗我开心吧'],
    },
    {
      title: 'ChiLam Crazy Hours Live 2014',
      titleEn: 'Crazy Hours Live',
      slug: 'crazy-hours-2014',
      year: 2014,
      venue: '香港红磡体育馆',
      city: '香港',
      series: 'Crazy Hours',
      setlist: ['相爱无梦', '你太善良', '岁月如歌', '现代爱情故事', '祝君好', '逗我开心吧', '天梯', '我一个人住'],
    },
    {
      title: 'ChiLam In Rock Miniconcert',
      titleEn: 'ChiLam In Rock Miniconcert',
      slug: 'in-rock-miniconcert-2016',
      year: 2016,
      venue: 'Music Zone@E-Max',
      city: '香港',
      series: 'Miniconcert',
      setlist: ['现代爱情故事', '你太善良', '岁月如歌', '天梯', '祝君好'],
    },
    {
      title: '在 张智霖演唱会',
      titleEn: 'Here Concert',
      slug: 'here-concert-2022',
      year: 2022,
      venue: '香港红磡体育馆',
      city: '香港',
      series: '在',
      setlist: ['现代爱情故事', '祝君好', '我一个人住', '你太善良', '相爱无梦', '岁月如歌', '天梯', '片片枫叶情', '逗我开心吧', '我们的故事'],
    },
  ];

  for (const concert of concerts) {
    await prisma.performance.create({
      data: {
        type: 'CONCERT',
        slug: concert.slug,
        title: concert.title,
        titleEn: concert.titleEn,
        year: concert.year,
        venue: concert.venue,
        city: concert.city,
        series: concert.series,
        setlist: concert.setlist,
      },
    });
  }

  // 舞台 5 场
  interface StageInput {
    title: string;
    slug: string;
    year: number;
    venue: string;
    city: string;
    tagSlug: string;
  }

  const stages: StageInput[] = [
    {
      title: '劲歌金曲颁奖典礼',
      slug: 'jsga-2010',
      year: 2010,
      venue: '香港红磡体育馆',
      city: '香港',
      tagSlug: 'stage-other',
    },
    {
      title: '叱咤乐坛流行榜颁奖典礼',
      slug: 'usma-2012',
      year: 2012,
      venue: '香港会议展览中心',
      city: '香港',
      tagSlug: 'stage-other',
    },
    {
      title: '张学友演唱会嘉宾',
      slug: 'jacky-cheung-guest-2015',
      year: 2015,
      venue: '香港红磡体育馆',
      city: '香港',
      tagSlug: 'concert-guest',
    },
    {
      title: '容祖儿演唱会嘉宾',
      slug: 'joey-yung-guest-2018',
      year: 2018,
      venue: '香港红磡体育馆',
      city: '香港',
      tagSlug: 'concert-guest',
    },
    {
      title: '披荆斩棘总决赛舞台',
      slug: 'call-me-by-fire-finale-2021',
      year: 2021,
      venue: '芒果TV演播厅',
      city: '长沙',
      tagSlug: 'stage-other',
    },
  ];

  for (const stage of stages) {
    await prisma.performance.create({
      data: {
        type: 'STAGE',
        slug: stage.slug,
        title: stage.title,
        year: stage.year,
        venue: stage.venue,
        city: stage.city,
        tags: { connect: [{ id: tagMap[stage.tagSlug] }] },
      },
    });
  }

  // 音乐剧 2 场
  const musicals = [
    {
      title: 'I Love You Because',
      titleEn: 'I Love You Because',
      slug: 'i-love-you-because-2009',
      year: 2009,
      venue: '香港演艺学院',
      city: '香港',
    },
    {
      title: '天赐良缘',
      titleEn: 'Heaven Sent',
      slug: 'heaven-sent-2012',
      year: 2012,
      venue: '理工大学赛马会综艺馆',
      city: '香港',
    },
  ];

  for (const musical of musicals) {
    await prisma.performance.create({
      data: {
        type: 'MUSICAL',
        slug: musical.slug,
        title: musical.title,
        titleEn: musical.titleEn,
        year: musical.year,
        venue: musical.venue,
        city: musical.city,
      },
    });
  }

  console.log('Seeding completed successfully!');
  console.log('  - 17 tags');
  console.log('  - 20 timeline events');
  console.log('  - 30 social posts');
  console.log('  - 15 news articles');
  console.log('  - 10 sightings');
  console.log('  - 38 productions (15 TV + 15 movies + 8 variety)');
  console.log('  - 11 performances (4 concerts + 5 stages + 2 musicals)');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
