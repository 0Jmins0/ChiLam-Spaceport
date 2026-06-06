import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with real data...');

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
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
