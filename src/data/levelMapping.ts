import type { LevelMapping, UserInput } from '@/types';
import { OCCUPATION_TYPE_OPTIONS } from '@/types';
import { generateScene } from './sceneGenerator';

// 明朝万历年间物品价格（单位：两白银/单位）
export const ITEM_PRICES: Record<string, {
  price: number;
  unit: string;
  category: 'food' | 'clothing' | 'housing' | 'luxury' | 'daily';
  image: string;
  modernEquivalent: string;
  isMonthly?: boolean; // 是否按月计算
}> = {
  // 食物类 - 按月计算
  '大米': { 
    price: 0.8, 
    unit: '石/月', 
    category: 'food',
    image: '/rice-sack.webp',
    modernEquivalent: '约等于现代每月150斤优质大米',
    isMonthly: true
  },
  '猪肉': { 
    price: 0.02, 
    unit: '斤/月', 
    category: 'food',
    image: '/pork.webp',
    modernEquivalent: '约等于现代每月10斤猪肉',
    isMonthly: true
  },
  '食盐': { 
    price: 0.05, 
    unit: '斤/月', 
    category: 'food',
    image: '/salt.webp',
    modernEquivalent: '约等于现代每月2斤食盐',
    isMonthly: true
  },
  '食油': { 
    price: 0.08, 
    unit: '斤/月', 
    category: 'food',
    image: '/oil.webp',
    modernEquivalent: '约等于现代每月5斤食用油',
    isMonthly: true
  },
  '茶叶': { 
    price: 0.3, 
    unit: '斤/月', 
    category: 'food',
    image: '/tea.webp',
    modernEquivalent: '约等于现代每月1斤中等茶叶',
    isMonthly: true
  },
  '鲜鱼': { 
    price: 0.03, 
    unit: '斤/月', 
    category: 'food',
    image: '/fish.webp',
    modernEquivalent: '约等于现代每月8斤鲜鱼',
    isMonthly: true
  },
  '鸡蛋': { 
    price: 0.01, 
    unit: '个/月', 
    category: 'food',
    image: '/eggs.webp',
    modernEquivalent: '约等于现代每月30个鸡蛋',
    isMonthly: true
  },
  '鸡肉': { 
    price: 0.04, 
    unit: '斤/月', 
    category: 'food',
    image: '/chicken.webp',
    modernEquivalent: '约等于现代每月6斤鸡肉',
    isMonthly: true
  },
  
  // 衣料类
  '棉布': { 
    price: 0.15, 
    unit: '匹', 
    category: 'clothing',
    image: '/cotton.webp',
    modernEquivalent: '约等于现代3米棉布'
  },
  '丝绸': { 
    price: 1.5, 
    unit: '匹', 
    category: 'clothing',
    image: '/silk-roll.webp',
    modernEquivalent: '约等于现代3米真丝面料'
  },
  
  // 居住类
  '普通住宅': { 
    price: 200, 
    unit: '间', 
    category: 'housing',
    image: '/house.webp',
    modernEquivalent: '约等于现代县城一套小房子'
  },
  '京郊良田': { 
    price: 40, 
    unit: '亩', 
    category: 'housing',
    image: '/farmland.webp',
    modernEquivalent: '约等于现代一亩农田或半平米一线城市房价'
  },
  '上好寿材': { 
    price: 50, 
    unit: '副', 
    category: 'housing',
    image: '/coffin.webp',
    modernEquivalent: '约等于现代一套中档棺材'
  },
  '红木椅': { 
    price: 8, 
    unit: '把', 
    category: 'housing',
    image: '/chair.webp',
    modernEquivalent: '约等于现代一把实木椅子'
  },
  
  // 奢侈品类
  '良马': { 
    price: 25, 
    unit: '匹', 
    category: 'luxury',
    image: '/horse.webp',
    modernEquivalent: '约等于现代一辆中档轿车'
  },
  '耕牛': { 
    price: 12, 
    unit: '头', 
    category: 'luxury',
    image: '/ox.webp',
    modernEquivalent: '约等于现代一台农用拖拉机'
  },
  '毛驴': { 
    price: 4, 
    unit: '头', 
    category: 'luxury',
    image: '/donkey.webp',
    modernEquivalent: '约等于现代一辆电动自行车'
  },
  
  // 日用品类 - 按月计算
  '蜡烛': { 
    price: 0.02, 
    unit: '支/月', 
    category: 'daily',
    image: '/candle.webp',
    modernEquivalent: '约等于现代每月电费',
    isMonthly: true
  },
  '纸张': { 
    price: 0.1, 
    unit: '刀/月', 
    category: 'daily',
    image: '/paper.webp',
    modernEquivalent: '约等于现代每月办公用品',
    isMonthly: true
  },
  '笔墨': { 
    price: 0.3, 
    unit: '套/月', 
    category: 'daily',
    image: '/ink.webp',
    modernEquivalent: '约等于现代每月文具',
    isMonthly: true
  },
  '炭火': { 
    price: 0.5, 
    unit: '篓/月', 
    category: 'daily',
    image: '/brazier.webp',
    modernEquivalent: '约等于现代每月取暖费',
    isMonthly: true
  },
  '酒水': { 
    price: 0.2, 
    unit: '坛/月', 
    category: 'daily',
    image: '/wine.webp',
    modernEquivalent: '约等于现代每月酒水饮料',
    isMonthly: true
  },
};

