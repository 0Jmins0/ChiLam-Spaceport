import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error('DATABASE_URL is not set');
}
const connectionString = rawUrl.replace(/^["']|["']$/g, '');
console.log('Connecting to:', connectionString.replace(/\/\/.*@/, '//***@'));

const adapter = new PrismaPg({ connectionString, max: 5 });
const prisma = new PrismaClient({ adapter });

async function main() {
  let totalUpdated = 0;

  // ─────────────────────────────────────────────
  // 1. 回填 Production.releaseDate（76 条）
  // ─────────────────────────────────────────────
  console.log('\n=== 回填 Production.releaseDate ===\n');

  const productionDates: { slug: string; releaseDate: string }[] = [
    // TVB 电视剧（15部）
    { slug: 'chongtian-xiaozi-1992', releaseDate: '1992-04-27' },
    { slug: 'incredible-tuesday-1993', releaseDate: '1993-10-19' },
    { slug: 'legend-condor-jiuyin-1993', releaseDate: '1993-03-15' },
    { slug: 'huangpu-qingqing-1994', releaseDate: '1994-03-21' },
    { slug: 'legend-condor-heroes-1994', releaseDate: '1994-01-17' },
    { slug: 'tianzi-tulong-1994', releaseDate: '1994-06-20' },
    { slug: 'tiandi-naner-1996', releaseDate: '1996-06-03' },
    { slug: 'october-moonlight-2000', releaseDate: '2000-09-18' },
    { slug: 'negotiator-2002', releaseDate: '2002-11-25' },
    { slug: 'xiguan-dashao-2003', releaseDate: '2003-07-28' },
    { slug: 'icac-2004', releaseDate: '2004-02-16' },
    { slug: 'shui-hu-2004', releaseDate: '2004-05-31' },
    { slug: 'yueyue-2011', releaseDate: '2011-03-28' },
    { slug: 'triumph-skies-2-2013', releaseDate: '2013-07-15' },
    { slug: 'cuican-zhicheng-tbd', releaseDate: '2025-04-14' },

    // 大陆/合拍电视剧（11部）
    { slug: 'white-hair-1999', releaseDate: '1999-01-01' },
    { slug: 'rulai-shenzhang-2001', releaseDate: '2002-01-01' },
    { slug: 'caomin-xianling-2001', releaseDate: '2001-01-01' },
    { slug: 'feidao-2003', releaseDate: '2003-01-01' },
    { slug: 'ni-shui-han-2004', releaseDate: '2004-12-06' },
    { slug: 'meili-xintiandi-2006', releaseDate: '2006-01-01' },
    { slug: 'hongfen-2007', releaseDate: '2007-01-01' },
    { slug: 'lu-xiaofeng-2007', releaseDate: '2007-06-12' },
    { slug: 'longmen-yizhan-2007', releaseDate: '2007-01-01' },
    { slug: 'shengzhe-weiwang-2010', releaseDate: '2010-01-01' },
    { slug: 'zhongjie-jihua-2013', releaseDate: '2013-01-01' },

    // 网络剧（5部）
    { slug: 'longmen-biaoju-2015', releaseDate: '2015-01-01' },
    { slug: 'qiuhun-2017', releaseDate: '2017-04-10' },
    { slug: 'shadow-of-justice-2018', releaseDate: '2018-10-22' },
    { slug: 'family-glory-2022', releaseDate: '2022-01-10' },
    { slug: 'fu-shanhai-2025', releaseDate: '2025-01-01' },

    // 其他电视剧（4部）
    { slug: 'famen-zhenxiang-1997', releaseDate: '1997-01-01' },
    { slug: 'saobing-2000', releaseDate: '2000-01-01' },
    { slug: 'tongyi-wuyan-2019', releaseDate: '2019-01-01' },
    { slug: 'feifan-sanxia-2020', releaseDate: '2020-12-12' },

    // 电影（56部）
    { slug: 'border-town-1993', releaseDate: '1993-04-29' },
    { slug: 'chu-liuxiang-1993', releaseDate: '1993-02-11' },
    { slug: 'illegal-racing-1994', releaseDate: '1994-01-01' },
    { slug: '32a-banana-1994', releaseDate: '1994-07-28' },
    { slug: 'waiting-love-1994', releaseDate: '1994-01-01' },
    { slug: 'banana-club-1995', releaseDate: '1995-01-01' },
    { slug: 'no-husband-1995', releaseDate: '1995-01-01' },
    { slug: 'happy-hour-1995', releaseDate: '1995-10-28' },
    { slug: 'jinbang-timing-1996', releaseDate: '1996-07-13' },
    { slug: 'flying-tiger-2-1996', releaseDate: '1996-12-21' },
    { slug: 'love-amoeba-1997', releaseDate: '1997-05-01' },
    { slug: 'g4-agent-1997', releaseDate: '1997-08-15' },
    { slug: 'haoqing-gaitian-1997', releaseDate: '1997-01-01' },
    { slug: 'b-plan-1998', releaseDate: '1998-06-04' },
    { slug: 'extreme-criminal-1998', releaseDate: '1998-01-01' },
    { slug: 'shengsi-lian-1998', releaseDate: '1998-01-01' },
    { slug: 'happy-valley-2000', releaseDate: '2000-01-01' },
    { slug: 'xiao-qinqin-2000', releaseDate: '2000-02-03' },
    { slug: 'yinyang-ai-2000', releaseDate: '2000-01-01' },
    { slug: 'sometimes-dance-2000', releaseDate: '2000-01-01' },
    { slug: 'yougu-yuehui-2000', releaseDate: '2000-01-01' },
    { slug: 'kunshou-2001', releaseDate: '2001-01-01' },
    { slug: 'jt-dataowan-2001', releaseDate: '2001-01-01' },
    { slug: 'manhua-fengyun-2001', releaseDate: '2001-01-01' },
    { slug: 'yueman-bao-2001', releaseDate: '2001-01-01' },
    { slug: 'juse-shentou-2001', releaseDate: '2001-07-12' },
    { slug: 'shouzu-qingshen-2002', releaseDate: '2002-01-01' },
    { slug: 'duopo-gouhun-2002', releaseDate: '2002-01-01' },
    { slug: 'zhanhu-2005', releaseDate: '2005-01-01' },
    { slug: 'sky-walker-2006', releaseDate: '2006-01-01' },
    { slug: 'wohu-2006', releaseDate: '2006-01-26' },
    { slug: 'ren-zai-jianghu-2007', releaseDate: '2007-01-01' },
    { slug: 'kidnap-2007', releaseDate: '2007-06-21' },
    { slug: 'miao-miao-2008', releaseDate: '2008-08-15' },
    { slug: 'touqi-2009', releaseDate: '2009-06-25' },
    { slug: 'natural-born-lover-2012', releaseDate: '2012-03-22' },
    { slug: 'dashu-wo-ai-ni-2013', releaseDate: '2013-01-01' },
    { slug: 'grandmaster-2013', releaseDate: '2013-01-08' },
    { slug: 'baihu-2013', releaseDate: '2013-01-01' },
    { slug: 'delete-lover-2014', releaseDate: '2014-04-10' },
    { slug: 'triumph-skies-movie-2015', releaseDate: '2015-02-19' },
    { slug: 'october-moonlight-movie-2015', releaseDate: '2015-09-03' },
    { slug: 's-storm-2016', releaseDate: '2016-07-08' },
    { slug: 'diary-small-man-3-2017', releaseDate: '2017-01-26' },
    { slug: 'jingcheng-81-2-2017', releaseDate: '2017-07-06' },
    { slug: 'always-beside-you-2017', releaseDate: '2017-11-10' },
    { slug: 'agent-mr-chan-2018', releaseDate: '2018-09-20' },
    { slug: 'xiemi-zhe-2018', releaseDate: '2018-06-15' },
    { slug: 'l-storm-2018', releaseDate: '2018-08-24' },
    { slug: 'gujian-qitan-2018', releaseDate: '2018-10-01' },
    { slug: 'p-storm-2019', releaseDate: '2019-04-04' },
    { slug: 'yishou-weicheng-2019', releaseDate: '2019-01-01' },
    { slug: 'jiayou-xishi-2020', releaseDate: '2020-01-25' },
    { slug: 'love-in-quarantine-2021', releaseDate: '2021-04-22' },
    { slug: 'g-storm-2021', releaseDate: '2021-12-31' },
    { slug: 'anti-crime-2022', releaseDate: '2022-10-04' },
    { slug: 'assassination-storm-2023', releaseDate: '2023-10-05' },
    { slug: 'misjudge-2024', releaseDate: '2024-10-12' },

    // 动画配音（3部）
    { slug: 'puss-in-boots-2012', releaseDate: '2012-01-05' },
    { slug: 'secret-life-pets-2016', releaseDate: '2016-07-07' },
    { slug: 'secret-life-pets-2-2019', releaseDate: '2019-06-06' },

    // 娱乐综艺（9档）
    { slug: 'two-days-one-night-2014', releaseDate: '2014-10-10' },
    { slug: 'with-you-2015', releaseDate: '2015-02-14' },
    { slug: 'fight-for-her-2015', releaseDate: '2015-05-23' },
    { slug: 'top-gun-2015', releaseDate: '2015-01-01' },
    { slug: 'come-on-champion-2016', releaseDate: '2016-06-05' },
    { slug: 'wife-travel-s2-2019', releaseDate: '2019-02-13' },
    { slug: 'masked-singer-2019', releaseDate: '2019-10-27' },
    { slug: 'painting-youth-2022', releaseDate: '2022-01-23' },
    { slug: 'super-trio-tvb', releaseDate: '2000-01-01' },

    // 音乐综艺（5档）
    { slug: 'call-me-by-fire-2021', releaseDate: '2021-08-12' },
    { slug: 'dawanzai-s1-2022', releaseDate: '2022-05-20' },
    { slug: 'dawanzai-s2-2023', releaseDate: '2023-04-28' },
    { slug: 'call-me-by-fire-2025', releaseDate: '2025-05-02' },
    { slug: 'infinity-and-beyond-gba-2024', releaseDate: '2024-03-29' },
  ];

  let productionCount = 0;
  for (const p of productionDates) {
    const result = await prisma.production.updateMany({
      where: { slug: p.slug },
      data: { releaseDate: new Date(p.releaseDate) },
    });
    productionCount += result.count;
    if (result.count === 0) {
      console.warn(`  ⚠ Production 未找到: ${p.slug}`);
    } else {
      console.log(`  ✓ Production: ${p.slug} → ${p.releaseDate}`);
    }
  }
  console.log(`\nProduction 回填完成: ${productionCount}/${productionDates.length} 条\n`);
  totalUpdated += productionCount;

  // ─────────────────────────────────────────────
  // 2. 回填 Album.releaseDate（27 条）
  // ─────────────────────────────────────────────
  console.log('=== 回填 Album.releaseDate ===\n');

  const albumDates: { slug: string; releaseDate: string }[] = [
    { slug: 'modern-love-story-1991', releaseDate: '1991-11-01' },
    { slug: 'dou-wo-kai-xin-ba-1992', releaseDate: '1992-10-01' },
    { slug: 'ru-ci-zhe-ban-xiang-ni-1993', releaseDate: '1993-07-01' },
    { slug: 'chilam-1994', releaseDate: '1994-06-01' },
    { slug: 'ai-zai-chuang-yi-1994', releaseDate: '1994-12-01' },
    { slug: 'duo-xie-guan-xin-1995', releaseDate: '1995-07-01' },
    { slug: 'ai-qing-kai-le-wan-xiao-1995', releaseDate: '1995-10-01' },
    { slug: 'tian-di-nan-er-jing-xuan-1996', releaseDate: '1996-07-01' },
    { slug: 'zen-hui-ru-ci-jing-xuan-1996', releaseDate: '1996-12-01' },
    { slug: 'yan-bu-you-zhong-1996', releaseDate: '1996-04-01' },
    { slug: 'wo-ye-xi-huan-ni-1997', releaseDate: '1997-04-01' },
    { slug: 'hei-se-you-huo-1997', releaseDate: '1997-10-01' },
    { slug: 'lin-ge-jing-xuan-22-1997', releaseDate: '1997-12-01' },
    { slug: 'you-mei-you-1998', releaseDate: '1998-10-01' },
    { slug: 'hai-zi-xian-sheng-ep-1999', releaseDate: '1999-05-01' },
    { slug: 'tian-di-nan-er-1999', releaseDate: '1999-08-01' },
    { slug: 'zhi-lin-qing-ge-ji-1999', releaseDate: '1999-11-01' },
    { slug: 'return-of-the-cuckoo-ost-2000', releaseDate: '2000-09-01' },
    { slug: 'shi-zhi-jin-kou-2000', releaseDate: '2000-11-01' },
    { slug: 'xing-sheng-chuan-ji-2002', releaseDate: '2002-08-01' },
    { slug: 'ai-yu-meng-jing-xuan-2003', releaseDate: '2003-07-01' },
    { slug: 'i-am-chilam-2009', releaseDate: '2009-12-18' },
    { slug: 'what-is-love-2011', releaseDate: '2011-12-02' },
    { slug: 'sui-yue-ru-ge-single-2013', releaseDate: '2013-10-01' },
    { slug: 'de-ja-vu-2014', releaseDate: '2014-01-01' },
    { slug: 'crazy-hours-2014', releaseDate: '2014-11-01' },
    { slug: 'hero-ep-2016', releaseDate: '2016-08-05' },
  ];

  let albumCount = 0;
  for (const a of albumDates) {
    const result = await prisma.album.updateMany({
      where: { slug: a.slug },
      data: { releaseDate: new Date(a.releaseDate) },
    });
    albumCount += result.count;
    if (result.count === 0) {
      console.warn(`  ⚠ Album 未找到: ${a.slug}`);
    } else {
      console.log(`  ✓ Album: ${a.slug} → ${a.releaseDate}`);
    }
  }
  console.log(`\nAlbum 回填完成: ${albumCount}/${albumDates.length} 条\n`);
  totalUpdated += albumCount;

  // ─────────────────────────────────────────────
  // 3. 回填 Endorsement.startDate（15 条）
  // ─────────────────────────────────────────────
  console.log('=== 回填 Endorsement.startDate ===\n');

  const endorsementDates: { slug: string; startDate: string }[] = [
    { slug: 'maxims-cake', startDate: '2013-01-01' },
    { slug: 'hk-finance-group', startDate: '2014-01-01' },
    { slug: 'hk-id-replacement', startDate: '2018-11-01' },
    { slug: 'johnnie-walker-blue', startDate: '2019-01-01' },
    { slug: 'jing-tea', startDate: '2019-01-01' },
    { slug: 'po-leung-kuk', startDate: '2020-01-01' },
    { slug: 'luanshi', startDate: '2021-01-01' },
    { slug: 'oris-opk', startDate: '2021-01-01' },
    { slug: 'xidamen', startDate: '2021-01-01' },
    { slug: 'mead-johnson', startDate: '2021-01-01' },
    { slug: 'sulwhasoo', startDate: '2021-01-01' },
    { slug: 'dove-chocolate', startDate: '2021-01-01' },
    { slug: 'guerlain', startDate: '2021-01-01' },
    { slug: 'bestore', startDate: '2021-01-01' },
    { slug: 'cadillac', startDate: '2022-01-01' },
  ];

  let endorsementCount = 0;
  for (const e of endorsementDates) {
    const result = await prisma.endorsement.updateMany({
      where: { slug: e.slug },
      data: { startDate: new Date(e.startDate) },
    });
    endorsementCount += result.count;
    if (result.count === 0) {
      console.warn(`  ⚠ Endorsement 未找到: ${e.slug}`);
    } else {
      console.log(`  ✓ Endorsement: ${e.slug} → ${e.startDate}`);
    }
  }
  console.log(`\nEndorsement 回填完成: ${endorsementCount}/${endorsementDates.length} 条\n`);
  totalUpdated += endorsementCount;

  // ─────────────────────────────────────────────
  // 总结
  // ─────────────────────────────────────────────
  console.log('═══════════════════════════════════');
  console.log(`回填完成！总共成功更新 ${totalUpdated} 条记录`);
  console.log(`  - Production: ${productionCount} 条`);
  console.log(`  - Album: ${albumCount} 条`);
  console.log(`  - Endorsement: ${endorsementCount} 条`);
  console.log('═══════════════════════════════════');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
