/**
 * 数据恢复脚本 — 从 seed.ts 提取的内容数据
 * 使用 upsert (by slug) 恢复被清零的表，绝不 deleteMany
 *
 * 恢复表：Tag（补缺）、Album、Magazine、Endorsement、Announcement
 * 不操作：Production、Performance、Interview、SocialPost、NewsArticle、TimelineEvent
 */

import * as fs from 'fs';

// 手动读 .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error('DATABASE_URL is not set');
const connectionString = rawUrl.replace(/^["']|["']$/g, '');
console.log('Connecting to:', connectionString.replace(/\/\/.*@/, '//***@'));

const adapter = new PrismaPg({ connectionString, max: 5 });
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════
// 数据定义（从 seed.ts 原样复制）
// ═══════════════════════════════════════════════

const tagsData = [
  { name: '微博', slug: 'weibo', tagGroup: 'platform' },
  { name: '小红书', slug: 'xiaohongshu', tagGroup: 'platform' },
  { name: '抖音', slug: 'douyin', tagGroup: 'platform' },
  { name: 'Instagram', slug: 'instagram', tagGroup: 'platform' },
  { name: 'Facebook', slug: 'facebook', tagGroup: 'platform' },
  { name: '机场', slug: 'airport', tagGroup: 'sighting_type' },
  { name: '片场', slug: 'filming-set', tagGroup: 'sighting_type' },
  { name: '偶遇', slug: 'encounter', tagGroup: 'sighting_type' },
  { name: '粤语', slug: 'cantonese', tagGroup: 'language' },
  { name: '普通话', slug: 'mandarin', tagGroup: 'language' },
  { name: '内地', slug: 'mainland', tagGroup: 'variety_region' },
  { name: '香港', slug: 'hongkong', tagGroup: 'variety_region' },
  { name: '台湾', slug: 'taiwan', tagGroup: 'variety_region' },
  { name: '常驻', slug: 'resident', tagGroup: 'variety_role' },
  { name: '飞行嘉宾', slug: 'guest', tagGroup: 'variety_role' },
  { name: '演唱会嘉宾', slug: 'concert-guest', tagGroup: 'performance_type' },
  { name: '其他', slug: 'stage-other', tagGroup: 'performance_type' },
];

const albums = [
  { title: '現代愛情故事', slug: 'modern-love-story-1991', releaseYear: 1991, language: '合作（与许秋怡）' },
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
  { title: '愛情開了我們一個玩笑', slug: 'ai-qing-kai-le-wan-xiao-1995', releaseYear: 1995, language: '国语' },
  { title: '言不由衷', slug: 'yan-bu-you-zhong-1996', releaseYear: 1996, language: '国语' },
  { title: '有沒有', slug: 'you-mei-you-1998', releaseYear: 1998, language: '国语' },
  { title: '天地男兒', slug: 'tian-di-nan-er-1999', releaseYear: 1999, language: '国语' },
  { title: '孩子先生', slug: 'hai-zi-xian-sheng-ep-1999', releaseYear: 1999, language: 'EP' },
  { title: 'Hero', slug: 'hero-ep-2016', releaseYear: 2016, language: '迷你专辑' },
  { title: '愛在創意的日子', slug: 'ai-zai-chuang-yi-1994', releaseYear: 1994, language: '精选辑' },
  { title: '天地男兒超級精選', slug: 'tian-di-nan-er-jing-xuan-1996', releaseYear: 1996, language: '精选辑' },
  { title: '怎會如此天地男兒精選', slug: 'zen-hui-ru-ci-jing-xuan-1996', releaseYear: 1996, language: '精选辑' },
  { title: '霖歌精選22首', slug: 'lin-ge-jing-xuan-22-1997', releaseYear: 1997, language: '精选辑' },
  { title: '至霖情歌集', slug: 'zhi-lin-qing-ge-ji-1999', releaseYear: 1999, language: '精选辑' },
  { title: '星聲傳集 - 張智霖', slug: 'xing-sheng-chuan-ji-2002', releaseYear: 2002, language: '精选辑' },
  { title: '愛與夢新曲+精選', slug: 'ai-yu-meng-jing-xuan-2003', releaseYear: 2003, language: '精选辑' },
  { title: '十月初五的月光原聲大碟', slug: 'return-of-the-cuckoo-ost-2000', releaseYear: 2000, language: '原声' },
  { title: '歲月如歌', slug: 'sui-yue-ru-ge-single-2013', releaseYear: 2013, language: '细碟' },
];

const magazines = [
  { title: 'GQ中国', slug: 'gq-china-2021-10', issue: '2021年10月刊', date: new Date('2021-10-01') },
  { title: 'Esquire君子', slug: 'esquire-2019-05', issue: '2019年5月刊', date: new Date('2019-05-01') },
  { title: "Harper's Bazaar 时尚芭莎", slug: 'bazaar-2021-08', issue: '2021年8月刊', date: new Date('2021-08-01') },
  { title: 'Elle Men', slug: 'elle-men-2022-01', issue: '2022年1月刊', date: new Date('2022-01-01') },
  { title: 'Cosmopolitan 时尚COSMO', slug: 'cosmo-2021-12', issue: '2021年12月刊', date: new Date('2021-12-01') },
  { title: '南都娱乐周刊', slug: 'nandu-2025-09', issue: '2025年9月刊', date: new Date('2025-09-01') },
  { title: 'Ming Pao Weekly 明报周刊', slug: 'mingpao-weekly-2013-07', issue: '2013年7月刊', date: new Date('2013-07-01') },
  { title: 'TVB周刊', slug: 'tvb-weekly-2000-11', issue: '2000年11月刊', date: new Date('2000-11-01') },
  { title: 'Madame Figaro 费加罗', slug: 'figaro-2022-03', issue: '2022年3月刊', date: new Date('2022-03-01') },
  { title: "Men's Uno", slug: 'mens-uno-2014-12', issue: '2014年12月刊', date: new Date('2014-12-01') },
];

const endorsements = [
  { brand: '香港美心西饼', slug: 'maxims-cake', role: '代言人', category: '餐饮', startYear: 2013, endYear: null as number | null, description: '香港美心西饼及月饼代言人。' },
  { brand: '香港信贷集团', slug: 'hk-finance-group', role: '代言人', category: '金融', startYear: 2014, endYear: null as number | null, description: '香港信贷集团品牌代言人。' },
  { brand: '香港身份证换领', slug: 'hk-id-replacement', role: '换证大使', category: '政府', startYear: 2018, endYear: 2019, description: '担任香港身份证换领大使。' },
  { brand: '尊尼获加蓝牌', slug: 'johnnie-walker-blue', role: '大中华区品牌大使', category: '酒类', startYear: 2019, endYear: null as number | null, description: '尊尼获加蓝牌威士忌大中华区品牌大使。' },
  { brand: 'Jing Tea', slug: 'jing-tea', role: '代言人', category: '餐饮', startYear: 2019, endYear: null as number | null, description: 'Jing Tea 品牌代言人。' },
  { brand: '保良局', slug: 'po-leung-kuk', role: '亲善大使', category: '慈善', startYear: 2020, endYear: null as number | null, description: '保良局亲善大使，参与多项慈善活动。' },
  { brand: '露安适', slug: 'luanshi', role: '代言人', category: '母婴', startYear: 2021, endYear: null as number | null, description: '露安适品牌代言人。' },
  { brand: '欧利时&欧品客', slug: 'oris-opk', role: '形象代言人', category: '手表', startYear: 2021, endYear: null as number | null, description: '欧利时及欧品客手表形象代言人。' },
  { brand: '西大门', slug: 'xidamen', role: '全球代言人', category: '家居', startYear: 2021, endYear: null as number | null, description: '西大门全球品牌代言人。' },
  { brand: '美赞臣', slug: 'mead-johnson', role: '代言人', category: '母婴', startYear: 2021, endYear: null as number | null, description: '美赞臣品牌代言人。' },
  { brand: '雪花秀', slug: 'sulwhasoo', role: '品牌大使', category: '护肤', startYear: 2021, endYear: null as number | null, description: '雪花秀护肤品牌大使。' },
  { brand: '德芙', slug: 'dove-chocolate', role: '品牌大使', category: '零食', startYear: 2021, endYear: null as number | null, description: '德芙巧克力品牌大使。' },
  { brand: '法国娇兰', slug: 'guerlain', role: '彩妆挚友', category: '彩妆', startYear: 2021, endYear: null as number | null, description: '法国娇兰彩妆挚友。' },
  { brand: '良品铺子', slug: 'bestore', role: '品牌大使', category: '零食', startYear: 2021, endYear: null as number | null, description: '良品铺子品牌大使。' },
  { brand: '凯迪拉克', slug: 'cadillac', role: '品牌大使', category: '汽车', startYear: 2022, endYear: null as number | null, description: '凯迪拉克品牌大使。' },
];

const announcements = [
  {
    type: 'NOTICE' as const,
    title: '「Chilam Is Here」网站正式上线公告',
    slug: 'site-launch-notice',
    content: '各位霖迷大家好！经过数月筹备，「Chilam Is Here」网站正式上线啦！本站致力于汇集张智霖各平台、各阶段、各渠道的资讯，打造一个全面、专业的综合性粉丝资讯平台。感谢大家一直以来的支持与等待，希望大家在这里找到更多关于Chilam的精彩内容。如有任何建议或反馈，欢迎通过留言板与我们联系。',
    isPinned: true,
    publishDate: new Date('2026-01-15'),
  },
  {
    type: 'NOTICE' as const,
    title: '隐私政策更新通知',
    slug: 'privacy-policy-update',
    content: '为了更好地保护用户隐私，我们对网站隐私政策进行了更新。主要变更内容：1. 明确了数据收集范围，仅收集必要的浏览数据用于改善服务；2. 增加了用户数据删除请求流程说明；3. 更新了第三方服务使用说明。详细政策请查看网站底部「隐私政策」链接。',
    isPinned: false,
    publishDate: new Date('2026-02-10'),
  },
  {
    type: 'NOTICE' as const,
    title: '内容版权声明',
    slug: 'copyright-notice',
    content: '本站所有内容（包括但不限于文字、图片、视频资料）均来源于公开渠道或粉丝投稿。所有媒体素材版权归原作者及相关权利人所有。如有侵权请联系管理员处理，我们将在确认后及时删除相关内容。未经授权，禁止转载本站原创整理内容。',
    isPinned: false,
    publishDate: new Date('2026-01-20'),
  },
  {
    type: 'RULE' as const,
    title: '社区规则',
    slug: 'community-rules',
    content: '为维护友好的交流氛围，请遵守以下社区规则：\n1. 尊重他人，禁止人身攻击、恶意诋毁；\n2. 禁止发布虚假信息或未经证实的谣言；\n3. 禁止发布广告、垃圾信息或与主题无关的内容；\n4. 禁止泄露艺人及其家人的私人信息（住址、行程等）；\n5. 转载内容请注明出处，尊重原创者权益；\n6. 违反规则者将视情节给予警告或封禁处理。\n\n让我们共同维护一个温馨有爱的粉丝社区！',
    isPinned: true,
    publishDate: new Date('2026-01-16'),
  },
  {
    type: 'RULE' as const,
    title: '投稿规范',
    slug: 'submission-guidelines',
    content: '欢迎大家向本站投稿！投稿须知：\n1. 路透投稿：请附上拍摄时间、地点，如涉及工作行程请确认已公开；\n2. 图片投稿：请提供原图或高清图，注明拍摄者/来源；\n3. 资讯投稿：请附上原始链接或可靠信源；\n4. 审核周期：投稿将在1-3个工作日内审核发布；\n5. 所有投稿一经采用，将标注投稿者昵称（可匿名）。\n\n投稿请通过留言板「建议反馈」分类提交。',
    isPinned: false,
    publishDate: new Date('2026-01-18'),
  },
  {
    type: 'UPDATE' as const,
    title: 'v1.0 正式发布',
    slug: 'v1-release',
    content: '网站 v1.0 版本正式发布！本次上线包含以下核心功能：\n- 首页时间线：展示Chilam近期重要事件\n- 动态模块：汇集各社交平台动态、新闻报道、粉丝路透\n- 影视模块：完整影视作品库，含电影、电视剧、综艺\n- 演出模块：演唱会、舞台剧、音乐剧信息\n- 活动模块：代言活动与访谈\n- 资料库：专辑与杂志收录\n\n感谢所有参与测试的小伙伴们！',
    isPinned: false,
    publishDate: new Date('2026-01-15'),
  },
  {
    type: 'UPDATE' as const,
    title: '新增留言板功能',
    slug: 'guestbook-feature',
    content: '应大家要求，我们上线了留言板功能！现在你可以：\n- 在「我想对你说」分类中写下想对Chilam说的话；\n- 在「故事分享」中分享你与Chilam的故事和回忆；\n- 在「建议反馈」中向管理团队提出网站改进建议。\n\n每条留言都支持评论互动，快来参与吧！',
    isPinned: false,
    publishDate: new Date('2026-03-01'),
  },
  {
    type: 'UPDATE' as const,
    title: '资料库上线 — 专辑与杂志收录',
    slug: 'archives-feature',
    content: '资料库模块正式上线！目前已收录：\n- 专辑：涵盖Chilam出道至今发行的音乐专辑，包含曲目列表和收听链接；\n- 杂志：收录历年杂志封面及内页扫描。\n\n后续将持续补充更多资料，欢迎大家提供线索和素材。如发现信息有误，请通过留言板反馈。',
    isPinned: false,
    publishDate: new Date('2026-04-15'),
  },
];

// ═══════════════════════════════════════════════
// 恢复逻辑
// ═══════════════════════════════════════════════

async function main() {
  console.log('\n========== 数据恢复脚本开始 ==========\n');

  // ── 1. Tag 补缺 ──
  console.log('--- Tag 补缺 ---');
  for (const t of tagsData) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: { name: t.name, slug: t.slug, tagGroup: t.tagGroup },
    });
  }
  const tagCount = await prisma.tag.count();
  console.log(`  Tag 总数: ${tagCount} (seed 定义 ${tagsData.length} 个)`);

  // ── 2. Album ──
  console.log('\n--- Album 恢复 ---');
  let albumCreated = 0;
  for (let i = 0; i < albums.length; i++) {
    const a = albums[i];
    const existing = await prisma.album.findUnique({ where: { slug: a.slug } });
    if (existing) {
      console.log(`  [跳过] ${a.title} (${a.slug})`);
    } else {
      await prisma.album.create({
        data: {
          slug: a.slug,
          title: a.title,
          releaseYear: a.releaseYear,
          language: a.language,
          sortOrder: i,
        },
      });
      albumCreated++;
      console.log(`  [创建] ${a.title}`);
    }
  }
  console.log(`  Album: 创建 ${albumCreated}, 总数 ${await prisma.album.count()}`);

  // ── 3. Magazine ──
  console.log('\n--- Magazine 恢复 ---');
  let magCreated = 0;
  for (const m of magazines) {
    const existing = await prisma.magazine.findUnique({ where: { slug: m.slug } });
    if (existing) {
      console.log(`  [跳过] ${m.title} (${m.slug})`);
    } else {
      await prisma.magazine.create({
        data: {
          slug: m.slug,
          title: m.title,
          issue: m.issue,
          date: m.date,
        },
      });
      magCreated++;
      console.log(`  [创建] ${m.title}`);
    }
  }
  console.log(`  Magazine: 创建 ${magCreated}, 总数 ${await prisma.magazine.count()}`);

  // ── 4. Endorsement ──
  console.log('\n--- Endorsement 恢复 ---');
  let endCreated = 0;
  for (const e of endorsements) {
    const existing = await prisma.endorsement.findUnique({ where: { slug: e.slug } });
    if (existing) {
      console.log(`  [跳过] ${e.brand} (${e.slug})`);
    } else {
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
      endCreated++;
      console.log(`  [创建] ${e.brand}`);
    }
  }
  console.log(`  Endorsement: 创建 ${endCreated}, 总数 ${await prisma.endorsement.count()}`);

  // ── 5. Announcement ──
  // Announcement 没有 slug 字段，用 title 做去重
  console.log('\n--- Announcement 恢复 ---');
  let annCreated = 0;
  for (const a of announcements) {
    // 用 title 查找是否已存在
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (existing) {
      console.log(`  [跳过] ${a.title}`);
    } else {
      await prisma.announcement.create({
        data: {
          type: a.type,
          title: a.title,
          content: a.content,
          isPinned: a.isPinned,
          publishDate: a.publishDate,
        },
      });
      annCreated++;
      console.log(`  [创建] ${a.title}`);
    }
  }
  console.log(`  Announcement: 创建 ${annCreated}, 总数 ${await prisma.announcement.count()}`);

  // ── 汇总 ──
  console.log('\n========== 恢复完成 ==========');
  console.log(`  Tag:          ${tagCount}`);
  console.log(`  Album:        +${albumCreated} (总 ${await prisma.album.count()})`);
  console.log(`  Magazine:     +${magCreated} (总 ${await prisma.magazine.count()})`);
  console.log(`  Endorsement:  +${endCreated} (总 ${await prisma.endorsement.count()})`);
  console.log(`  Announcement: +${annCreated} (总 ${await prisma.announcement.count()})`);
  console.log('\n不操作的表（已存在）:');
  console.log(`  Production:    ${await prisma.production.count()}`);
  console.log(`  Performance:   ${await prisma.performance.count()}`);
  console.log(`  Interview:     ${await prisma.interview.count()}`);
  console.log(`  SocialPost:    ${await prisma.socialPost.count()}`);
  console.log(`  NewsArticle:   ${await prisma.newsArticle.count()}`);
  console.log(`  TimelineEvent: ${await prisma.timelineEvent.count()}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('恢复失败:', e);
    prisma.$disconnect();
    process.exit(1);
  });