// 30级职业进阶映射表 - 使用文学人物
export const LEVEL_MAPPING: LevelMapping[] = [
  {
    minSalary: 0,
    maxSalary: 18000,
    level: 0,
    title: "流民",
    dynasty: "明",
    verdict: "衣食无着，苟活于市井，实乃乱世之浮萍。居无定所，食不果腹，朝不保夕，诚为天下至苦之人。",
    historicalFigure: "《水浒传》中的流民（如林冲发配前的处境）",
    dailyLife: "清晨在街头寻找零工机会，中午可能只能喝上一碗稀粥，晚上栖身于破庙或桥洞之下。"
  },
  {
    minSalary: 18000,
    maxSalary: 24000,
    level: 1,
    title: "佃农",
    dynasty: "明",
    verdict: "面朝黄土背朝天，汗滴禾下土，岁入仅供糊口。租种他人之地，五成交租，终年劳碌，余粮无几。",
    historicalFigure: "《红楼梦》中的佃户（如乌进孝管理的庄户）",
    dailyLife: "天未亮便下田耕作，日落方归。春耕夏耘秋收冬藏，一年四季不得闲，年底结算后所剩无几。"
  },
  {
    minSalary: 24000,
    maxSalary: 36000,
    level: 2,
    title: "贫农",
    dynasty: "明",
    verdict: "茅屋三间，薄田一亩，虽无冻馁之忧，亦无发达之望。日出而作，日落而息，世代守此薄业。",
    historicalFigure: "《水浒传》中的阮氏三雄（贫苦渔民）",
    dailyLife: "清晨喂鸡养猪，上午下地干活，中午在家简单用餐，下午继续劳作，傍晚挑水砍柴准备晚饭。"
  },
  {
    minSalary: 36000,
    maxSalary: 48000,
    level: 3,
    title: "小贩",
    dynasty: "明",
    verdict: "走街串巷，蝇头小利，起早贪黑，仅够一家温饱。担货而行，风雨无阻，市井之微末者也。",
    historicalFigure: "《水浒传》中的武大郎（卖炊饼的小贩）",
    dailyLife: "凌晨去集市进货，天亮开始沿街叫卖，中午在街边简单果腹，傍晚收摊回家清点一日所得。"
  },
  {
    minSalary: 48000,
    maxSalary: 60000,
    level: 4,
    title: "自耕农",
    dynasty: "明",
    verdict: "自有薄田，自给自足，虽不富裕，倒也逍遥。不欠租粮，不受人管，乡间之小自在也。",
    historicalFigure: "《水浒传》中的刘唐（赤发鬼，落魄时靠种田为生）",
    dailyLife: "农忙时下地劳作，农闲时修缮房屋或制作手工艺品。逢年过节可杀只鸡改善伙食。"
  },
  {
    minSalary: 60000,
    maxSalary: 84000,
    level: 5,
    title: "富农",
    dynasty: "明",
    verdict: "田产数亩，家有余粮，堪称乡里小康。仓廪充实，鸡鸭成群，虽非显贵，亦有体面。",
    historicalFigure: "《水浒传》中的史进（庄主，有田地产业）",
    dailyLife: "雇佣短工帮忙耕作，自己监督指导。家中常备肉食，可供子弟读书识字，偶尔进城赶集。"
  },
  {
    minSalary: 84000,
    maxSalary: 108000,
    level: 6,
    title: "店铺伙计",
    dynasty: "明",
    verdict: "身怀一技，服务于商贾，虽劳碌却有安稳之所。柜台内外，迎来送往，市井之中坚力量。",
    historicalFigure: "《红楼梦》中的铺面伙计",
    dailyLife: "清晨开门打扫店面，整日站立招呼顾客，晚上盘点货物、记账，月底领取工钱和食宿。"
  },
  {
    minSalary: 108000,
    maxSalary: 132000,
    level: 7,
    title: "资深工匠",
    dynasty: "明",
    verdict: "手艺精湛，受人敬重，一门技艺足以安身立命。木工、铁匠、泥瓦，各有所长，凭技吃饭。",
    historicalFigure: "《水浒传》中的金大坚（刻印高手）",
    dailyLife: "在作坊中专心制作，徒弟在旁打下手。完工后与客户交接，口碑相传，订单不断。"
  },
  {
    minSalary: 132000,
    maxSalary: 156000,
    level: 8,
    title: "账房先生",
    dynasty: "明",
    verdict: "算盘珠响，账目清明，商号之中枢也。掌管钱粮出入，东家倚重，伙计敬畏，实为要职。",
    historicalFigure: "《红楼梦》中的账房先生",
    dailyLife: "每日核对进出账目，月底汇总报表。工作相对清闲但责任重大，常被东家请去商议经营事宜。"
  },
  {
    minSalary: 156000,
    maxSalary: 180000,
    level: 9,
    title: "小商人",
    dynasty: "明",
    verdict: "自有铺面，买卖兴隆，市井之中小有名气。货通南北，利达三江，虽非巨贾，亦有产业。",
    historicalFigure: "《水浒传》中的张青（十字坡酒店老板）",
    dailyLife: "早起查看货源，白天经营店铺，晚上与同行聚会交流行情，盘算如何扩大经营。"
  },
  {
    minSalary: 180000,
    maxSalary: 240000,
    level: 10,
    title: "富户",
    dynasty: "明",
    verdict: "家资殷实，田产店铺皆有，乡里称羡。高门大院，仆役数名，一方之殷实人家。",
    historicalFigure: "《水浒传》中的卢俊义（大名府首富）",
    dailyLife: "不必亲自劳作，管理家中产业和仆人。常与地方官员往来，参与乡里的公益事业和纠纷调解。"
  },
  {
    minSalary: 240000,
    maxSalary: 300000,
    level: 11,
    title: "典史",
    dynasty: "明",
    verdict: "初入流内，虽为末吏，已脱平民之列。典掌文书，收发案牍，衙门之基石也。",
    historicalFigure: "《水浒传》中的何涛（济州府缉捕使臣）",
    dailyLife: "在衙门中处理日常文书，记录案件，管理档案。虽无品级，但已穿上官服，受人敬畏。"
  },
  {
    minSalary: 300000,
    maxSalary: 360000,
    level: 12,
    title: "书吏",
    dynasty: "明",
    verdict: "刀笔之吏，文案娴熟，衙门之根基也。案牍劳形，笔墨为生，虽无品级，实掌权柄。",
    historicalFigure: "《红楼梦》中的门子（葫芦僧）",
    dailyLife: "起草公文、整理案卷、协助审案。熟悉律法条文，常为百姓代写状纸，收取润笔之资。"
  },
  {
    minSalary: 360000,
    maxSalary: 420000,
    level: 13,
    title: "师爷",
    dynasty: "明",
    verdict: "幕僚之职，运筹帷幄，知县之左膀右臂。刑名钱谷，无所不精，幕后之智囊也。",
    historicalFigure: "《红楼梦》中的清客相公",
    dailyLife: "居于知县幕后，为其出谋划策。审案时在一旁记录，闲暇时研读律法，是知县最信任的人。"
  },
  {
    minSalary: 420000,
    maxSalary: 480000,
    level: 14,
    title: "主簿",
    dynasty: "明",
    verdict: "一县之管勾，钱粮之总揽，实权在握。佐理县政，分掌簿籍，知县之得力助手。",
    historicalFigure: "《水浒传》中的押司（宋江曾任此职）",
    dailyLife: "管理一县的户籍、赋税、徭役等事务。每日处理大量文书，是县政运转的关键人物。"
  },
  {
    minSalary: 480000,
    maxSalary: 600000,
    level: 15,
    title: "县丞",
    dynasty: "明",
    verdict: "佐贰之职，辅助知县，一县之第二把交椅。正八品阶，已入流内，仕途之起步也。",
    historicalFigure: "《红楼梦》中的贾雨村（初入仕途时）",
    dailyLife: "协助知县处理政务，分管某些具体事务。可代行知县职权，是晋升知县的重要台阶。"
  },
  {
    minSalary: 600000,
    maxSalary: 720000,
    level: 16,
    title: "正七品知县",
    dynasty: "明",
    verdict: "牧民之官，一县之主，百姓之父母也。正俸四十五两，养廉银千两，权柄日重，威震一方。",
    historicalFigure: "《红楼梦》中的应天府贾雨村",
    dailyLife: "晨起升堂问案，处理民事纠纷。下午批阅公文，接见乡绅。晚上研读律法，准备次日公务。"
  },
  {
    minSalary: 720000,
    maxSalary: 840000,
    level: 17,
    title: "正六品通判",
    dynasty: "明",
    verdict: "佐理州政，分掌粮运、督捕，权柄日重。同知之事，知府之副，州郡之要员也。",
    historicalFigure: "《红楼梦》中的贾政（工部员外郎，约此级别）",
    dailyLife: "分管某一专项事务，如粮运、河工、治安等。常需下乡巡查，督促地方政务。"
  },
  {
    minSalary: 840000,
    maxSalary: 960000,
    level: 18,
    title: "正五品知府",
    dynasty: "明",
    verdict: "一府之尊，统辖数县，威震一方。正俸八十两，养廉银两千两，封疆大吏之起步也。",
    historicalFigure: "《红楼梦》中的金陵知府（贾雨村后期）",
    dailyLife: "统管一府政务，考核属下各县。定期巡查辖区，处理重大案件，向巡抚汇报工作。"
  },
  {
    minSalary: 960000,
    maxSalary: 1080000,
    level: 19,
    title: "正四品道员",
    dynasty: "明",
    verdict: "分守、分巡各道，监察府县，位高权重。承上启下，节制一方，已入高官之列。",
    historicalFigure: "《红楼梦》中的巡盐御史（林如海曾任此职）",
    dailyLife: "巡视所辖各府县，监察官员政绩，处理跨府事务。是中央与地方之间的重要纽带。"
  },
  {
    minSalary: 1080000,
    maxSalary: 1200000,
    level: 20,
    title: "从三品按察使",
    dynasty: "明",
    verdict: "一省刑名之主，司法大权在握，铁面无私。掌纠劾官邪，伸理冤抑，司法之最高长官。",
    historicalFigure: "《红楼梦》中的贾赦（一等将军，约此品级）",
    dailyLife: "审理重大案件，纠劾贪官污吏。主持秋审，复核死刑案件。是维护地方司法公正的关键人物。"
  },
  {
    minSalary: 1200000,
    maxSalary: 1500000,
    level: 21,
    title: "正三品布政使",
    dynasty: "明",
    verdict: "一省行政之长，钱粮、民政总揽，封疆大吏。掌一省之政令，承流宣化，方伯之尊。",
    historicalFigure: "《红楼梦》中的王子腾（京营节度使，后升九省统制）",
    dailyLife: "总揽一省政务，管理赋税、户籍、科举等事务。定期向朝廷汇报，是地方行政的核心人物。"
  },
  {
    minSalary: 1500000,
    maxSalary: 1800000,
    level: 22,
    title: "从二品巡抚",
    dynasty: "明",
    verdict: "节制一省军政，代天巡狩，威震华夏。巡行地方，抚安军民，一省之最高长官。",
    historicalFigure: "《红楼梦》中的贾元春（贤德妃，其家族地位对应）",
    dailyLife: "节制一省文武百官，处理军政大事。巡视各地，考察官员，向皇帝直接奏报。"
  },
  {
    minSalary: 1800000,
    maxSalary: 2400000,
    level: 23,
    title: "正二品总督",
    dynasty: "明",
    verdict: "节制数省，手握重兵，真正的封疆大吏。总揽军政大权，节制文武百官，位极人臣。",
    historicalFigure: "《三国演义》中的荆州牧刘表",
    dailyLife: "统辖数省军政，处理重大军务和边患。可直接向皇帝上奏，是地方最高权力代表。"
  },
  {
    minSalary: 2400000,
    maxSalary: 3000000,
    level: 24,
    title: "从一品尚书",
    dynasty: "明",
    verdict: "六部之首，执掌国政，朝廷之栋梁。吏户礼兵刑工，各有所掌，国之重臣。",
    historicalFigure: "《红楼梦》中的贾政（若升任尚书）",
    dailyLife: "主持部务，参与廷议，向皇帝进言。每日处理大量奏章，是国家行政的中枢人物。"
  },
  {
    minSalary: 3000000,
    maxSalary: 3600000,
    level: 25,
    title: "正一品大学士",
    dynasty: "明",
    verdict: "殿阁大学士，辅弼之臣，一人之下万人之上。入阁办事，参预机务，宰相之尊。",
    historicalFigure: "《三国演义》中的诸葛亮（丞相）",
    dailyLife: "入阁参预机务，票拟奏章，辅佐皇帝处理政务。是朝廷决策的核心人物，权倾朝野。"
  },
  {
    minSalary: 3600000,
    maxSalary: 4800000,
    level: 26,
    title: "亲王",
    dynasty: "明",
    verdict: "天潢贵胄，皇室宗亲，尊贵无比。金枝玉叶，龙子龙孙，天下之至尊至贵。",
    historicalFigure: "《红楼梦》中的北静王",
    dailyLife: "居于王府，享受荣华富贵。参与重大典礼，但需谨守本分，不可干预朝政。"
  },
  {
    minSalary: 4800000,
    maxSalary: 6000000,
    level: 27,
    title: "摄政王",
    dynasty: "明",
    verdict: "代天摄政，总揽朝纲，权倾天下。皇帝年幼，亲王摄政，号令天下，莫敢不从。",
    historicalFigure: "清朝多尔衮（睿亲王，摄政王）",
    dailyLife: "代行皇帝职权，总揽朝政。每日批阅奏章，召见大臣，决策国家大事。"
  },
  {
    minSalary: 6000000,
    maxSalary: 999999999,
    level: 28,
    title: "皇帝",
    dynasty: "明",
    verdict: "九五之尊，天下之主，富有四海。普天之下，莫非王土；率土之滨，莫非王臣。",
    historicalFigure: "《红楼梦》中的皇帝（元春侍奉之主）",
    dailyLife: "清晨上朝听政，批阅奏章，召见大臣。下午读书学习或处理紧急事务。晚上批阅奏章至深夜。"
  }
];

