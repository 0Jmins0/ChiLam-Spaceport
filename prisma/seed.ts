import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error('DATABASE_URL is not set');
}
// 去除可能由 dotenvx 保留的引号
const connectionString = rawUrl.replace(/^["']|["']$/g, '');
console.log('Connecting to:', connectionString.replace(/\/\/.*@/, '//***@'));

const adapter = new PrismaPg({
  connectionString,
  max: 5,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with real data...');

  // ─────────────────────────────────────────────
  // 清空数据（注意外键约束顺序，先清关联表）
  // ─────────────────────────────────────────────
  console.log('Clearing existing data...');

  await prisma.admin.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.guestbook.deleteMany();
  await prisma.fanShot.deleteMany();
  await prisma.performanceMedia.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.production.deleteMany();
  await prisma.magazine.deleteMany();
  await prisma.album.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.sighting.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.media.deleteMany();
  await prisma.tag.deleteMany();

  // ─────────────────────────────────────────────
  // 0. 管理员账号
  // ─────────────────────────────────────────────
  console.log('Creating admin account...');

  const hashedPassword = await bcrypt.hash('admin123456', 12);
  await prisma.admin.create({
    data: {
      email: 'admin@chilamishere.com',
      password: hashedPassword,
      name: '站长',
    },
  });

  // ─────────────────────────────────────────────
  // 1. Tags（17 个）
  // ─────────────────────────────────────────────
  console.log('Creating tags...');

  const tags = await Promise.all([
    // platform 组
    prisma.tag.create({ data: { name: '微博', slug: 'weibo', tagGroup: 'platform' } }),
    prisma.tag.create({ data: { name: '小红书', slug: 'xiaohongshu', tagGroup: 'platform' } }),
    prisma.tag.create({ data: { name: '抖音', slug: 'douyin', tagGroup: 'platform' } }),
    prisma.tag.create({ data: { name: 'Instagram', slug: 'instagram', tagGroup: 'platform' } }),
    prisma.tag.create({ data: { name: 'Facebook', slug: 'facebook', tagGroup: 'platform' } }),
    // sighting_type 组
    prisma.tag.create({ data: { name: '机场', slug: 'airport', tagGroup: 'sighting_type' } }),
    prisma.tag.create({ data: { name: '片场', slug: 'filming-set', tagGroup: 'sighting_type' } }),
    prisma.tag.create({ data: { name: '偶遇', slug: 'encounter', tagGroup: 'sighting_type' } }),
    // language 组
    prisma.tag.create({ data: { name: '粤语', slug: 'cantonese', tagGroup: 'language' } }),
    prisma.tag.create({ data: { name: '普通话', slug: 'mandarin', tagGroup: 'language' } }),
    // variety_region 组
    prisma.tag.create({ data: { name: '内地', slug: 'mainland', tagGroup: 'variety_region' } }),
    prisma.tag.create({ data: { name: '香港', slug: 'hongkong', tagGroup: 'variety_region' } }),
    prisma.tag.create({ data: { name: '台湾', slug: 'taiwan', tagGroup: 'variety_region' } }),
    // variety_role 组
    prisma.tag.create({ data: { name: '常驻', slug: 'resident', tagGroup: 'variety_role' } }),
    prisma.tag.create({ data: { name: '飞行嘉宾', slug: 'guest', tagGroup: 'variety_role' } }),
    // performance_type 组
    prisma.tag.create({ data: { name: '演唱会嘉宾', slug: 'concert-guest', tagGroup: 'performance_type' } }),
    prisma.tag.create({ data: { name: '其他', slug: 'stage-other', tagGroup: 'performance_type' } }),
  ]);

  const tagMap: Record<string, string> = {};
  for (const tag of tags) {
    tagMap[tag.slug] = tag.id;
  }

  // ─────────────────────────────────────────────
  // 2. TimelineEvent（25 个真实事件）
  // ─────────────────────────────────────────────
  console.log('Creating timeline events...');

  const timelineEvents = [
    {
      date: new Date('1971-08-27'),
      title: '出生于香港',
      description: '张智霖（Julian Cheung Chi-lam）在香港出生。',
    },
    {
      date: new Date('1991-01-01'),
      title: '出道，发行首张专辑《现代爱情故事》',
      description: '签约华纳唱片，以歌手身份正式出道，发行首张粤语专辑《现代爱情故事》，同名歌曲成为华语经典情歌。',
    },
    {
      date: new Date('1992-06-01'),
      title: '出演首部电视剧《冲天小子》',
      description: '首次出演电视剧《冲天小子》，饰演张培俊，开启演员生涯。',
    },
    {
      date: new Date('1994-01-01'),
      title: '出演《射雕英雄传》饰演郭靖',
      description: '在TVB经典武侠剧《射雕英雄传》中饰演男主角郭靖，与朱茵合演，演唱主题曲《绝世绝招》，人气急升。',
    },
    {
      date: new Date('1996-01-01'),
      title: '出演《天地男儿》',
      description: '在TVB经典剧集《天地男儿》中饰演罗子健，并演唱主题曲。',
    },
    {
      date: new Date('2000-10-01'),
      title: '出演《十月初五的月光》饰演文初',
      description: '在经典剧集《十月初五的月光》中饰演文初（初哥哥），最高收视46点，获"亚太电视大奖最佳连续剧"。成为最经典角色之一。',
    },
    {
      date: new Date('2001-02-14'),
      title: '与袁咏仪结婚',
      description: '与影后袁咏仪（靓靓）于情人节结婚，成为娱乐圈模范夫妻。',
    },
    {
      date: new Date('2002-01-01'),
      title: '出演《谈判专家》获最佳角色奖',
      description: '在TVB剧集《谈判专家》中饰演杨光，获"我最喜爱的电视角色"奖。',
    },
    {
      date: new Date('2006-11-12'),
      title: '儿子张慕童(Morton)出生',
      description: '儿子张慕童（Morton，小名"魔童"）出生，家庭美满。',
    },
    {
      date: new Date('2007-01-01'),
      title: '出演《陆小凤传奇》获最佳男演员',
      description: '出演系列电视电影《陆小凤传奇》饰演陆小凤，获第7届数字电影百合奖最佳男演员。',
    },
    {
      date: new Date('2009-01-01'),
      title: '复出乐坛，发行《I AM CHILAM》',
      description: '时隔多年重返乐坛，发行复出首张专辑《I AM CHILAM》。',
    },
    {
      date: new Date('2011-09-01'),
      title: '首个个人演唱会"我系外星人"',
      description: '在香港红磡体育馆举办入行20年来首个个人演唱会"我系外星人演唱会"。',
    },
    {
      date: new Date('2013-06-01'),
      title: '出演《冲上云霄II》饰演Cool魔',
      description: '在TVB大型剧集《冲上云霄II》中饰演男主角顾夏阳（Cool魔/Jayden），角色深入人心，人气极高。',
    },
    {
      date: new Date('2013-01-10'),
      title: '出演王家卫《一代宗师》',
      description: '参演王家卫执导的经典电影《一代宗师》，饰演宫二未婚夫。',
    },
    {
      date: new Date('2014-12-01'),
      title: '"Crazy Hours" 红馆演唱会',
      description: '在香港红磡体育馆举办"ChiLam Crazy Hours Live"演唱会，连开3场。',
    },
    {
      date: new Date('2016-01-01'),
      title: '出演《S风暴》开启反贪风暴系列',
      description: '出演"反贪风暴"系列电影首部《S风暴》，饰演重案组高级督察刘保强，此后连续出演L/P/G风暴四部曲。',
    },
    {
      date: new Date('2021-08-01'),
      title: '参加《披荆斩棘的哥哥》第一季',
      description: '参加芒果TV综艺《披荆斩棘的哥哥》第一季，与陈小春、谢天华、林晓峰、梁汉文组成"大湾区"组合，圈粉无数。',
    },
    {
      date: new Date('2024-12-27'),
      title: '电影《误判》上映',
      description: '参演甄子丹执导电影《误判》，饰演反派角色欧柏文。上映4天票房突破2亿人民币。',
    },
    {
      date: new Date('2025-01-28'),
      title: '央视春晚演唱《湾区乐好》',
      description: '参加2025年央视春晚，与陈小春、薛凯琪、汪明荃等合唱粤语金曲串烧《湾区乐好》，融合《海阔天空》《男儿当自强》《红日》等经典。',
    },
    {
      date: new Date('2025-08-08'),
      title: '参加《披荆斩棘2025》',
      description: '再次参加《披荆斩棘》系列，与陈小春、周柏豪、林晓峰组成"大湾仔"战队，最终获得"年度滚烫X-Fire"奖项。',
    },
    {
      date: new Date('2025-09-01'),
      title: '古装剧《赴山海》播出',
      description: '古装武侠剧《赴山海》在腾讯视频播出，饰演"燕狂徒"，改编自温瑞安小说《神州奇侠》。',
    },
    {
      date: new Date('2025-12-17'),
      title: 'TVB新剧《璀璨之城》开机',
      description: '回巢TVB，新剧《璀璨之城》举行开机礼，与吴卓羲相隔12年再合作，饰演豪门亲兄弟。',
    },
    {
      date: new Date('2026-01-01'),
      title: '参加大湾区新年音乐会',
      description: '参加《扬帆远航大湾区——2026新年音乐会》，演唱《狮子山下》《东方之珠》。',
    },
    {
      date: new Date('2026-04-20'),
      title: '陈小春演唱会助阵',
      description: '作为嘉宾出现在陈小春"生·旦·净·末·丑"世界巡回演唱会上，帅气造型从舞台中央升起，全场瞩目。',
    },
    {
      date: new Date('2026-06-01'),
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
  // 3. SocialPost（12 条基于真实事件）
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
    // 微博 @張智霖 (weibo.com/chilamcheung) — 约2823万粉丝
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2024-misjudge',
      title: '《误判》上映宣传',
      summary: '电影《误判》正式上映，感谢甄子丹导演的信任，这次演反派是全新的挑战。期待大家去影院支持！',
      thumbnailUrl: 'https://picsum.photos/seed/misjudge2024/400/500',
      publishedAt: new Date('2024-12-27'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2024-japan-trip',
      title: '一家三口日本旅行',
      summary: '难得的家庭时间，和靓靓、魔童一起去日本旅行。魔童已经18岁了，越来越高了。',
      thumbnailUrl: 'https://picsum.photos/seed/japan2024/400/500',
      publishedAt: new Date('2024-12-20'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2025-cctv-spring',
      title: '央视春晚《湾区乐好》',
      summary: '很荣幸参加2025年央视春晚！和小春、凯琪他们一起唱粤语金曲串烧，《海阔天空》《男儿当自强》《红日》，广东人DNA动了！',
      thumbnailUrl: 'https://picsum.photos/seed/cctv2025/400/500',
      publishedAt: new Date('2025-01-28'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2025-anniversary',
      title: '结婚24周年快乐',
      summary: '24年了，感恩有你。素颜在家简单庆祝，平淡就是幸福。',
      thumbnailUrl: 'https://picsum.photos/seed/anniv2025/400/500',
      publishedAt: new Date('2025-02-14'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2025-fushanhai',
      title: '《赴山海》正式播出',
      summary: '古装武侠剧《赴山海》在腾讯视频播出了！饰演"燕狂徒"，温瑞安先生的经典角色，希望大家喜欢。',
      thumbnailUrl: 'https://picsum.photos/seed/fushanhai/400/500',
      publishedAt: new Date('2025-09-11'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2025-pjzj',
      title: '披荆斩棘2025 大湾仔战队',
      summary: '和小春、柏豪、晓峰再次组队出发！大湾仔战队，改编华仔的《17岁》，普通话快嘴说唱《烈火战马》挑战成功！',
      thumbnailUrl: 'https://picsum.photos/seed/pjzj2025/400/500',
      publishedAt: new Date('2025-08-15'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2025-pjzj-finale',
      title: '年度滚烫X-Fire',
      summary: '《披荆斩棘2025》总决赛，获得"2025年度滚烫X-Fire"！X表示不能被fire，是要一直做下去的意思吗？哈哈',
      thumbnailUrl: 'https://picsum.photos/seed/xfire2025/400/500',
      publishedAt: new Date('2025-10-24'),
      importMethod: 'MANUAL',
    },
    {
      platform: '微博',
      tagSlug: 'weibo',
      originalUrl: 'https://weibo.com/chilamcheung',
      originalId: 'wb-2025-tvb-cuican',
      title: 'TVB新剧《璀璨之城》开机',
      summary: '回巢TVB！《璀璨之城》正式开机，和吴卓羲相隔12年再合作，这次演豪门兄弟。大卫哥、海宁也在，阵容强大！',
      thumbnailUrl: 'https://picsum.photos/seed/cuican2025/400/500',
      publishedAt: new Date('2025-12-17'),
      importMethod: 'MANUAL',
    },
    // Instagram @cheung_chi_lam — 约74万粉丝
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/cheung_chi_lam/',
      originalId: 'ig-2025-spring-gala',
      title: 'CCTV Spring Festival Gala 2025',
      summary: 'Honoured to perform at the CCTV Spring Festival Gala! Singing Cantonese classics with the gang. What a night!',
      thumbnailUrl: 'https://picsum.photos/seed/ig-cctv/400/500',
      publishedAt: new Date('2025-01-29'),
      importMethod: 'MANUAL',
    },
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/cheung_chi_lam/',
      originalId: 'ig-2026-newyear-concert',
      title: 'Greater Bay Area New Year Concert 2026',
      summary: 'Singing "Below the Lion Rock" and "Pearl of the Orient" at the GBA New Year Concert. Starting 2026 with music!',
      thumbnailUrl: 'https://picsum.photos/seed/ig-gba2026/400/500',
      publishedAt: new Date('2026-01-01'),
      importMethod: 'MANUAL',
    },
    {
      platform: 'Instagram',
      tagSlug: 'instagram',
      originalUrl: 'https://www.instagram.com/cheung_chi_lam/',
      originalId: 'ig-2026-jordan-concert',
      title: 'Guest appearance at Jordan Chan concert',
      summary: 'Surprise! Rising from the center stage at Jordan\'s world tour. Brothers forever!',
      thumbnailUrl: 'https://picsum.photos/seed/ig-jordan/400/500',
      publishedAt: new Date('2026-04-20'),
      importMethod: 'MANUAL',
    },
    // Facebook 張智霖-ChilamClub
    {
      platform: 'Facebook',
      tagSlug: 'facebook',
      originalUrl: 'https://www.facebook.com/chilamclub/',
      originalId: 'fb-2026-opera',
      title: '央视春节戏曲晚会',
      summary: '参加《2026年央视春节戏曲晚会》，与粤剧名伶曾小敏共同表演粤剧戏歌《紫钗·缘》，跨界合作很有意思。',
      thumbnailUrl: 'https://picsum.photos/seed/fb-opera/400/500',
      publishedAt: new Date('2026-02-01'),
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
  // 4. NewsArticle（10 条真实新闻）
  // ─────────────────────────────────────────────
  console.log('Creating news articles...');

  const newsArticles = [
    {
      slug: 'misjudge-box-office-2024',
      originalUrl: 'https://www.nbd.com.cn/articles/2024-12-30/3704821.html',
      title: '甄子丹《误判》首日票房825万，总票房破2亿',
      summary: '张智霖参演的电影《误判》由甄子丹执导并主演，于2024年12月27日内地上映。张智霖在片中饰演反派角色欧柏文。上映4天票房突破2亿人民币，香港票房超2900万港币。',
      source: '每经网',
      thumbnailUrl: 'https://picsum.photos/seed/news-misjudge/400/500',
      publishedAt: new Date('2024-12-30'),
    },
    {
      slug: 'pjzj-2025-launch',
      originalUrl: 'https://cn.chinadaily.com.cn/a/202508/08/WS6895e120a310626720041c7b.html',
      title: '《披荆斩棘2025》定档8月8日，张智霖等组七大战队',
      summary: '28位嘉宾组建七大战队，张智霖与陈小春、周柏豪、林晓峰组成"大湾仔"战队。赛制全面革新，以团体形式共生破局。',
      source: '中国日报网',
      thumbnailUrl: 'https://picsum.photos/seed/news-pjzj/400/500',
      publishedAt: new Date('2025-08-08'),
    },
    {
      slug: 'pjzj-2025-finale',
      originalUrl: 'https://news.dayoo.com/gzrbrmt/202510/24/170636_54887684.htm',
      title: '《披荆斩棘2025》收官，张智霖获年度滚烫X-Fire',
      summary: '《披荆斩棘2025》总决赛中，张智霖获得"2025年度滚烫X-Fire"奖项。他调侃说："X表示不能被fire，是要一直做下去的意思吗？"',
      source: '广州日报',
      thumbnailUrl: 'https://picsum.photos/seed/news-xfire/400/500',
      publishedAt: new Date('2025-10-24'),
    },
    {
      slug: 'tvb-return-2025',
      originalUrl: 'https://news.qq.com/rain/a/20250113A042UD00',
      title: '袁咏仪时隔16年重回TVB拍剧，张智霖也宣布回巢',
      summary: '袁咏仪接下TVB剧《模仿人生》，时隔16年重回TVB。张智霖随后也宣布回巢拍摄TVB新剧《璀璨之城》。',
      source: '腾讯新闻',
      thumbnailUrl: 'https://picsum.photos/seed/news-tvb/400/500',
      publishedAt: new Date('2025-01-13'),
    },
    {
      slug: 'anniversary-24-2025',
      originalUrl: 'https://www.orientaldaily.com.my/news/entertainment/2025/02/11/711688',
      title: '张智霖袁咏仪庆结婚24周年，晒素颜家居照',
      summary: '夫妻俩迎来结婚24周年纪念，袁咏仪分享素颜家居合照，两人状态良好，低调庆祝。',
      source: '马来西亚东方日报',
      thumbnailUrl: 'https://picsum.photos/seed/news-anniv/400/500',
      publishedAt: new Date('2025-02-11'),
    },
    {
      slug: 'fushanhai-premiere-2025',
      originalUrl: 'https://news.qq.com/rain/a/20250926A02PN000',
      title: '《赴山海》播出，54岁张智霖武侠造型获赞',
      summary: '古装武侠剧《赴山海》在腾讯视频播出，张智霖饰演"燕狂徒"。报道称"54岁张智霖一登场，给内娱明星提了个醒：武侠剧应该这样拍"。',
      source: '腾讯新闻',
      thumbnailUrl: 'https://picsum.photos/seed/news-fsh/400/500',
      publishedAt: new Date('2025-09-26'),
    },
    {
      slug: 'cuican-start-2025',
      originalUrl: 'https://news.sina.cn/sx/2025-12-18/detail-inhcfkvi8476819.d.html',
      title: 'TVB新剧《璀璨之城》官宣开机，张智霖吴卓羲相隔12年再合作',
      summary: 'TVB大剧《璀璨之城》举行开机礼，张智霖与吴卓羲12年后再合作，饰演豪门亲兄弟。姜大卫、高海宁、张曦雯、陈滢等参演。',
      source: '新浪新闻',
      thumbnailUrl: 'https://picsum.photos/seed/news-cuican/400/500',
      publishedAt: new Date('2025-12-18'),
    },
    {
      slug: 'cctv-spring-gala-2025',
      originalUrl: 'https://news.qq.com/rain/a/20250129A04MZV00',
      title: '央视春晚——广东人DNA动了！陈小春张智霖一开口就是回忆杀',
      summary: '张智霖参加2025年央视春晚，与陈小春、薛凯琪、汪明荃等合唱粤语金曲串烧《湾区乐好》，融合《海阔天空》《沧海一声笑》《男儿当自强》《红日》等经典。',
      source: '腾讯新闻',
      thumbnailUrl: 'https://picsum.photos/seed/news-spring/400/500',
      publishedAt: new Date('2025-01-29'),
    },
    {
      slug: 'jordan-concert-guest-2026',
      originalUrl: 'https://news.qq.com/rain/a/20260420A045IC00',
      title: '陈小春演唱会现场直击：张智霖出场瞬间引全场瞩目',
      summary: '张智霖作为嘉宾出现在陈小春"生·旦·净·末·丑"世界巡回演唱会，帅气造型从舞台中央升起，成为社交媒体热议话题。',
      source: '腾讯新闻',
      thumbnailUrl: 'https://picsum.photos/seed/news-jordan/400/500',
      publishedAt: new Date('2026-04-20'),
    },
    {
      slug: 'couple-event-2025',
      originalUrl: 'https://news.qq.com/rain/a/20250618V06DJ600',
      title: '张智霖袁咏仪同框出席活动',
      summary: '张智霖与袁咏仪夫妻甜蜜同框出席活动，引发网友对模范夫妻的讨论。',
      source: '腾讯新闻',
      thumbnailUrl: 'https://picsum.photos/seed/news-couple/400/500',
      publishedAt: new Date('2025-06-18'),
    },
  ];

  for (const article of newsArticles) {
    await prisma.newsArticle.create({ data: article });
  }

  // ─────────────────────────────────────────────
  // 5. Sighting（10 个示例数据）
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
      slug: 'sighting-2025-changsha-pjzj',
      title: '长沙录制《披荆斩棘2025》',
      summary: '在长沙芒果TV演播厅附近偶遇张智霖，应该是在录制《披荆斩棘2025》。',
      thumbnailUrl: 'https://picsum.photos/seed/sight005/400/500',
      sightedAt: new Date('2025-08-10'),
      authorName: '长沙粉丝',
      status: 'APPROVED',
      tagSlug: 'filming-set',
    },
    {
      slug: 'sighting-2025-gym',
      title: '健身房偶遇Chilam',
      summary: '在健身房偶遇张智霖做重训，身材真的太好了，54岁状态太好了。',
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
      slug: 'sighting-2025-tvb-cuican',
      title: 'TVB《璀璨之城》开机礼现场',
      summary: '在TVB《璀璨之城》开机礼现场看到张智霖和吴卓羲，两人互动很搞笑。',
      thumbnailUrl: 'https://picsum.photos/seed/sight009/400/500',
      sightedAt: new Date('2025-12-17'),
      authorName: 'TVB粉丝',
      status: 'APPROVED',
      tagSlug: 'filming-set',
    },
    {
      slug: 'sighting-2026-jordan-concert',
      title: '陈小春演唱会后台偶遇',
      summary: '在陈小春演唱会结束后的后台通道偶遇张智霖，他刚做完嘉宾下台。',
      thumbnailUrl: 'https://picsum.photos/seed/sight010/400/500',
      sightedAt: new Date('2026-04-20'),
      authorName: '演唱会粉丝',
      status: 'APPROVED',
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
  // 6. Production — 完整影视综数据
  //    来源：docs/filmography-complete.md
  // ─────────────────────────────────────────────
  console.log('Creating productions...');

  // ── 6a. 电视剧 — TVB 无线电视（15 部）
  const tvbSeries = [
    { title: '冲天小子', slug: 'chongtian-xiaozi-1992', year: 1992, role: '张培俊', synopsis: '出道作品。' },
    { title: '不可思议星期二', slug: 'incredible-tuesday-1993', year: 1993, role: 'Eric', synopsis: null },
    { title: '射雕英雄传之九阴真经', slug: 'legend-condor-jiuyin-1993', year: 1993, role: '陈玄风', synopsis: null },
    { title: '黄浦倾情', slug: 'huangpu-qingqing-1994', year: 1994, role: '任鸿飞', synopsis: '男主角。' },
    { title: '射雕英雄传', slug: 'legend-condor-heroes-1994', year: 1994, role: '郭靖', synopsis: '男主角，与朱茵合演。演唱主题曲《绝世绝招》。' },
    { title: '天子屠龙', slug: 'tianzi-tulong-1994', year: 1994, role: '康熙帝', synopsis: null },
    { title: '天地男儿', slug: 'tiandi-naner-1996', year: 1996, role: '罗子健', synopsis: '演唱主题曲。' },
    { title: '十月初五的月光', slug: 'october-moonlight-2000', year: 2000, role: '文初', synopsis: '经典代表作，最高收视46点，获"亚太电视大奖最佳连续剧"。' },
    { title: '谈判专家', slug: 'negotiator-2002', year: 2002, role: '杨光', synopsis: '获"我最喜爱的电视角色"奖。' },
    { title: '西关大少', slug: 'xiguan-dashao-2003', year: 2003, role: '周天赐', synopsis: '演唱主题曲。' },
    { title: '廉政行动2004', slug: 'icac-2004', year: 2004, role: '王启聪', synopsis: '单元剧。' },
    { title: '水浒无间道', slug: 'shui-hu-2004', year: 2004, role: '夏松荫/武松', synopsis: null },
    { title: '鱼跃在花见', slug: 'yueyue-2011', year: 2011, role: '鱼至嬴', synopsis: '大结局收视38点。' },
    { title: '冲上云霄II', slug: 'triumph-skies-2-2013', year: 2013, role: '顾夏阳 (Cool魔)', synopsis: '男主角，航空题材，人气极高。' },
    { title: '璀璨之城', slug: 'cuican-zhicheng-tbd', year: 2025, role: null, synopsis: '与吴卓羲相隔12年再合作，饰演豪门亲兄弟。待播映。' },
  ];

  for (const tv of tvbSeries) {
    await prisma.production.create({
      data: {
        type: 'TV_SERIES',
        slug: tv.slug,
        title: tv.title,
        year: tv.year,
        role: tv.role,
        synopsis: tv.synopsis,
        language: '粤语',
        tags: { connect: [{ id: tagMap['cantonese'] }] },
      },
    });
  }

  // ── 6b. 电视剧 — 中国大陆 / 合拍剧（11 部）
  const mainlandSeries = [
    { title: '白发魔女', slug: 'white-hair-1999', year: 1999, role: '卓一航', synopsis: '古装武侠。' },
    { title: '如来神掌', slug: 'rulai-shenzhang-2001', year: 2001, role: '段飞', synopsis: null },
    { title: '草民县令', slug: 'caomin-xianling-2001', year: 2001, role: '张富贵', synopsis: null },
    { title: '飞刀又见飞刀', slug: 'feidao-2003', year: 2003, role: '李坏', synopsis: '男主角，古龙小说改编。' },
    { title: '逆水寒', slug: 'ni-shui-han-2004', year: 2004, role: '戚少商', synopsis: '古装武侠，饰演"九现神龙"。' },
    { title: '美丽新天地', slug: 'meili-xintiandi-2006', year: 2006, role: '乔力行', synopsis: null },
    { title: '红粉', slug: 'hongfen-2007', year: 2007, role: '浦嘉玮', synopsis: null },
    { title: '陆小凤传奇', slug: 'lu-xiaofeng-2007', year: 2007, role: '陆小凤', synopsis: '系列电视电影，获第7届数字电影百合奖最佳男演员。' },
    { title: '龙门驿站', slug: 'longmen-yizhan-2007', year: 2007, role: '巡城马/马大路', synopsis: null },
    { title: '胜者为王', slug: 'shengzhe-weiwang-2010', year: 2010, role: '符金宝', synopsis: null },
    { title: '终结杉计划', slug: 'zhongjie-jihua-2013', year: 2013, role: '张冲', synopsis: null },
  ];

  for (const tv of mainlandSeries) {
    await prisma.production.create({
      data: {
        type: 'TV_SERIES',
        slug: tv.slug,
        title: tv.title,
        year: tv.year,
        role: tv.role,
        synopsis: tv.synopsis,
        language: '普通话',
        tags: { connect: [{ id: tagMap['mandarin'] }] },
      },
    });
  }

  // ── 6c. 电视剧 — 网络剧（5 部）
  const webSeries = [
    { title: '龙门镖局之为2归来', slug: 'longmen-biaoju-2015', year: 2015, role: '何契辽', synopsis: null, lang: '普通话' },
    { title: '求婚大作战', slug: 'qiuhun-2017', year: 2017, role: '天使 (Angel)', synopsis: null, lang: '普通话' },
    { title: '蚀日风暴', slug: 'shadow-of-justice-2018', year: 2018, role: '凌风', synopsis: '犯罪动作，与薛凯琪合演。', lang: '粤语' },
    { title: '家族荣耀', slug: 'family-glory-2022', year: 2022, role: '马展鸿', synopsis: '香港家族题材。', lang: '粤语' },
    { title: '赴山海', slug: 'fu-shanhai-2025', year: 2025, role: '燕狂徒', synopsis: '古装武侠，改编自温瑞安小说《神州奇侠》。腾讯视频播出。', lang: '普通话' },
  ];

  for (const tv of webSeries) {
    const langTag = tv.lang === '粤语' ? 'cantonese' : 'mandarin';
    await prisma.production.create({
      data: {
        type: 'TV_SERIES',
        slug: tv.slug,
        title: tv.title,
        year: tv.year,
        role: tv.role,
        synopsis: tv.synopsis,
        language: tv.lang,
        tags: { connect: [{ id: tagMap[langTag] }] },
      },
    });
  }

  // ── 6d. 电视剧 — 其他平台（4 部）
  const otherSeries = [
    { title: '法门之真相', slug: 'famen-zhenxiang-1997', year: 1997, role: 'Peter', synopsis: '香港电台 (RTHK)。', lang: '粤语' },
    { title: '扫冰者', slug: 'saobing-2000', year: 2000, role: '江迪辉', synopsis: '新加坡制作。', lang: '普通话' },
    { title: '同一屋檐下', slug: 'tongyi-wuyan-2019', year: 2019, role: null, synopsis: null, lang: '粤语' },
    { title: '非凡三侠', slug: 'feifan-sanxia-2020', year: 2020, role: '苏芮', synopsis: '邵氏兄弟，轻喜剧。', lang: '粤语' },
  ];

  for (const tv of otherSeries) {
    const langTag = tv.lang === '粤语' ? 'cantonese' : 'mandarin';
    await prisma.production.create({
      data: {
        type: 'TV_SERIES',
        slug: tv.slug,
        title: tv.title,
        year: tv.year,
        role: tv.role,
        synopsis: tv.synopsis,
        language: tv.lang,
        tags: { connect: [{ id: tagMap[langTag] }] },
      },
    });
  }

  // ── 6e. 电影 — 院线电影（56 部完整列表）
  const movies = [
    { title: '边城浪子', slug: 'border-town-1993', year: 1993, role: '路小佳', synopsis: '古龙小说改编。' },
    { title: '笑侠楚留香', slug: 'chu-liuxiang-1993', year: 1993, role: '太子', synopsis: null },
    { title: '非法赛车', slug: 'illegal-racing-1994', year: 1994, role: '赵志冲', synopsis: null },
    { title: '四个32A和一个香蕉少年', slug: '32a-banana-1994', year: 1994, role: '陈老师', synopsis: null },
    { title: '等爱的女人', slug: 'waiting-love-1994', year: 1994, role: 'Albert', synopsis: null },
    { title: '正牌香蕉俱乐部', slug: 'banana-club-1995', year: 1995, role: null, synopsis: null },
    { title: '没有老公的日子', slug: 'no-husband-1995', year: 1995, role: 'Alex', synopsis: null },
    { title: '欢乐时光', slug: 'happy-hour-1995', year: 1995, role: '张百常', synopsis: null },
    { title: '金榜题名', slug: 'jinbang-timing-1996', year: 1996, role: '飞全', synopsis: null },
    { title: '飞虎雄心2之傲气比天高', slug: 'flying-tiger-2-1996', year: 1996, role: '何志林 (Coolman)', synopsis: '动作片。' },
    { title: '爱情Amoeba', slug: 'love-amoeba-1997', year: 1997, role: '毛恩东', synopsis: null },
    { title: 'G4特工', slug: 'g4-agent-1997', year: 1997, role: '陈羿', synopsis: '动作片。' },
    { title: '豪情盖天', slug: 'haoqing-gaitian-1997', year: 1997, role: '梁家豪', synopsis: null },
    { title: 'B计划', slug: 'b-plan-1998', year: 1998, role: 'Ken Cheung', synopsis: null },
    { title: '极度重犯', slug: 'extreme-criminal-1998', year: 1998, role: 'Max', synopsis: null },
    { title: '生死恋', slug: 'shengsi-lian-1998', year: 1998, role: 'Cliff', synopsis: null },
    { title: '跑马地的月光', slug: 'happy-valley-2000', year: 2000, role: '伍广荣', synopsis: null },
    { title: '小亲亲', slug: 'xiao-qinqin-2000', year: 2000, role: '袁正浩', synopsis: null },
    { title: '阴阳爱', slug: 'yinyang-ai-2000', year: 2000, role: 'Joe', synopsis: null },
    { title: '有时跳舞', slug: 'sometimes-dance-2000', year: 2000, role: '阿汉', synopsis: null },
    { title: '幽谷约会', slug: 'yougu-yuehui-2000', year: 2000, role: '阿智', synopsis: null },
    { title: '困兽', slug: 'kunshou-2001', year: 2001, role: 'Rick', synopsis: null },
    { title: '惊天大逃亡', slug: 'jt-dataowan-2001', year: 2001, role: '周大福', synopsis: null },
    { title: '漫画风云', slug: 'manhua-fengyun-2001', year: 2001, role: '叶风', synopsis: null },
    { title: '月满抱西环', slug: 'yueman-bao-2001', year: 2001, role: '锺志杰', synopsis: null },
    { title: '绝色神偷', slug: 'juse-shentou-2001', year: 2001, role: '洛子扬', synopsis: null },
    { title: '手足情深', slug: 'shouzu-qingshen-2002', year: 2002, role: '张家泽 (青年)', synopsis: null },
    { title: '夺魄勾魂', slug: 'duopo-gouhun-2002', year: 2002, role: '阿占', synopsis: null },
    { title: '战虎', slug: 'zhanhu-2005', year: 2005, role: '阿卓', synopsis: null },
    { title: '天行者', slug: 'sky-walker-2006', year: 2006, role: '马学仁', synopsis: null },
    { title: '卧虎', slug: 'wohu-2006', year: 2006, role: '锺孝礼', synopsis: null },
    { title: '人在江湖', slug: 'ren-zai-jianghu-2007', year: 2007, role: '阿七', synopsis: null },
    { title: '绑架', slug: 'kidnap-2007', year: 2007, role: '周兆炽', synopsis: null },
    { title: '渺渺', slug: 'miao-miao-2008', year: 2008, role: null, synopsis: '演唱主题曲"Get Together"，获金马奖提名。' },
    { title: '头七', slug: 'touqi-2009', year: 2009, role: '小马', synopsis: null },
    { title: '天生爱情狂', slug: 'natural-born-lover-2012', year: 2012, role: '张泰林', synopsis: '与刘心悠合演。' },
    { title: '大叔我爱你', slug: 'dashu-wo-ai-ni-2013', year: 2013, role: '方家成', synopsis: null },
    { title: '一代宗师', slug: 'grandmaster-2013', year: 2013, role: '伶人/宫二未婚夫', synopsis: '王家卫执导。' },
    { title: '白狐', slug: 'baihu-2013', year: 2013, role: '王元丰', synopsis: null },
    { title: 'Delete爱人', slug: 'delete-lover-2014', year: 2014, role: 'Cool魔', synopsis: null },
    { title: '冲上云霄', slug: 'triumph-skies-movie-2015', year: 2015, role: '顾夏阳 (Jayden)', synopsis: '电影版，全国票房破亿。' },
    { title: '十月初五的月光', slug: 'october-moonlight-movie-2015', year: 2015, role: '文初 (初哥哥)', synopsis: '电影版，获"真情演绎"及"浪漫爱情"奖。' },
    { title: 'S风暴', slug: 's-storm-2016', year: 2016, role: '刘保强', synopsis: '反贪风暴系列，重案组高级督察。' },
    { title: '小男人周记3之吾家有喜', slug: 'diary-small-man-3-2017', year: 2017, role: '交通警', synopsis: null },
    { title: '京城81号2', slug: 'jingcheng-81-2-2017', year: 2017, role: '张骘生/宋鹏', synopsis: '惊悚片。' },
    { title: '常在你左右', slug: 'always-beside-you-2017', year: 2017, role: '的士司机 David', synopsis: null },
    { title: '栋笃特工', slug: 'agent-mr-chan-2018', year: 2018, role: '张智霖 (本人)', synopsis: '喜剧。' },
    { title: '泄密者', slug: 'xiemi-zhe-2018', year: 2018, role: '李永勤', synopsis: '与吴镇宇合演。' },
    { title: 'L风暴', slug: 'l-storm-2018', year: 2018, role: '刘保强', synopsis: '反贪风暴系列。' },
    { title: '古剑奇谭之流月昭明', slug: 'gujian-qitan-2018', year: 2018, role: '沈夜', synopsis: '雷尼·哈林执导。' },
    { title: 'P风暴', slug: 'p-storm-2019', year: 2019, role: '刘保强', synopsis: '反贪风暴系列。' },
    { title: '异兽围城', slug: 'yishou-weicheng-2019', year: 2019, role: null, synopsis: null },
    { title: '家有囍事2020', slug: 'jiayou-xishi-2020', year: 2020, role: '游永忠', synopsis: null },
    { title: '总是有爱在隔离', slug: 'love-in-quarantine-2021', year: 2021, role: '雷公', synopsis: '"格尼酒店"住客。' },
    { title: 'G风暴', slug: 'g-storm-2021', year: 2021, role: '刘保强/廖保强', synopsis: '反贪风暴系列最终章。' },
    { title: '扫黑行动', slug: 'anti-crime-2022', year: 2022, role: '赵羡鱼', synopsis: '林德禄执导。' },
    { title: '暗杀风暴', slug: 'assassination-storm-2023', year: 2023, role: '罗飞', synopsis: '邱礼涛执导，与古天乐、吴镇宇合演。' },
    { title: '误判', slug: 'misjudge-2024', year: 2024, role: '欧柏文', synopsis: '甄子丹执导，饰演反派角色。票房破2亿。' },
  ];

  for (const movie of movies) {
    await prisma.production.create({
      data: {
        type: 'MOVIE',
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        role: movie.role,
        synopsis: movie.synopsis,
        language: '粤语',
        tags: { connect: [{ id: tagMap['cantonese'] }] },
      },
    });
  }

  // ── 6f. 电影 — 动画配音（3 部）
  const animations = [
    { title: '无敌猫剑侠', slug: 'puss-in-boots-2012', year: 2012, role: '蛋散', synopsis: 'Puss in Boots 粤语配音。' },
    { title: 'Pet Pet当家', slug: 'secret-life-pets-2016', year: 2016, role: '阿麦 (Max)', synopsis: 'The Secret Life of Pets 粤语配音。' },
    { title: 'Pet Pet当家2', slug: 'secret-life-pets-2-2019', year: 2019, role: '阿麦 (Max)', synopsis: 'The Secret Life of Pets 2 粤语配音。' },
  ];

  for (const anim of animations) {
    await prisma.production.create({
      data: {
        type: 'MOVIE',
        slug: anim.slug,
        title: anim.title,
        year: anim.year,
        role: anim.role,
        synopsis: anim.synopsis,
        language: '粤语',
        tags: { connect: [{ id: tagMap['cantonese'] }] },
      },
    });
  }

  // ── 6g. 综艺 — 娱乐综艺（9 档）
  const entertainmentVariety = [
    { title: '两天一夜', slug: 'two-days-one-night-2014', year: 2014, synopsis: '内地真人秀。', roleSlug: 'resident' },
    { title: '一路上有你', slug: 'with-you-2015', year: 2015, synopsis: '夫妻档真人秀（与袁咏仪）。', roleSlug: 'resident' },
    { title: '为她而战', slug: 'fight-for-her-2015', year: 2015, synopsis: '夫妻档。', roleSlug: 'resident' },
    { title: '壮志凌云', slug: 'top-gun-2015', year: 2015, synopsis: '飞行真人秀。', roleSlug: 'resident' },
    { title: '来吧冠军', slug: 'come-on-champion-2016', year: 2016, synopsis: '体育竞技。', roleSlug: 'guest' },
    { title: '妻子的浪漫旅行 第二季', slug: 'wife-travel-s2-2019', year: 2019, synopsis: '芒果TV（与袁咏仪参加）。', roleSlug: 'resident' },
    { title: '蒙面唱将猜猜猜', slug: 'masked-singer-2019', year: 2019, synopsis: '音乐真人秀。', roleSlug: 'guest' },
    { title: '会画少年的天空', slug: 'painting-youth-2022', year: 2022, synopsis: '湖南卫视。', roleSlug: 'guest' },
    { title: '奖门人系列', slug: 'super-trio-tvb', year: 2000, synopsis: 'TVB经典游戏综艺（多次参加）。', roleSlug: 'guest' },
  ];

  for (const show of entertainmentVariety) {
    const isHK = show.slug === 'super-trio-tvb';
    await prisma.production.create({
      data: {
        type: 'VARIETY_SHOW',
        slug: show.slug,
        title: show.title,
        year: show.year,
        synopsis: show.synopsis,
        language: isHK ? '粤语' : '普通话',
        varietyRegion: isHK ? '香港' : '内地',
        varietyRole: show.roleSlug === 'resident' ? '常驻' : '飞行嘉宾',
        tags: {
          connect: [
            { id: tagMap[isHK ? 'cantonese' : 'mandarin'] },
            { id: tagMap[isHK ? 'hongkong' : 'mainland'] },
            { id: tagMap[show.roleSlug] },
          ],
        },
      },
    });
  }

  // ── 6h. 综艺 — 舞台/音乐综艺（5 档）
  const musicVariety = [
    { title: '披荆斩棘的哥哥', slug: 'call-me-by-fire-2021', year: 2021, synopsis: '芒果TV，与陈小春、谢天华、林晓峰、梁汉文组成"大湾区"组合。' },
    { title: '大湾仔的夜 第一季', slug: 'dawanzai-s1-2022', year: 2022, synopsis: '芒果TV/湖南卫视，合伙人。' },
    { title: '大湾仔的夜 第二季', slug: 'dawanzai-s2-2023', year: 2023, synopsis: '芒果TV，合伙人。' },
    { title: '披荆斩棘 2025', slug: 'call-me-by-fire-2025', year: 2025, synopsis: '芒果TV，"大湾仔"战队（张智霖、陈小春、周柏豪、林晓峰），获"年度滚烫X-Fire"。' },
    { title: '声生不息·大湾区季', slug: 'infinity-and-beyond-gba-2024', year: 2024, synopsis: '音乐综艺，与众星共同演绎《无间道》等经典。' },
  ];

  for (const show of musicVariety) {
    await prisma.production.create({
      data: {
        type: 'VARIETY_SHOW',
        slug: show.slug,
        title: show.title,
        year: show.year,
        synopsis: show.synopsis,
        language: '普通话',
        varietyRegion: '内地',
        varietyRole: '常驻',
        tags: {
          connect: [
            { id: tagMap['mandarin'] },
            { id: tagMap['mainland'] },
            { id: tagMap['resident'] },
          ],
        },
      },
    });
  }

  // ─────────────────────────────────────────────
  // 7. Performance（12 条演出数据）
  // ─────────────────────────────────────────────
  console.log('Creating performances...');

  // 演唱会 5 场（按 filmography-complete.md）
  const concerts = [
    {
      title: '我系外星人演唱会',
      titleEn: 'I Am An Alien Concert',
      slug: 'alien-concert-2011',
      year: 2011,
      venue: '香港红磡体育馆',
      city: '香港',
      series: '我系外星人',
      setlist: ['现代爱情故事', '祝君好', '我一个人住', '你太善良', '相爱无梦', '岁月如歌', '片片枫叶情', '逗我开心吧'],
    },
    {
      title: 'ChiLam Crazy Hours Live 2014',
      titleEn: 'Crazy Hours Live',
      slug: 'crazy-hours-hk-2014',
      year: 2014,
      venue: '香港红磡体育馆',
      city: '香港',
      series: 'Crazy Hours',
      setlist: ['相爱无梦', '你太善良', '岁月如歌', '现代爱情故事', '祝君好', '逗我开心吧', '天梯', '我一个人住'],
    },
    {
      title: '张智霖瘋狂有時大马演唱会',
      titleEn: 'Crazy Hours Malaysia',
      slug: 'crazy-hours-malaysia-2014',
      year: 2014,
      venue: '吉隆坡',
      city: '吉隆坡',
      series: 'Crazy Hours',
      setlist: ['现代爱情故事', '你太善良', '岁月如歌', '天梯', '祝君好'],
    },
    {
      title: '张智霖瘋狂有時演唱会 广州站',
      titleEn: 'Crazy Hours Guangzhou',
      slug: 'crazy-hours-guangzhou-2016',
      year: 2016,
      venue: '广州',
      city: '广州',
      series: 'Crazy Hours',
      setlist: ['现代爱情故事', '你太善良', '岁月如歌', '天梯', '祝君好'],
    },
    {
      title: '玩美LIVE恋上灣星人演唱会',
      titleEn: 'Perfect LIVE Concert',
      slug: 'perfect-live-guangzhou-2022',
      year: 2022,
      venue: '广州中山纪念堂',
      city: '广州',
      series: '玩美LIVE',
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

  // ─────────────────────────────────────────────
  // 8. Endorsement — 代言数据（15 条真实品牌）
  // ─────────────────────────────────────────────
  console.log('Creating endorsements...');

  const endorsements = [
    { brand: '香港美心西饼', slug: 'maxims-cake', role: '代言人', category: '餐饮', startYear: 2013, endYear: null, description: '香港美心西饼及月饼代言人。' },
    { brand: '香港信贷集团', slug: 'hk-finance-group', role: '代言人', category: '金融', startYear: 2014, endYear: null, description: '香港信贷集团品牌代言人。' },
    { brand: '香港身份证换领', slug: 'hk-id-replacement', role: '换证大使', category: '政府', startYear: 2018, endYear: 2019, description: '担任香港身份证换领大使。' },
    { brand: '尊尼获加蓝牌', slug: 'johnnie-walker-blue', role: '大中华区品牌大使', category: '酒类', startYear: 2019, endYear: null, description: '尊尼获加蓝牌威士忌大中华区品牌大使。' },
    { brand: 'Jing Tea', slug: 'jing-tea', role: '代言人', category: '餐饮', startYear: 2019, endYear: null, description: 'Jing Tea 品牌代言人。' },
    { brand: '保良局', slug: 'po-leung-kuk', role: '亲善大使', category: '慈善', startYear: 2020, endYear: null, description: '保良局亲善大使，参与多项慈善活动。' },
    { brand: '露安适', slug: 'luanshi', role: '代言人', category: '母婴', startYear: 2021, endYear: null, description: '露安适品牌代言人。' },
    { brand: '欧利时&欧品客', slug: 'oris-opk', role: '形象代言人', category: '手表', startYear: 2021, endYear: null, description: '欧利时及欧品客手表形象代言人。' },
    { brand: '西大门', slug: 'xidamen', role: '全球代言人', category: '家居', startYear: 2021, endYear: null, description: '西大门全球品牌代言人。' },
    { brand: '美赞臣', slug: 'mead-johnson', role: '代言人', category: '母婴', startYear: 2021, endYear: null, description: '美赞臣品牌代言人。' },
    { brand: '雪花秀', slug: 'sulwhasoo', role: '品牌大使', category: '护肤', startYear: 2021, endYear: null, description: '雪花秀护肤品牌大使。' },
    { brand: '德芙', slug: 'dove-chocolate', role: '品牌大使', category: '零食', startYear: 2021, endYear: null, description: '德芙巧克力品牌大使。' },
    { brand: '法国娇兰', slug: 'guerlain', role: '彩妆挚友', category: '彩妆', startYear: 2021, endYear: null, description: '法国娇兰彩妆挚友。' },
    { brand: '良品铺子', slug: 'bestore', role: '品牌大使', category: '零食', startYear: 2021, endYear: null, description: '良品铺子品牌大使。' },
    { brand: '凯迪拉克', slug: 'cadillac', role: '品牌大使', category: '汽车', startYear: 2022, endYear: null, description: '凯迪拉克品牌大使。' },
  ];

  for (const e of endorsements) {
    await prisma.endorsement.create({
      data: {
        slug: e.slug,
        brand: e.brand,
        role: e.role,
        category: e.category,
        description: e.description,
        startYear: e.startYear,
        endYear: e.endYear,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 9. Interview — 访谈数据（8 条）
  // ─────────────────────────────────────────────
  console.log('Creating interviews...');

  const interviews = [
    {
      slug: 'gq-interview-2021',
      title: 'GQ专访：张智霖的多面人生',
      summary: '张智霖接受GQ专访，谈及从歌手到演员的转变、与袁咏仪的婚姻生活，以及参加《披荆斩棘的哥哥》的感受。',
      source: 'GQ中国',
      date: new Date('2021-10-15'),
      mediaType: 'VIDEO' as const,
      originalUrl: 'https://example.com/gq-chilam-2021',
    },
    {
      slug: 'ifeng-interview-2024',
      title: '凤凰网专访：《误判》中的反派突破',
      summary: '张智霖谈拍摄《误判》时饰演反派欧柏文的心路历程，表示反派角色更有挑战性。',
      source: '凤凰网娱乐',
      date: new Date('2024-12-28'),
      mediaType: 'VIDEO' as const,
      originalUrl: 'https://example.com/ifeng-misjudge-2024',
    },
    {
      slug: 'mango-pjzj-interview-2025',
      title: '芒果TV专访：大湾仔再出发',
      summary: '《披荆斩棘2025》期间专访，张智霖谈与陈小春、周柏豪、林晓峰组队的趣事。',
      source: '芒果TV',
      date: new Date('2025-08-20'),
      mediaType: 'VIDEO' as const,
      originalUrl: 'https://example.com/mango-pjzj-2025',
    },
    {
      slug: 'rthk-radio-2022',
      title: '香港电台访谈：从艺三十年',
      summary: '张智霖做客香港电台节目，回顾从1991年出道至今的演艺生涯，分享音乐和演戏的不同感受。',
      source: '香港电台',
      date: new Date('2022-06-10'),
      mediaType: 'AUDIO' as const,
      originalUrl: 'https://example.com/rthk-chilam-2022',
      transcriptCantonese: '主持人：Chilam，你由91年出道到而家，已经超过30年喇，有咩感受？\n\n张智霖：其实真系好快，好似啱啱先入行咁。最开心系可以一路做自己钟意嘅嘢。',
      proofreadStatus: 'PROOFREAD' as const,
    },
    {
      slug: 'mingpao-text-2025',
      title: '明报专访：回巢TVB的初心',
      summary: '张智霖接受明报专访，谈回巢TVB拍摄《璀璨之城》的原因，以及对香港影视行业发展的看法。',
      source: '明报',
      date: new Date('2025-12-20'),
      mediaType: 'TEXT' as const,
      originalUrl: 'https://example.com/mingpao-tvb-2025',
      transcriptCantonese: '记者：点解会选择呢个时候回TVB？\n\n张智霖：其实一直都有同TVB保持联络，呢次剧本好吸引，同埋可以同卓羲再合作，好难得。',
      transcriptMandarin: '记者：为什么会选择这个时候回TVB？\n\n张智霖：其实一直都有跟TVB保持联系，这次剧本很吸引人，而且可以和卓羲再合作，很难得。',
      proofreadStatus: 'PROOFREAD' as const,
    },
    {
      slug: 'weibo-live-2025',
      title: '微博直播：披荆斩棘庆功宴',
      summary: '张智霖在《披荆斩棘2025》获得年度滚烫X-Fire后进行微博直播，与粉丝互动庆祝。',
      source: '微博',
      date: new Date('2025-10-25'),
      mediaType: 'VIDEO' as const,
      originalUrl: 'https://example.com/weibo-live-xfire',
    },
    {
      slug: 'apple-daily-2019',
      title: '苹果日报专访：尊尼获加蓝牌代言',
      summary: '张智霖接受专访谈担任尊尼获加蓝牌大中华区品牌大使的感受，分享品味生活态度。',
      source: '苹果日报',
      date: new Date('2019-05-10'),
      mediaType: 'TEXT' as const,
      originalUrl: 'https://example.com/apple-jw-2019',
    },
    {
      slug: 'tvb-jade-2013',
      title: 'TVB翡翠台专访：冲上云霄II幕后',
      summary: '张智霖谈饰演Cool魔（顾夏阳）的心得，分享拍摄飞行场景的趣事。',
      source: 'TVB翡翠台',
      date: new Date('2013-07-15'),
      mediaType: 'VIDEO' as const,
      originalUrl: 'https://example.com/tvb-cool-mo-2013',
    },
  ];

  for (const iv of interviews) {
    await prisma.interview.create({
      data: {
        slug: iv.slug,
        title: iv.title,
        summary: iv.summary,
        source: iv.source,
        date: iv.date,
        mediaType: iv.mediaType,
        originalUrl: iv.originalUrl,
        transcriptCantonese: (iv as Record<string, unknown>).transcriptCantonese as string | undefined,
        transcriptMandarin: (iv as Record<string, unknown>).transcriptMandarin as string | undefined,
        proofreadStatus: ((iv as Record<string, unknown>).proofreadStatus as 'PENDING' | 'PROOFREAD') ?? 'PENDING',
      },
    });
  }

  // ─────────────────────────────────────────────
  // 10. Album — 专辑数据（27 张，基于 Wikipedia 音樂作品列表）
  // ─────────────────────────────────────────────
  console.log('Creating albums...');

  const albums = [
    // ── 合作专辑 ──
    { title: '現代愛情故事', slug: 'modern-love-story-1991', releaseYear: 1991, language: '合作（与许秋怡）' },

    // ── 粤语专辑 ──
    { title: '逗我開心吧', slug: 'dou-wo-kai-xin-ba-1992', releaseYear: 1992, language: '粤语' },
    { title: '如此這般想你', slug: 'ru-ci-zhe-ban-xiang-ni-1993', releaseYear: 1993, language: '粤语' },
    { title: 'Chilam', slug: 'chilam-1994', releaseYear: 1994, language: '粤语' },
    { title: '多謝關心', slug: 'duo-xie-guan-xin-1995', releaseYear: 1995, language: '粤语' },
    { title: '我也喜歡你', slug: 'wo-ye-xi-huan-ni-1997', releaseYear: 1997, language: '粤语' },
    { title: '黑色誘惑', slug: 'hei-se-you-huo-1997', releaseYear: 1997, language: '粤语' },
    { title: '十指緊扣', slug: 'shi-zhi-jin-kou-2000', releaseYear: 2000, language: '粤语' },
    { title: 'I Am Chilam', slug: 'i-am-chilam-2009', releaseYear: 2009, language: '粤语' },
    { title: 'What Is Love', slug: 'what-is-love-2011', releaseYear: 2011, language: '粤语' },
    { title: 'ChiLam DE JA VU', slug: 'de-ja-vu-2014', releaseYear: 2014, language: '粤语' },
    { title: 'Crazy Hours', slug: 'crazy-hours-2014', releaseYear: 2014, language: '粤语' },

    // ── 国语专辑 ──
    { title: '愛情開了我們一個玩笑', slug: 'ai-qing-kai-le-wan-xiao-1995', releaseYear: 1995, language: '国语' },
    { title: '言不由衷', slug: 'yan-bu-you-zhong-1996', releaseYear: 1996, language: '国语' },
    { title: '有沒有', slug: 'you-mei-you-1998', releaseYear: 1998, language: '国语' },
    { title: '天地男兒', slug: 'tian-di-nan-er-1999', releaseYear: 1999, language: '国语' },

    // ── EP / 迷你专辑 ──
    { title: '孩子先生', slug: 'hai-zi-xian-sheng-ep-1999', releaseYear: 1999, language: 'EP' },
    { title: 'Hero', slug: 'hero-ep-2016', releaseYear: 2016, language: '迷你专辑' },

    // ── 精选辑 ──
    { title: '愛在創意的日子', slug: 'ai-zai-chuang-yi-1994', releaseYear: 1994, language: '精选辑' },
    { title: '天地男兒超級精選', slug: 'tian-di-nan-er-jing-xuan-1996', releaseYear: 1996, language: '精选辑' },
    { title: '怎會如此天地男兒精選', slug: 'zen-hui-ru-ci-jing-xuan-1996', releaseYear: 1996, language: '精选辑' },
    { title: '霖歌精選22首', slug: 'lin-ge-jing-xuan-22-1997', releaseYear: 1997, language: '精选辑' },
    { title: '至霖情歌集', slug: 'zhi-lin-qing-ge-ji-1999', releaseYear: 1999, language: '精选辑' },
    { title: '星聲傳集 - 張智霖', slug: 'xing-sheng-chuan-ji-2002', releaseYear: 2002, language: '精选辑' },
    { title: '愛與夢新曲+精選', slug: 'ai-yu-meng-jing-xuan-2003', releaseYear: 2003, language: '精选辑' },

    // ── 原声大碟 ──
    { title: '十月初五的月光原聲大碟', slug: 'return-of-the-cuckoo-ost-2000', releaseYear: 2000, language: '原声' },

    // ── 细碟 ──
    { title: '歲月如歌', slug: 'sui-yue-ru-ge-single-2013', releaseYear: 2013, language: '细碟' },
  ];

  for (let i = 0; i < albums.length; i++) {
    const a = albums[i];
    await prisma.album.create({
      data: {
        slug: a.slug,
        title: a.title,
        releaseYear: a.releaseYear,
        language: a.language,
        sortOrder: i,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 11. Magazine — 杂志数据（10 条）
  // ─────────────────────────────────────────────
  console.log('Creating magazines...');

  const magazines = [
    { title: 'GQ中国', slug: 'gq-china-2021-10', issue: '2021年10月刊', date: new Date('2021-10-01') },
    { title: 'Esquire君子', slug: 'esquire-2019-05', issue: '2019年5月刊', date: new Date('2019-05-01') },
    { title: 'Harper\'s Bazaar 时尚芭莎', slug: 'bazaar-2021-08', issue: '2021年8月刊', date: new Date('2021-08-01') },
    { title: 'Elle Men', slug: 'elle-men-2022-01', issue: '2022年1月刊', date: new Date('2022-01-01') },
    { title: 'Cosmopolitan 时尚COSMO', slug: 'cosmo-2021-12', issue: '2021年12月刊', date: new Date('2021-12-01') },
    { title: '南都娱乐周刊', slug: 'nandu-2025-09', issue: '2025年9月刊', date: new Date('2025-09-01') },
    { title: 'Ming Pao Weekly 明报周刊', slug: 'mingpao-weekly-2013-07', issue: '2013年7月刊', date: new Date('2013-07-01') },
    { title: 'TVB周刊', slug: 'tvb-weekly-2000-11', issue: '2000年11月刊', date: new Date('2000-11-01') },
    { title: 'Madame Figaro 费加罗', slug: 'figaro-2022-03', issue: '2022年3月刊', date: new Date('2022-03-01') },
    { title: 'Men\'s Uno', slug: 'mens-uno-2014-12', issue: '2014年12月刊', date: new Date('2014-12-01') },
  ];

  for (const m of magazines) {
    await prisma.magazine.create({
      data: {
        slug: m.slug,
        title: m.title,
        issue: m.issue,
        date: m.date,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 10. Announcement（8 条公告数据）
  // ─────────────────────────────────────────────
  console.log('Creating announcements...');

  const announcements = [
    // NOTICE x3
    {
      type: 'NOTICE' as const,
      title: '「Chilam Is Here」网站正式上线公告',
      content: '各位霖迷大家好！经过数月筹备，「Chilam Is Here」网站正式上线啦！本站致力于汇集张智霖各平台、各阶段、各渠道的资讯，打造一个全面、专业的综合性粉丝资讯平台。感谢大家一直以来的支持与等待，希望大家在这里找到更多关于Chilam的精彩内容。如有任何建议或反馈，欢迎通过留言板与我们联系。',
      isPinned: true,
      publishDate: new Date('2026-01-15'),
    },
    {
      type: 'NOTICE' as const,
      title: '隐私政策更新通知',
      content: '为了更好地保护用户隐私，我们对网站隐私政策进行了更新。主要变更内容：1. 明确了数据收集范围，仅收集必要的浏览数据用于改善服务；2. 增加了用户数据删除请求流程说明；3. 更新了第三方服务使用说明。详细政策请查看网站底部「隐私政策」链接。',
      isPinned: false,
      publishDate: new Date('2026-02-10'),
    },
    {
      type: 'NOTICE' as const,
      title: '内容版权声明',
      content: '本站所有内容（包括但不限于文字、图片、视频资料）均来源于公开渠道或粉丝投稿。所有媒体素材版权归原作者及相关权利人所有。如有侵权请联系管理员处理，我们将在确认后及时删除相关内容。未经授权，禁止转载本站原创整理内容。',
      isPinned: false,
      publishDate: new Date('2026-01-20'),
    },
    // RULE x2
    {
      type: 'RULE' as const,
      title: '社区规则',
      content: '为维护友好的交流氛围，请遵守以下社区规则：\n1. 尊重他人，禁止人身攻击、恶意诋毁；\n2. 禁止发布虚假信息或未经证实的谣言；\n3. 禁止发布广告、垃圾信息或与主题无关的内容；\n4. 禁止泄露艺人及其家人的私人信息（住址、行程等）；\n5. 转载内容请注明出处，尊重原创者权益；\n6. 违反规则者将视情节给予警告或封禁处理。\n\n让我们共同维护一个温馨有爱的粉丝社区！',
      isPinned: true,
      publishDate: new Date('2026-01-16'),
    },
    {
      type: 'RULE' as const,
      title: '投稿规范',
      content: '欢迎大家向本站投稿！投稿须知：\n1. 路透投稿：请附上拍摄时间、地点，如涉及工作行程请确认已公开；\n2. 图片投稿：请提供原图或高清图，注明拍摄者/来源；\n3. 资讯投稿：请附上原始链接或可靠信源；\n4. 审核周期：投稿将在1-3个工作日内审核发布；\n5. 所有投稿一经采用，将标注投稿者昵称（可匿名）。\n\n投稿请通过留言板「建议反馈」分类提交。',
      isPinned: false,
      publishDate: new Date('2026-01-18'),
    },
    // UPDATE x3
    {
      type: 'UPDATE' as const,
      title: 'v1.0 正式发布',
      content: '网站 v1.0 版本正式发布！本次上线包含以下核心功能：\n- 首页时间线：展示Chilam近期重要事件\n- 动态模块：汇集各社交平台动态、新闻报道、粉丝路透\n- 影视模块：完整影视作品库，含电影、电视剧、综艺\n- 演出模块：演唱会、舞台剧、音乐剧信息\n- 活动模块：代言活动与访谈\n- 资料库：专辑与杂志收录\n\n感谢所有参与测试的小伙伴们！',
      isPinned: false,
      publishDate: new Date('2026-01-15'),
    },
    {
      type: 'UPDATE' as const,
      title: '新增留言板功能',
      content: '应大家要求，我们上线了留言板功能！现在你可以：\n- 在「我想对你说」分类中写下想对Chilam说的话；\n- 在「故事分享」中分享你与Chilam的故事和回忆；\n- 在「建议反馈」中向管理团队提出网站改进建议。\n\n每条留言都支持评论互动，快来参与吧！',
      isPinned: false,
      publishDate: new Date('2026-03-01'),
    },
    {
      type: 'UPDATE' as const,
      title: '资料库上线 — 专辑与杂志收录',
      content: '资料库模块正式上线！目前已收录：\n- 专辑：涵盖Chilam出道至今发行的音乐专辑，包含曲目列表和收听链接；\n- 杂志：收录历年杂志封面及内页扫描。\n\n后续将持续补充更多资料，欢迎大家提供线索和素材。如发现信息有误，请通过留言板反馈。',
      isPinned: false,
      publishDate: new Date('2026-04-15'),
    },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }

  // ────────────────────────────────────��────────
  // 12. Guestbook — 留言板数据
  // ─────────────────────────────────────────────
  console.log('Creating guestbook entries...');

  const guestbookMessages = [
    { nickname: '霖霖的小太阳', content: 'Chilam永远是最帅的！从小就喜欢你，希望你一直开心健康。' },
    { nickname: '粤语歌迷', content: '每次听到《岁月如歌》都会想起你，歌声真的太好听了，感谢你带给我们这么多好作品。' },
    { nickname: '路过的港剧粉', content: '刚看完《使徒行者》又想重温一遍，卓sir太帅了！' },
    { nickname: '老粉丝2003', content: '追星二十年，Chilam一直是我的偶像。谢谢你陪伴了我的青春。' },
    { nickname: '新入坑的00后', content: '最近被安利了Chilam，真的好帅好有魅力！' },
  ];

  const guestbookStories = [
    { nickname: '追星老阿姨', content: '2011年第一次看Chilam演唱会，在红馆。那天下着大雨，我从深圳赶过去，全身湿透了但是听到第一首歌的时候所有疲惫都消失了。那是我人生中最难忘的夜晚之一，Chilam站在舞台上唱《现代爱情故事》的时候，全场都在跟着唱。那一刻我觉得，追星是值得的。', storyTags: ['追星经历', '音乐记忆'], relatedYear: 2011 },
    { nickname: '90后TVB迷', content: '小时候每天放学回家第一件事就是打开电视看TVB，《天地豪情》《十月初五的月光》都是陪伴我长大的剧。Chilam演的每个角色都让我印象深刻，尤其是《冲上云霄》里的Captain Cool，让我立志要当飞行员（虽然最后没实现哈哈）。', storyTags: ['影视回忆'], relatedYear: 2003 },
    { nickname: '音乐发烧友', content: '收藏了Chilam从第一张专辑到现在的所有实体碟，粤语歌坛真的不能没有他。每张专辑都有不同的惊喜，从早期的偶像路线到后来越来越成熟的音乐风格，见证了一个歌手的成长。', storyTags: ['音乐记忆', '追星经历'], relatedYear: 1995 },
    { nickname: '冷知识达人', content: '你们知道吗？Chilam其实是混血儿，中德混血。难怪轮廓这么深邃！而且他年轻时候还当过模特，后来才进入演艺圈的。', storyTags: ['冷知识'], relatedYear: null },
    { nickname: '马来西亚粉丝', content: '2014年Chilam来马来西亚开演唱会，那是我第一次现场看到他。我从槟城飞到吉隆坡，整个过程虽然折腾但是超值得。他在台上说了一句马来语，全场都沸腾了！希望他能多来东南亚。', storyTags: ['追星经历'], relatedYear: 2014 },
  ];

  const guestbookFeedback = [
    { nickname: '设计师小王', content: '网站设计很有质感，深色主题配金色很高级。建议可以加一个搜索功能，方便找特定的影视作品或歌曲。' },
    { nickname: '资深网民', content: '希望能增加一个作品时间线功能，按年份展示Chilam所有的影视、音乐、演唱会作品，这样可以更直观地看到他的演艺历程。' },
    { nickname: '手机用户', content: '手机端的浏览体验很好，加载速度也快。如果能有个暗色/亮色主题切换就更好了。' },
  ];

  const createdGuestbooks: string[] = [];

  for (const msg of guestbookMessages) {
    const entry = await prisma.guestbook.create({
      data: { nickname: msg.nickname, content: msg.content, tab: 'MESSAGE', status: 'APPROVED' },
    });
    createdGuestbooks.push(entry.id);
  }

  for (const story of guestbookStories) {
    const entry = await prisma.guestbook.create({
      data: {
        nickname: story.nickname,
        content: story.content,
        tab: 'STORY',
        storyTags: story.storyTags,
        relatedYear: story.relatedYear,
        status: 'APPROVED',
      },
    });
    createdGuestbooks.push(entry.id);
  }

  for (const fb of guestbookFeedback) {
    const entry = await prisma.guestbook.create({
      data: { nickname: fb.nickname, content: fb.content, tab: 'FEEDBACK', status: 'APPROVED' },
    });
    createdGuestbooks.push(entry.id);
  }

  // 评论数据
  console.log('Creating comments...');

  const seedComments = [
    { targetId: createdGuestbooks[0], nickname: '同感+1', content: '我也是从小就喜欢Chilam！' },
    { targetId: createdGuestbooks[0], nickname: '路人甲', content: '确实帅了几十年' },
    { targetId: createdGuestbooks[5], nickname: '我也在', content: '我也去了那场演唱会！太震撼了' },
    { targetId: createdGuestbooks[6], nickname: '同龄人', content: '冲上云霄真的是神剧' },
    { targetId: createdGuestbooks[10], nickname: '站长', content: '感谢建议！搜索功能已在规划中' },
  ];

  for (const c of seedComments) {
    await prisma.comment.create({
      data: { targetType: 'guestbook', targetId: c.targetId, nickname: c.nickname, content: c.content },
    });
  }

  const guestbookCount = guestbookMessages.length + guestbookStories.length + guestbookFeedback.length;

  // ─────────────────────────────────────────────
  // 统计
  // ─────────────────────────────────────────────
  const tvCount = tvbSeries.length + mainlandSeries.length + webSeries.length + otherSeries.length;
  const movieCount = movies.length + animations.length;
  const varietyCount = entertainmentVariety.length + musicVariety.length;
  const perfCount = concerts.length + stages.length + musicals.length;

  console.log('Seeding completed successfully!');
  console.log(`  - ${tags.length} tags`);
  console.log(`  - ${timelineEvents.length} timeline events`);
  console.log(`  - ${socialPosts.length} social posts (based on real events)`);
  console.log(`  - ${newsArticles.length} news articles (real reports with URLs)`);
  console.log(`  - ${sightings.length} sightings`);
  console.log(`  - ${tvCount + movieCount + varietyCount} productions (${tvCount} TV + ${movieCount} movies + ${varietyCount} variety)`);
  console.log(`  - ${perfCount} performances (${concerts.length} concerts + ${stages.length} stages + ${musicals.length} musicals)`);
  console.log(`  - ${endorsements.length} endorsements`);
  console.log(`  - ${interviews.length} interviews`);
  console.log(`  - ${albums.length} albums`);
  console.log(`  - ${magazines.length} magazines`);
  console.log(`  - ${announcements.length} announcements`);
  console.log(`  - ${guestbookCount} guestbook entries + ${seedComments.length} comments`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