// 根据年薪计算古代身份
export function calculateAncientIdentity(
  annualSalary: number, 
  bonus: number,
  exchangeRate: number = 1000
): LevelMapping & { salaryInTael: number; totalIncome: number } {
  const totalIncome = annualSalary + bonus;
  const salaryInTael = Math.round(totalIncome / exchangeRate);
  
  const mapping = LEVEL_MAPPING.find(
    level => totalIncome >= level.minSalary && totalIncome < level.maxSalary
  ) || LEVEL_MAPPING[LEVEL_MAPPING.length - 1];
  
  return {
    ...mapping,
    salaryInTael,
    totalIncome
  };
}

// 计算购买力清单 - 基于合理的预算分配
// 物品单价参考：大米0.8两/石、猪肉0.02两/斤、鲜鱼0.03两/斤、鸡肉0.04两/斤
// 鸡蛋0.01两/个、食盐0.05两/斤、食油0.08两/斤、茶叶0.3两/斤、酒水0.2两/坛
// 蜡烛0.02两/支、炭火0.5两/篓、笔墨0.3两/套、纸张0.1两/刀
// 棉布0.15两/匹、丝绸1.5两/匹、毛驴4两/头、耕牛12两/头、良马25两/匹
// 红木椅8两/把、普通住宅200两/间、上好寿材50两/副、京郊良田40两/亩
export function calculatePurchasingPower(salaryInTael: number): {
  items: Array<{ 
    name: string; 
    quantity: number; 
    unit: string; 
    image: string;
    modernEquivalent: string;
    isMonthly?: boolean;
    cost: number;       // 该项花费
  }>;
  totalCost: number;    // 总花费
  landArea?: number;
  lifestyle: string;
} {
  const items: Array<{ 
    name: string; 
    quantity: number; 
    unit: string; 
    image: string;
    modernEquivalent: string;
    isMonthly?: boolean;
    cost: number;
  }> = [];
  
  let lifestyle = "";
  let totalCost = 0;
  
  // 根据收入等级确定消费结构
  // 古代家庭消费结构：食物占大头，其次是衣物、日用、储蓄/大宗
  
  if (salaryInTael < 30) {
    // 底层：几乎全部用于食物，勉强糊口
    // 食物 80%，日用 10%，衣物 10%
    const foodBudget = salaryInTael * 0.80;
    const dailyBudget = salaryInTael * 0.10;
    const clothingBudget = salaryInTael * 0.10;
    
    // 食物：主要是大米和少量猪肉
    const riceQty = Math.floor(foodBudget * 0.7 / 0.8);  // 70%买米
    const riceCost = riceQty * 0.8;
    if (riceQty > 0) items.push({ name: "大米", quantity: riceQty, unit: "石/年", image: "/rice-sack.webp", modernEquivalent: `全年口粮约${riceQty * 150}斤`, cost: riceCost });
    
    const porkQty = Math.floor(foodBudget * 0.2 / 0.02); // 20%买肉
    const porkCost = porkQty * 0.02;
    if (porkQty > 0) items.push({ name: "猪肉", quantity: porkQty, unit: "斤/年", image: "/pork.webp", modernEquivalent: `全年约${porkQty}斤，平均每月${Math.floor(porkQty/12)}斤`, cost: porkCost });
    
    const saltQty = Math.floor(foodBudget * 0.1 / 0.05); // 10%买盐
    const saltCost = saltQty * 0.05;
    if (saltQty > 0) items.push({ name: "食盐", quantity: saltQty, unit: "斤/年", image: "/salt.webp", modernEquivalent: `全年食盐`, cost: saltCost });
    
    // 日用：蜡烛
    const candleQty = Math.floor(dailyBudget / 0.02);
    const candleCost = candleQty * 0.02;
    if (candleQty > 0) items.push({ name: "蜡烛", quantity: candleQty, unit: "支/年", image: "/candle.webp", modernEquivalent: "照明用", cost: candleCost });
    
    // 衣物：棉布
    const cottonQty = Math.floor(clothingBudget / 0.15);
    const cottonCost = cottonQty * 0.15;
    if (cottonQty > 0) items.push({ name: "棉布", quantity: cottonQty, unit: "匹/年", image: "/cotton.webp", modernEquivalent: `约${cottonQty * 3}米布`, cost: cottonCost });
    
    totalCost = riceCost + porkCost + saltCost + candleCost + cottonCost;
    lifestyle = "每日粗茶淡饭，一年难得几次荤腥，衣服缝缝补补又三年。";
    
  } else if (salaryInTael < 80) {
    // 下层：温饱有余
    // 食物 65%，日用 15%，衣物 15%，储蓄 5%
    const foodBudget = salaryInTael * 0.65;
    const dailyBudget = salaryInTael * 0.15;
    const clothingBudget = salaryInTael * 0.15;
    
    // 食物
    const riceQty = Math.floor(foodBudget * 0.5 / 0.8);
    const riceCost = riceQty * 0.8;
    items.push({ name: "大米", quantity: riceQty, unit: "石/年", image: "/rice-sack.webp", modernEquivalent: `全年口粮约${riceQty * 150}斤`, cost: riceCost });
    
    const porkQty = Math.floor(foodBudget * 0.2 / 0.02);
    const porkCost = porkQty * 0.02;
    items.push({ name: "猪肉", quantity: porkQty, unit: "斤/年", image: "/pork.webp", modernEquivalent: `平均每月${Math.floor(porkQty/12)}斤`, cost: porkCost });
    
    const fishQty = Math.floor(foodBudget * 0.15 / 0.03);
    const fishCost = fishQty * 0.03;
    items.push({ name: "鲜鱼", quantity: fishQty, unit: "斤/年", image: "/fish.webp", modernEquivalent: `平均每月${Math.floor(fishQty/12)}斤`, cost: fishCost });
    
    const eggQty = Math.floor(foodBudget * 0.1 / 0.01);
    const eggCost = eggQty * 0.01;
    items.push({ name: "鸡蛋", quantity: eggQty, unit: "个/年", image: "/eggs.webp", modernEquivalent: `平均每月${Math.floor(eggQty/12)}个`, cost: eggCost });
    
    const oilQty = Math.floor(foodBudget * 0.05 / 0.08);
    const oilCost = oilQty * 0.08;
    items.push({ name: "食油", quantity: oilQty, unit: "斤/年", image: "/oil.webp", modernEquivalent: `全年食用油`, cost: oilCost });
    
    // 日用
    const candleQty = Math.floor(dailyBudget * 0.5 / 0.02);
    const candleCost = candleQty * 0.02;
    items.push({ name: "蜡烛", quantity: candleQty, unit: "支/年", image: "/candle.webp", modernEquivalent: "照明用", cost: candleCost });
    
    const charcoalQty = Math.floor(dailyBudget * 0.5 / 0.5);
    const charcoalCost = charcoalQty * 0.5;
    if (charcoalQty > 0) items.push({ name: "炭火", quantity: charcoalQty, unit: "篓/年", image: "/brazier.webp", modernEquivalent: "冬季取暖", cost: charcoalCost });
    
    // 衣物
    const cottonQty = Math.floor(clothingBudget / 0.15);
    const cottonCost = cottonQty * 0.15;
    items.push({ name: "棉布", quantity: cottonQty, unit: "匹/年", image: "/cotton.webp", modernEquivalent: `约${cottonQty * 3}米布`, cost: cottonCost });
    
    totalCost = riceCost + porkCost + fishCost + eggCost + oilCost + candleCost + charcoalCost + cottonCost;
    lifestyle = "一日三餐有保障，逢年过节有肉吃，可添置新衣，生活安稳。";
    
  } else if (salaryInTael < 200) {
    // 中层：小康生活
    // 食物 55%，日用 15%，衣物 15%，资产/储蓄 15%
    const foodBudget = salaryInTael * 0.55;
    const dailyBudget = salaryInTael * 0.15;
    const clothingBudget = salaryInTael * 0.15;
    const assetBudget = salaryInTael * 0.15;
    
    // 食物
    const riceQty = Math.floor(foodBudget * 0.35 / 0.8);
    const riceCost = riceQty * 0.8;
    items.push({ name: "大米", quantity: riceQty, unit: "石/年", image: "/rice-sack.webp", modernEquivalent: `全年口粮充足`, cost: riceCost });
    
    const porkQty = Math.floor(foodBudget * 0.2 / 0.02);
    const porkCost = porkQty * 0.02;
    items.push({ name: "猪肉", quantity: porkQty, unit: "斤/年", image: "/pork.webp", modernEquivalent: `平均每月${Math.floor(porkQty/12)}斤`, cost: porkCost });
    
    const fishQty = Math.floor(foodBudget * 0.15 / 0.03);
    const fishCost = fishQty * 0.03;
    items.push({ name: "鲜鱼", quantity: fishQty, unit: "斤/年", image: "/fish.webp", modernEquivalent: `平均每月${Math.floor(fishQty/12)}斤`, cost: fishCost });
    
    const chickenQty = Math.floor(foodBudget * 0.1 / 0.04);
    const chickenCost = chickenQty * 0.04;
    items.push({ name: "鸡肉", quantity: chickenQty, unit: "斤/年", image: "/chicken.webp", modernEquivalent: `平均每月${Math.floor(chickenQty/12)}斤`, cost: chickenCost });
    
    const teaQty = Math.floor(foodBudget * 0.1 / 0.3);
    const teaCost = teaQty * 0.3;
    items.push({ name: "茶叶", quantity: teaQty, unit: "斤/年", image: "/tea.webp", modernEquivalent: `品茶之资`, cost: teaCost });
    
    const wineQty = Math.floor(foodBudget * 0.1 / 0.2);
    const wineCost = wineQty * 0.2;
    items.push({ name: "酒水", quantity: wineQty, unit: "坛/年", image: "/wine.webp", modernEquivalent: `宴饮之用`, cost: wineCost });
    
    // 日用
    const inkQty = Math.floor(dailyBudget * 0.4 / 0.3);
    const inkCost = inkQty * 0.3;
    items.push({ name: "笔墨", quantity: inkQty, unit: "套/年", image: "/ink.webp", modernEquivalent: "文房用品", cost: inkCost });
    
    const charcoalQty = Math.floor(dailyBudget * 0.6 / 0.5);
    const charcoalCost = charcoalQty * 0.5;
    items.push({ name: "炭火", quantity: charcoalQty, unit: "篓/年", image: "/brazier.webp", modernEquivalent: "取暖燃料", cost: charcoalCost });
    
    // 衣物
    const cottonQty = Math.floor(clothingBudget * 0.6 / 0.15);
    const cottonCost = cottonQty * 0.15;
    items.push({ name: "棉布", quantity: cottonQty, unit: "匹/年", image: "/cotton.webp", modernEquivalent: `日常衣料`, cost: cottonCost });
    
    const silkQty = Math.floor(clothingBudget * 0.4 / 1.5);
    const silkCost = silkQty * 1.5;
    if (silkQty > 0) items.push({ name: "丝绸", quantity: silkQty, unit: "匹/年", image: "/silk-roll.webp", modernEquivalent: `体面衣料`, cost: silkCost });
    
    // 资产
    const chairQty = Math.floor(assetBudget / 8);
    const chairCost = chairQty * 8;
    if (chairQty > 0) items.push({ name: "红木椅", quantity: chairQty, unit: "把", image: "/chair.webp", modernEquivalent: "家中摆设", cost: chairCost });
    
    totalCost = riceCost + porkCost + fishCost + chickenCost + teaCost + wineCost + inkCost + charcoalCost + cottonCost + silkCost + chairCost;
    lifestyle = "衣食无忧，可穿丝绸，家中有些摆设，生活体面。";
    
  } else if (salaryInTael < 500) {
    // 中上层：富裕生活
    // 食物 45%，日用 15%，衣物 15%，资产 25%
    const foodBudget = salaryInTael * 0.45;
    const dailyBudget = salaryInTael * 0.15;
    const clothingBudget = salaryInTael * 0.15;
    const assetBudget = salaryInTael * 0.25;
    
    // 食物（丰盛）
    const riceQty = Math.floor(foodBudget * 0.25 / 0.8);
    const riceCost = riceQty * 0.8;
    items.push({ name: "大米", quantity: riceQty, unit: "石/年", image: "/rice-sack.webp", modernEquivalent: `主粮充裕`, cost: riceCost });
    
    const porkQty = Math.floor(foodBudget * 0.2 / 0.02);
    const porkCost = porkQty * 0.02;
    items.push({ name: "猪肉", quantity: porkQty, unit: "斤/年", image: "/pork.webp", modernEquivalent: `平均每月${Math.floor(porkQty/12)}斤`, cost: porkCost });
    
    const fishQty = Math.floor(foodBudget * 0.15 / 0.03);
    const fishCost = fishQty * 0.03;
    items.push({ name: "鲜鱼", quantity: fishQty, unit: "斤/年", image: "/fish.webp", modernEquivalent: `鲜鱼常备`, cost: fishCost });
    
    const chickenQty = Math.floor(foodBudget * 0.15 / 0.04);
    const chickenCost = chickenQty * 0.04;
    items.push({ name: "鸡肉", quantity: chickenQty, unit: "斤/年", image: "/chicken.webp", modernEquivalent: `禽肉丰富`, cost: chickenCost });
    
    const teaQty = Math.floor(foodBudget * 0.15 / 0.3);
    const teaCost = teaQty * 0.3;
    items.push({ name: "茶叶", quantity: teaQty, unit: "斤/年", image: "/tea.webp", modernEquivalent: `上等茶叶`, cost: teaCost });
    
    const wineQty = Math.floor(foodBudget * 0.1 / 0.2);
    const wineCost = wineQty * 0.2;
    items.push({ name: "酒水", quantity: wineQty, unit: "坛/年", image: "/wine.webp", modernEquivalent: `美酒佳酿`, cost: wineCost });
    
    // 日用
    const inkQty = Math.floor(dailyBudget * 0.3 / 0.3);
    const inkCost = inkQty * 0.3;
    items.push({ name: "笔墨", quantity: inkQty, unit: "套/年", image: "/ink.webp", modernEquivalent: "上等文房", cost: inkCost });
    
    const paperQty = Math.floor(dailyBudget * 0.2 / 0.1);
    const paperCost = paperQty * 0.1;
    items.push({ name: "纸张", quantity: paperQty, unit: "刀/年", image: "/paper.webp", modernEquivalent: "书写用纸", cost: paperCost });
    
    const charcoalQty = Math.floor(dailyBudget * 0.5 / 0.5);
    const charcoalCost = charcoalQty * 0.5;
    items.push({ name: "炭火", quantity: charcoalQty, unit: "篓/年", image: "/brazier.webp", modernEquivalent: "取暖充足", cost: charcoalCost });
    
    // 衣物
    const cottonQty = Math.floor(clothingBudget * 0.4 / 0.15);
    const cottonCost = cottonQty * 0.15;
    items.push({ name: "棉布", quantity: cottonQty, unit: "匹/年", image: "/cotton.webp", modernEquivalent: `常服衣料`, cost: cottonCost });
    
    const silkQty = Math.floor(clothingBudget * 0.6 / 1.5);
    const silkCost = silkQty * 1.5;
    items.push({ name: "丝绸", quantity: silkQty, unit: "匹/年", image: "/silk-roll.webp", modernEquivalent: `绫罗绸缎`, cost: silkCost });
    
    // 资产
    const horseQty = Math.floor(assetBudget * 0.5 / 25);
    const horseCost = horseQty * 25;
    if (horseQty > 0) items.push({ name: "良马", quantity: horseQty, unit: "匹", image: "/horse.webp", modernEquivalent: "出行代步", cost: horseCost });
    
    const chairQty = Math.floor(assetBudget * 0.3 / 8);
    const chairCost = chairQty * 8;
    if (chairQty > 0) items.push({ name: "红木椅", quantity: chairQty, unit: "把", image: "/chair.webp", modernEquivalent: "厅堂家具", cost: chairCost });
    
    const coffinQty = Math.floor(assetBudget * 0.2 / 50);
    const coffinCost = coffinQty * 50;
    if (coffinQty > 0) items.push({ name: "上好寿材", quantity: coffinQty, unit: "副", image: "/coffin.webp", modernEquivalent: "备置后事", cost: coffinCost });
    
    totalCost = riceCost + porkCost + fishCost + chickenCost + teaCost + wineCost + inkCost + paperCost + charcoalCost + cottonCost + silkCost + horseCost + chairCost + coffinCost;
    lifestyle = "锦衣玉食，出门有马，家中陈设精美，生活富足。";
    
  } else {
    // 高层：权贵生活
    // 食物 35%，日用 15%，衣物 15%，资产/田产 35%
    const foodBudget = salaryInTael * 0.35;
    const dailyBudget = salaryInTael * 0.15;
    const clothingBudget = salaryInTael * 0.15;
    const assetBudget = salaryInTael * 0.35;
    
    // 食物（山珍海味）
    const riceQty = Math.floor(foodBudget * 0.2 / 0.8);
    const riceCost = riceQty * 0.8;
    items.push({ name: "大米", quantity: riceQty, unit: "石/年", image: "/rice-sack.webp", modernEquivalent: `上等精米`, cost: riceCost });
    
    const porkQty = Math.floor(foodBudget * 0.2 / 0.02);
    const porkCost = porkQty * 0.02;
    items.push({ name: "猪肉", quantity: porkQty, unit: "斤/年", image: "/pork.webp", modernEquivalent: `肉食丰盛`, cost: porkCost });
    
    const fishQty = Math.floor(foodBudget * 0.15 / 0.03);
    const fishCost = fishQty * 0.03;
    items.push({ name: "鲜鱼", quantity: fishQty, unit: "斤/年", image: "/fish.webp", modernEquivalent: `河鲜海鲜`, cost: fishCost });
    
    const chickenQty = Math.floor(foodBudget * 0.15 / 0.04);
    const chickenCost = chickenQty * 0.04;
    items.push({ name: "鸡肉", quantity: chickenQty, unit: "斤/年", image: "/chicken.webp", modernEquivalent: `鸡鸭鹅禽`, cost: chickenCost });
    
    const teaQty = Math.floor(foodBudget * 0.15 / 0.3);
    const teaCost = teaQty * 0.3;
    items.push({ name: "茶叶", quantity: teaQty, unit: "斤/年", image: "/tea.webp", modernEquivalent: `贡品名茶`, cost: teaCost });
    
    const wineQty = Math.floor(foodBudget * 0.15 / 0.2);
    const wineCost = wineQty * 0.2;
    items.push({ name: "酒水", quantity: wineQty, unit: "坛/年", image: "/wine.webp", modernEquivalent: `陈年佳酿`, cost: wineCost });
    
    // 日用
    const inkQty = Math.floor(dailyBudget * 0.3 / 0.3);
    const inkCost = inkQty * 0.3;
    items.push({ name: "笔墨", quantity: inkQty, unit: "套/年", image: "/ink.webp", modernEquivalent: "上等湖笔徽墨", cost: inkCost });
    
    const paperQty = Math.floor(dailyBudget * 0.2 / 0.1);
    const paperCost = paperQty * 0.1;
    items.push({ name: "纸张", quantity: paperQty, unit: "刀/年", image: "/paper.webp", modernEquivalent: "宣纸用纸", cost: paperCost });
    
    const charcoalQty = Math.floor(dailyBudget * 0.5 / 0.5);
    const charcoalCost = charcoalQty * 0.5;
    items.push({ name: "炭火", quantity: charcoalQty, unit: "篓/年", image: "/brazier.webp", modernEquivalent: "银骨炭火", cost: charcoalCost });
    
    // 衣物
    const cottonQty = Math.floor(clothingBudget * 0.2 / 0.15);
    const cottonCost = cottonQty * 0.15;
    items.push({ name: "棉布", quantity: cottonQty, unit: "匹/年", image: "/cotton.webp", modernEquivalent: `仆役衣料`, cost: cottonCost });
    
    const silkQty = Math.floor(clothingBudget * 0.8 / 1.5);
    const silkCost = silkQty * 1.5;
    items.push({ name: "丝绸", quantity: silkQty, unit: "匹/年", image: "/silk-roll.webp", modernEquivalent: `锦衣华服`, cost: silkCost });
    
    // 资产
    const horseQty = Math.floor(assetBudget * 0.3 / 25);
    const horseCost = horseQty * 25;
    if (horseQty > 0) items.push({ name: "良马", quantity: horseQty, unit: "匹", image: "/horse.webp", modernEquivalent: "车马出行", cost: horseCost });
    
    const oxQty = Math.floor(assetBudget * 0.15 / 12);
    const oxCost = oxQty * 12;
    if (oxQty > 0) items.push({ name: "耕牛", quantity: oxQty, unit: "头", image: "/ox.webp", modernEquivalent: "田庄耕作", cost: oxCost });
    
    const houseQty = Math.floor(assetBudget * 0.4 / 200);
    const houseCost = houseQty * 200;
    if (houseQty > 0) items.push({ name: "普通住宅", quantity: houseQty, unit: "间", image: "/house.webp", modernEquivalent: "置办产业", cost: houseCost });
    
    const chairQty = Math.floor(assetBudget * 0.1 / 8);
    const chairCost = chairQty * 8;
    if (chairQty > 0) items.push({ name: "红木椅", quantity: chairQty, unit: "把", image: "/chair.webp", modernEquivalent: "名贵家具", cost: chairCost });
    
    const coffinQty = Math.floor(assetBudget * 0.05 / 50);
    const coffinCost = coffinQty * 50;
    if (coffinQty > 0) items.push({ name: "上好寿材", quantity: coffinQty, unit: "副", image: "/coffin.webp", modernEquivalent: "金丝楠木", cost: coffinCost });
    
    totalCost = riceCost + porkCost + fishCost + chickenCost + teaCost + wineCost + inkCost + paperCost + charcoalCost + cottonCost + silkCost + horseCost + oxCost + houseCost + chairCost + coffinCost;
    lifestyle = "钟鸣鼎食，仆役成群，出门车马相随，真正的富贵人家。";
  }
  
  // 过滤掉数量为0的物品
  const filteredItems = items.filter(item => item.quantity > 0);
  
  const landArea = Math.floor(salaryInTael / 40);
  
  return { items: filteredItems, totalCost, landArea, lifestyle };
}

// ========== 新版：基于职业大类的映射（从 types 导入） ==========

// 获取职业大类配置
export function getOccupationTypeConfig(occupationType: string) {
  return OCCUPATION_TYPE_OPTIONS.find(opt => opt.value === occupationType) || OCCUPATION_TYPE_OPTIONS[0];
}

// 旧版接口保持兼容（已废弃，仅为兼容性保留）
export interface OccupationConfig {
  keywords: string[];
  ancientRole: string;
  ancientDesc: string;
  dailyActivities: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  verdictPrefix: string;
}

// ========== 新版每日生活生成（使用场景生成器） ==========

export interface GeneratedDailyLife {
  morning: string;
  afternoon: string;
  evening: string;
  mood?: string;
}

// 新版：使用决策树场景生成器生成每日生活
export function generateDailyLife(
  userInput: UserInput,
  level: number
): GeneratedDailyLife {
  // 调用新的场景生成器
  const scene = generateScene(userInput, level);
  return {
    morning: scene.morning,
    afternoon: scene.afternoon,
    evening: scene.evening,
    mood: scene.mood,
  };
}

// 根据用户输入生成个性化评语
export function generatePersonalizedComment(
  userInput: UserInput
): string {
  const parts: string[] = [];
  
  // 注意：职业特色描述已在"古今对照"部分显示，此处不再重复
  
  // 工作年限描述
  const workYearsDesc: Record<string, string> = {
    '0-1': '初入此道，虽有热忱却经验尚浅',
    '1-3': '历练数载，已能独当一面',
    '3-5': '技艺日精，堪当大任',
    '5-8': '经验老到，乃同侪之翘楚',
    '8-15': '资深行家，后辈争相请教',
    '15+': '此道宗师，德高望重'
  };
  parts.push(workYearsDesc[userInput.workYears] || '');
  
  // 工作环境与福利结合描述
  const envBenefitCombined: Record<string, Record<string, string>> = {
    'remote': {
      'excellent': '居家办公，恩遇优渥，不出门户而坐收厚禄',
      'good': '深居简出，待遇尚可，图个清静自在',
      'average': '虽省了车马劳顿，奈何俸禄平平',
      'poor': '在家苦熬，收入微薄，日子捉襟见肘'
    },
    'office': {
      'excellent': '高堂广厦，锦衣玉食，朝廷恩宠有加',
      'good': '正俸按时，偶有赏赐，生活安稳体面',
      'average': '仅有正俸，精打细算，勉强度日',
      'poor': '俸禄微薄，入不敷出，苦不堪言'
    },
    'hybrid': {
      'excellent': '亦官亦隐，进退自如，恩遇优厚',
      'good': '动静皆宜，待遇不薄，倒也逍遥',
      'average': '时而奔波时而闲，收入平平',
      'poor': '两头跑却两头空，甚是辛苦'
    },
    'outdoor': {
      'excellent': '虽风餐露宿，然赏赐丰厚，苦中有甜',
      'good': '披星戴月，好在俸禄尚可，不负辛劳',
      'average': '在外奔波，收入一般，聊以糊口',
      'poor': '风吹日晒，所得甚微，实在艰辛'
    }
  };
  
  const envBenefitDesc = envBenefitCombined[userInput.workEnv]?.[userInput.benefits];
  if (envBenefitDesc) {
    parts.push(envBenefitDesc);
  }
  
  // 城市级别描述
  const cityDesc: Record<string, string> = {
    '1': '身居京师，寸土寸金，压力山大',
    '2': '居于省城，繁华之地，机遇与挑战并存',
    '3': '住在府城，商贾云集，生活便利',
    '4': '居于县城，节奏舒缓，安居乐业',
    '5': '身处乡野，宁静致远，别有天地'
  };
  parts.push(cityDesc[userInput.cityTier] || '');
  
  // 加班频率描述
  const overtimeDesc: Record<string, string> = {
    'flex': '弹性自由，逍遥自在',
    'normal': '按时收工，朝九晚六，难得悠闲',
    'occasional': '月末年末偶有忙碌，尚能接受',
    'frequent': '常需加班，日夜操劳，甚是辛苦',
    '996': '早九晚九，周六亦不得闲，苦不堪言',
    'extreme': '终日忙碌，焚膏继晷，不知休息为何物'
  };
  parts.push(overtimeDesc[userInput.overtimeFreq] || '');
  
  return parts.filter(Boolean).join('；');
}

// 生成增强版判词（在基础判词上叠加个性化修饰）
export function generateEnhancedVerdict(
  baseVerdict: string,
  userInput: UserInput
): string {
  const occupationConfig = getOccupationTypeConfig(userInput.occupationType);
  
  // 根据工作年限选择修饰语
  const yearsModifier: Record<string, string> = {
    '0-1': '虽为新进，',
    '1-3': '已有小成，',
    '3-5': '渐入佳境，',
    '5-8': '积年历练，',
    '8-15': '久经沙场，',
    '15+': '阅历丰富，'
  };
  
  // 根据福利选择修饰语
  const benefitsModifier: Record<string, string> = {
    'excellent': '恩遇优渥，',
    'good': '待遇尚可，',
    'average': '虽俸禄平平，',
    'poor': '虽清贫度日，'
  };
  
  // 组合修饰语：职业描述 + 年限 + 福利
  let prefix = `身为${occupationConfig.ancientRole}，${occupationConfig.desc}。`;
  prefix += yearsModifier[userInput.workYears] || '';
  prefix += benefitsModifier[userInput.benefits] || '';
  
  // 在判词中插入个性化内容
  const enhancedVerdict = prefix + baseVerdict;
  
  return enhancedVerdict;
}

// ========== 旧版接口兼容（已废弃但保留导出） ==========

// 旧版 matchOccupation - 已废弃，仅为向后兼容
export function matchOccupation(_occupation: string): { ancientRole: string; ancientDesc: string; verdictPrefix: string } {
  // 简单返回默认值，不再做关键词匹配
  return {
    ancientRole: '市井闲人',
    ancientDesc: '混迹于市井之间',
    verdictPrefix: '勤勉本分，'
  };
}

// 旧版 DEFAULT_OCCUPATION - 已废弃
export const DEFAULT_OCCUPATION = {
  keywords: [],
  ancientRole: '市井闲人',
  ancientDesc: '混迹于市井之间',
  dailyActivities: { morning: [], afternoon: [], evening: [] },
  verdictPrefix: '勤勉本分，'
};
