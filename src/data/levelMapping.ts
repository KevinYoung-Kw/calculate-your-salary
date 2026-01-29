import type { LevelMapping, UserInput } from '@/types';
import { generateScene } from './sceneGenerator';
import { 
  calculateQualityOfLife,
  normalizeQoL,
  adjustLevelByQoL,
  getQoLComment,
  getQoLStars,
  getSpecialComboDesc,
  OVERTIME_DESC,
  YEARS_DESC,
} from './roleMapping';

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

// 75级职业进阶映射表 - 严格遵循明朝官吏体系
export const LEVEL_MAPPING: LevelMapping[] = [
  // ====== 平民阶段 (L0-L14) ======
  {
    minSalary: 0,
    maxSalary: 12000,
    level: 0,
    title: "流民",
    dynasty: "明",
    verdict: "衣食无着，苟活于市井，实乃乱世之浮萍。居无定所，食不果腹，朝不保夕，诚为天下至苦之人。",
    historicalFigure: "秦末陈胜",
    dailyLife: "清晨在街头寻找零工机会，中午可能只能喝上一碗稀粥，晚上栖身于破庙或桥洞之下。"
  },
  {
    minSalary: 12000,
    maxSalary: 24000,
    level: 1,
    title: "雇工",
    dynasty: "明",
    verdict: "为人作工，勉强糊口，虽有微薄之资，终日劳碌不得闲。朝出暮归，仅够养家糊口。",
    historicalFigure: "汉初韩信（年少贫困，常寄食于人）",
    dailyLife: "天未亮便出门，在工坊或田间劳作，日落后拖着疲惫的身躯回家，所得工钱仅够温饱。"
  },
  {
    minSalary: 24000,
    maxSalary: 36000,
    level: 2,
    title: "学徒",
    dynasty: "明",
    verdict: "初入匠门，学艺三年，虽无工钱，却有一技之长可期。师傅严苛，日夜操练，盼早日出师。",
    historicalFigure: "宋代毕昇（活字印刷发明者，学徒出身）",
    dailyLife: "清晨起床打扫作坊，白天跟随师傅学艺，晚上练习手艺，偶尔得师傅赏赐些许铜钱。"
  },
  {
    minSalary: 36000,
    maxSalary: 48000,
    level: 3,
    title: "小工",
    dynasty: "明",
    verdict: "力气活计，日晒雨淋，虽辛苦却有固定进项。挑水搬货，修桥铺路，皆是本分营生。",
    historicalFigure: "唐代杜甫（晚年贫困潦倒，'茅屋为秋风所破'）",
    dailyLife: "凌晨在码头等活，白天搬运货物，傍晚收工，所得工钱当日结清，勉强度日。"
  },
  {
    minSalary: 48000,
    maxSalary: 60000,
    level: 4,
    title: "杂役",
    dynasty: "明",
    verdict: "打杂跑腿，听人差遣，虽卑微却有立足之地。洒扫庭除，传递文书，一应杂务皆归吾等。",
    historicalFigure: "东汉班超（初为官府抄书吏，后投笔从戎）",
    dailyLife: "在府衙或大户人家当差，打扫卫生、传递消息、跑腿办事，月底领取工钱。"
  },
  {
    minSalary: 60000,
    maxSalary: 72000,
    level: 5,
    title: "伙计",
    dynasty: "明",
    verdict: "店铺伙计，迎来送往，虽辛劳却有体面。包吃包住，月有工钱，乃市井中较为安稳之职。",
    historicalFigure: "明初沈万三（早年为伙计，后成首富）",
    dailyLife: "清晨开门打扫，白天招呼客人，晚上盘点货物，东家供应三餐，月底发放工钱。"
  },
  {
    minSalary: 72000,
    maxSalary: 84000,
    level: 6,
    title: "店铺伙计",
    dynasty: "明",
    verdict: "颇有资历之伙计，深得掌柜信任，已能独当一面。算账记账，看管店铺，月钱渐丰。",
    historicalFigure: "清代乔致庸（早年在家族商号学徒）",
    dailyLife: "协助掌柜管理店铺，招呼客人，记账算账，偶尔可得东家赏赐，生活渐趋安稳。"
  },
  {
    minSalary: 84000,
    maxSalary: 96000,
    level: 7,
    title: "小贩",
    dynasty: "明",
    verdict: "走街串巷，自谋生路，虽无人管束，却也风餐露宿。担货叫卖，赚些蝇头小利，聊以度日。",
    historicalFigure: "战国苏秦（游说前穷困潦倒，头悬梁锥刺股）",
    dailyLife: "凌晨去集市进货，天亮开始沿街叫卖，中午在街边简单果腹，傍晚收摊回家清点一日所得。"
  },
  {
    minSalary: 96000,
    maxSalary: 108000,
    level: 8,
    title: "力役脚夫",
    dynasty: "明",
    verdict: "筋骨强健，以力气谋生，虽劳苦却收入尚可。挑担搬货，日行百里，汗水换来温饱。",
    historicalFigure: "汉代朱买臣（挑柴度日，后拜会稽太守）",
    dailyLife: "清晨在码头或驿站等活，白天挑货赶路，晚上在客栈歇脚，按里程计钱。"
  },
  {
    minSalary: 108000,
    maxSalary: 120000,
    level: 9,
    title: "工匠",
    dynasty: "明",
    verdict: "手艺精湛，凭技吃饭，乃百工之列。木工、铁匠、泥瓦匠，各有所长，受人敬重。",
    historicalFigure: "春秋鲁班（木匠祖师，发明多种工具）",
    dailyLife: "在作坊中专心制作，按件计酬。活计精细则价高，口碑相传，订单不断。"
  },
  {
    minSalary: 120000,
    maxSalary: 132000,
    level: 10,
    title: "资深工匠",
    dynasty: "明",
    verdict: "技艺纯熟，名声在外，已是本地一方之匠首。带徒传艺，订单盈门，生活小康。",
    historicalFigure: "宋代黄道婆（革新纺织技术，'衣被天下'）",
    dailyLife: "在自己的作坊中指导徒弟，接些高价活计，闲时与同行切磋技艺，颇有体面。"
  },
  {
    minSalary: 132000,
    maxSalary: 144000,
    level: 11,
    title: "小商人",
    dynasty: "明",
    verdict: "有些本钱，做些小买卖，货通南北，利薄多销。虽非大富，亦有恒产，足以安身立命。",
    historicalFigure: "汉代卓王孙（蜀中富商，卓文君之父）",
    dailyLife: "早起查看货源，白天经营店铺，晚上盘算账目，与同行交流行情，谋划如何扩大生意。"
  },
  {
    minSalary: 144000,
    maxSalary: 156000,
    level: 12,
    title: "小掌柜",
    dynasty: "明",
    verdict: "自有铺面，雇佣伙计，已是小有产业。经营有道，客源稳定，乡里颇有名气。",
    historicalFigure: "清代胡雪岩（早年为钱庄学徒掌柜）",
    dailyLife: "不必亲自站柜台，指挥伙计经营，查看账目，与客户应酬，偶尔进货采买。"
  },
  {
    minSalary: 156000,
    maxSalary: 168000,
    level: 13,
    title: "富户",
    dynasty: "明",
    verdict: "家资殷实，田产店铺皆有，一方之殷实人家。不愁吃穿，子弟可供读书，乡里称羡。",
    historicalFigure: "东晋陶渊明（辞官归隐，有田产数十亩）",
    dailyLife: "不必亲自劳作，管理家中产业和仆人，与乡绅往来，参与地方事务，生活富足。"
  },
  {
    minSalary: 168000,
    maxSalary: 180000,
    level: 14,
    title: "小地主",
    dynasty: "明",
    verdict: "薄有田产，收租为生，虽无官职却也体面。田连阡陌数十亩，佃户数家，岁入稳定。",
    historicalFigure: "明代归有光（乡居教书，著有《项脊轩志》）",
    dailyLife: "农忙时巡视田地，收租时查验谷物，闲时与乡绅聚会，商议乡里大事。"
  },
  // ====== 吏员阶段 (L15-L23) - 无品级 ======
  {
    minSalary: 180000,
    maxSalary: 192000,
    level: 15,
    title: "衙役",
    dynasty: "明",
    verdict: "初入衙门，虽无品级，却也是公门中人。站堂喝道，传递文书，月有工钱，生活安稳。年俸约50两，实际收入约180两。",
    historicalFigure: "明代沈炼（锦衣卫校尉，后为御史）",
    dailyLife: "清晨到衙门当值，站堂时喝道威风，平日传递公文，跑腿办事，月底领取工钱。"
  },
  {
    minSalary: 192000,
    maxSalary: 204000,
    level: 16,
    title: "捕快",
    dynasty: "明",
    verdict: "捕盗缉凶，维护治安，虽是吏员却颇有威风。手持铁尺，腰悬铜牌，乡里皆知。年俸约60两，实际收入约190两。",
    historicalFigure: "宋代宋慈（法医鼻祖，著《洗冤集录》）",
    dailyLife: "巡查街市，缉拿盗贼，审讯犯人。夜间需值夜巡逻，遇有要案需星夜赶路。"
  },
  {
    minSalary: 204000,
    maxSalary: 216000,
    level: 17,
    title: "书吏",
    dynasty: "明",
    verdict: "刀笔之吏，文案娴熟，衙门之根基也。案牍劳形，笔墨为生，虽无品级，实掌权柄。年俸约70两，实际收入约210两。",
    historicalFigure: "唐代刘禹锡（初任书吏，后为诗豪）",
    dailyLife: "起草公文、整理案卷、协助审案。熟悉律法条文，常为百姓代写状纸，收取润笔之资。"
  },
  {
    minSalary: 216000,
    maxSalary: 228000,
    level: 18,
    title: "门子",
    dynasty: "明",
    verdict: "守卫衙门，迎来送往，乃衙门之颜面。虽是吏员，却见多识广，人情练达。年俸约80两，实际收入约220两。",
    historicalFigure: "宋代司马光（少年曾任门子，后为宰相）",
    dailyLife: "站在衙门口迎接官员，通报来访者，传递消息，收取门包，颇有油水。"
  },
  {
    minSalary: 228000,
    maxSalary: 240000,
    level: 19,
    title: "账房",
    dynasty: "明",
    verdict: "掌管钱粮，账目清晰，乃衙门之要职。虽无品级，然东家倚重，手握财权。年俸约90两，实际收入约230两。",
    historicalFigure: "汉代司马迁（初任太史令，著《史记》）",
    dailyLife: "每日核对进出账目，月底汇总报表，管理库银，责任重大但颇有实权。"
  },
  {
    minSalary: 240000,
    maxSalary: 270000,
    level: 20,
    title: "师爷",
    dynasty: "明",
    verdict: "幕僚之职，运筹帷幄，知县之左膀右臂。刑名钱谷，无所不精，幕后之智囊也。年俸约100两，实际收入约250两。",
    historicalFigure: "清代纪晓岚（曾任幕僚，后编《四库全书》）",
    dailyLife: "居于知县幕后，为其出谋划策。审案时在一旁记录，闲暇时研读律法，是知县最信任的人。"
  },
  {
    minSalary: 270000,
    maxSalary: 300000,
    level: 21,
    title: "主簿",
    dynasty: "明",
    verdict: "一县之管勾，钱粮之总揽，实权在握。佐理县政，分掌簿籍，知县之得力助手。年俸约120两，实际收入约280两。",
    historicalFigure: "宋代宋江（郓城县押司）",
    dailyLife: "管理一县的户籍、赋税、徭役等事务。每日处理大量文书，是县政运转的关键人物。"
  },
  {
    minSalary: 300000,
    maxSalary: 330000,
    level: 22,
    title: "押司",
    dynasty: "明",
    verdict: "掌管文书，分理政务，县衙之要员。虽是吏员，然权柄日重，知县倚为臂膀。年俸约140两，实际收入约310两。",
    historicalFigure: "汉代萧何（初为沛县主吏掾，后为丞相）",
    dailyLife: "负责起草文书，整理案卷，传达政令。常需陪同知县审案，是县衙的实际办事人员。"
  },
  {
    minSalary: 330000,
    maxSalary: 360000,
    level: 23,
    title: "大掌柜",
    dynasty: "明",
    verdict: "经营有道，生意兴隆，已是一方之富商。雇佣伙计数十，店铺连锁，财源广进。与吏员同等收入，却无公门束缚。",
    historicalFigure: "清代张謇（状元实业家，创办大生纱厂）",
    dailyLife: "不必亲自站柜台，管理多家店铺，与官府往来，参与商会事务，生活富足。"
  },
  // ====== 有品级官员阶段 (L24起) ======
  // 九品官 (L24-L28)
  {
    minSalary: 360000,
    maxSalary: 400000,
    level: 24,
    title: "从九品·典史",
    dynasty: "明",
    verdict: "初入流内，虽为末品，已脱吏员之列。典掌狱讼，协理刑名，县衙之佐贰也。正俸60两，加火耗门包等灰色收入，实得约360两。",
    historicalFigure: "明代海瑞（初任南平县教谕典史）",
    dailyLife: "在县衙负责监狱管理和刑名事务，协助知县审案，虽品级最低，但已是朝廷命官，穿官服戴官帽。"
  },
  {
    minSalary: 400000,
    maxSalary: 450000,
    level: 25,
    title: "正九品·巡检",
    dynasty: "明",
    verdict: "巡查地方，缉捕盗贼，维护一方治安。正俸60两，实际年俸约420两，已是父母官之列。",
    historicalFigure: "明代戚继光（早年任登州卫指挥佥事）",
    dailyLife: "带领弓兵巡查辖区，缉拿盗贼，维护治安。遇有要案需向知县禀报，是地方治安的第一道防线。"
  },
  {
    minSalary: 450000,
    maxSalary: 500000,
    level: 26,
    title: "从九品·教谕",
    dynasty: "明",
    verdict: "掌教一县，传道授业，乃文教之官。虽品级不高，然桃李满天下，深受敬重。正俸60两，实际约470两。",
    historicalFigure: "宋代程颐（二程之一，曾任县学教授）",
    dailyLife: "在县学教授生员，主持童生考试，管理学田学产。是一县文教之首，颇受儒生敬重。"
  },
  {
    minSalary: 500000,
    maxSalary: 550000,
    level: 27,
    title: "正九品·训导",
    dynasty: "明",
    verdict: "协理学政，教化士子，文教副职。协助教谕管理县学，正俸60两，实际约530两。",
    historicalFigure: "宋代朱熹（早年任同安县主簿）",
    dailyLife: "辅助教谕管理县学，教授生员，批改文章，是县学的重要教官。"
  },
  {
    minSalary: 550000,
    maxSalary: 600000,
    level: 28,
    title: "富商",
    dynasty: "明",
    verdict: "生意兴隆，财源广进，虽无官职却富甲一方。店铺数家，伙计成群，与九品官同等收入却无公务缠身。",
    historicalFigure: "春秋范蠡（弃政从商，成为陶朱公）",
    dailyLife: "管理多家店铺，与官府往来密切，参与商会事务，出资赈灾获得善名，生活优渥。"
  },
  // 八品官 (L29-L34)
  {
    minSalary: 600000,
    maxSalary: 700000,
    level: 29,
    title: "从八品·县丞",
    dynasty: "明",
    verdict: "佐贰之职，辅助知县，一县之第二把交椅。正俸70两，实际约600两，仕途之起步也。",
    historicalFigure: "唐代白居易（初任盩厔县尉）",
    dailyLife: "协助知县处理政务，分管某些具体事务。可代行知县职权，是晋升知县的重要台阶。"
  },
  {
    minSalary: 700000,
    maxSalary: 800000,
    level: 30,
    title: "正八品·州同",
    dynasty: "明",
    verdict: "协理州政，辅佐知州，已入中上品阶。正俸80两，实际约720两，职权渐重。",
    historicalFigure: "明朝州同",
    dailyLife: "协助知州管理州务，处理民事纠纷，巡查所辖地方，是州府的重要佐官。"
  },
  {
    minSalary: 800000,
    maxSalary: 900000,
    level: 31,
    title: "从八品·学正",
    dynasty: "明",
    verdict: "主理学政，教化士子，文教之官。正俸75两，实际约850两，桃李满门，颇受敬重。",
    historicalFigure: "明代王阳明（早年任县学教谕）",
    dailyLife: "主持州学，教授生员，主持乡试初选，是地方文教的重要官员。"
  },
  {
    minSalary: 900000,
    maxSalary: 1000000,
    level: 32,
    title: "正八品·教授",
    dynasty: "明",
    verdict: "教授生员，传道授业，文教正职。正俸80两，实际约950两，是府学之长。",
    historicalFigure: "宋代范仲淹（初任教授，后为宰相）",
    dailyLife: "主持府学，教授生员，参与科举考试，是一府文教的掌门人。"
  },
  {
    minSalary: 1000000,
    maxSalary: 1100000,
    level: 33,
    title: "从八品·训导",
    dynasty: "明",
    verdict: "协理学政，教化士子，文教副职。正俸75两，实际约1050两，辅助教授管理府学。",
    historicalFigure: "宋代欧阳修（初任馆阁校勘）",
    dailyLife: "辅助教授管理府学，教授生员，批改文章，协助科举考务。"
  },
  {
    minSalary: 1100000,
    maxSalary: 1200000,
    level: 34,
    title: "大商人",
    dynasty: "明",
    verdict: "富甲一方，货通天下，虽无官职却财力雄厚。与八品官同等收入，店铺遍布，财源滚滚。",
    historicalFigure: "明代沈万三（江南首富，助建南京城墙）",
    dailyLife: "管理庞大商业帝国，与官府关系密切，参与朝廷采买，出资赈灾获得善名。"
  },
  // 七品官 (L35-L40)
  {
    minSalary: 1200000,
    maxSalary: 1500000,
    level: 35,
    title: "从七品·县令",
    dynasty: "明",
    verdict: "一县之长，父母官也，已是真正的牧民之官。正俸90两，加火耗等灰色收入，实际约1300两。",
    historicalFigure: "唐代柳宗元（初任蓝田县尉）",
    dailyLife: "晨起升堂问案，处理民事纠纷，下午批阅公文，接见乡绅，晚上研读律法。"
  },
  {
    minSalary: 1500000,
    maxSalary: 1800000,
    level: 36,
    title: "正七品·知县",
    dynasty: "明",
    verdict: "牧民之官，一县之主，百姓之父母也。正俸45两，加养廉银等实际约1650两，权柄日重，威震一方。",
    historicalFigure: "宋代包拯（初任天长县知县，'包青天'）",
    dailyLife: "晨起升堂问案，处理民事纠纷。下午批阅公文，接见乡绅。晚上研读律法，准备次日公务。"
  },
  {
    minSalary: 1800000,
    maxSalary: 2100000,
    level: 37,
    title: "从七品·评事",
    dynasty: "明",
    verdict: "掌评理刑名，审理案件，乃司法之官。正俸90两，实际约1950两，执法如山，铁面无私。",
    historicalFigure: "明朝大理寺评事",
    dailyLife: "审理各类案件，评议刑名，复核判决，是朝廷司法体系的重要一环。"
  },
  {
    minSalary: 2100000,
    maxSalary: 2400000,
    level: 38,
    title: "正七品·推官",
    dynasty: "明",
    verdict: "推问刑狱，明察秋毫，司法之能臣。正俸90两，实际约2250两，执掌一方司法大权。",
    historicalFigure: "明朝推官",
    dailyLife: "审理重大案件，推问刑狱，复核判决，向上级汇报疑难案件。"
  },
  {
    minSalary: 2400000,
    maxSalary: 2700000,
    level: 39,
    title: "从七品·州判",
    dynasty: "明",
    verdict: "协理州政，分掌刑名，州府之佐官。正俸90两，实际约2550两，职权日重。",
    historicalFigure: "明朝州判",
    dailyLife: "协助知州管理州务，主要负责刑名案件，是州府的重要佐官。"
  },
  {
    minSalary: 2700000,
    maxSalary: 3000000,
    level: 40,
    title: "豪商巨贾",
    dynasty: "明",
    verdict: "富可敌国，货通天下，虽无官职却富甲天下。与七品官同等收入，生意遍及海内外，财力雄厚。",
    historicalFigure: "清代胡雪岩（红顶商人，富可敌国）",
    dailyLife: "管理庞大商业帝国，结交权贵，参与朝廷采买，出资公益获得名望，生活极尽奢华。"
  },
  // 六品官 (L41-L45)
  {
    minSalary: 3000000,
    maxSalary: 3500000,
    level: 41,
    title: "从六品·主事",
    dynasty: "明",
    verdict: "六部主事，掌理部务，朝廷之中坚。正俸105两，实际约3200两，已入京官行列。",
    historicalFigure: "清代曾国藩（初任翰林院检讨）",
    dailyLife: "在六部衙门办公，处理部务文书，参与政策制定，是朝廷中枢的重要官员。"
  },
  {
    minSalary: 3500000,
    maxSalary: 4000000,
    level: 42,
    title: "正六品·通判",
    dynasty: "明",
    verdict: "佐理府政，分掌粮运、督捕，权柄日重。正俸120两，实际约3700两，府之要员也。",
    historicalFigure: "明朝通判",
    dailyLife: "分管专项事务，如粮运、河工、治安等，常需下乡巡查，督促地方政务。"
  },
  {
    minSalary: 4000000,
    maxSalary: 4500000,
    level: 43,
    title: "从六品·都事",
    dynasty: "明",
    verdict: "掌管文书，协理政务，朝廷之枢要。正俸110两，实际约4200两，参与机密要务。",
    historicalFigure: "明朝都事",
    dailyLife: "在都察院或六部掌管文书，协理政务，传达圣旨，是朝廷运转的重要环节。"
  },
  {
    minSalary: 4500000,
    maxSalary: 5000000,
    level: 44,
    title: "正六品·员外郎",
    dynasty: "明",
    verdict: "六部员外郎，分掌部务，朝廷之能臣。正俸120两，实际约4700两，参与国政要务。",
    historicalFigure: "明代于谦（初任御史，后为兵部尚书）",
    dailyLife: "在六部负责具体司务，起草文书，参与政策讨论，是部务的实际办理者。"
  },
  {
    minSalary: 5000000,
    maxSalary: 6000000,
    level: 45,
    title: "从六品·郎中",
    dynasty: "明",
    verdict: "六部郎中，司掌要务，朝廷之股肱。正俸115两，实际约5400两，权柄在握。",
    historicalFigure: "明朝六部郎中",
    dailyLife: "掌管六部某司事务，起草重要文书，参与廷议，是朝廷政务的核心官员。"
  },
  // 五品官 (L46-L50)
  {
    minSalary: 6000000,
    maxSalary: 7000000,
    level: 46,
    title: "从五品·知州",
    dynasty: "明",
    verdict: "一州之长，统辖数县，地方大员。正俸140两，实际约6400两，已是封疆之列。",
    historicalFigure: "明朝知州",
    dailyLife: "统管一州政务，考核属下各县，处理重大案件，向道员汇报工作。"
  },
  {
    minSalary: 7000000,
    maxSalary: 8000000,
    level: 47,
    title: "正五品·知府",
    dynasty: "明",
    verdict: "一府之尊，统辖数县，威震一方。正俸155两，实际约7400两，封疆大吏之起步也。",
    historicalFigure: "宋代苏轼（任杭州知府，'苏堤春晓'）",
    dailyLife: "统管一府政务，考核属下各县。定期巡查辖区，处理重大案件，向巡抚汇报工作。"
  },
  {
    minSalary: 8000000,
    maxSalary: 9000000,
    level: 48,
    title: "从五品·同知",
    dynasty: "明",
    verdict: "协理府政，分掌要务，府之副职。正俸145两，实际约8400两，权柄日重。",
    historicalFigure: "明朝同知",
    dailyLife: "协助知府管理府务，分管专项事务，是知府的得力助手。"
  },
  {
    minSalary: 9000000,
    maxSalary: 10000000,
    level: 49,
    title: "正五品·参政",
    dynasty: "明",
    verdict: "参赞政务，协理省政，地方要员。正俸155两，实际约9400两，已入高位。",
    historicalFigure: "明朝参政",
    dailyLife: "协助布政使管理省政，参与重要决策，是省级政务的核心官员。"
  },
  {
    minSalary: 10000000,
    maxSalary: 12000000,
    level: 50,
    title: "从五品·佥事",
    dynasty: "明",
    verdict: "分巡分守，监察地方，职权在握。正俸145两，实际约10800两，是朝廷耳目。",
    historicalFigure: "明朝佥事",
    dailyLife: "巡视地方，监察官员，处理跨府事务，向上级汇报地方情况。"
  },
  // 四品官 (L51-L54)
  {
    minSalary: 12000000,
    maxSalary: 15000000,
    level: 51,
    title: "从四品·道员",
    dynasty: "明",
    verdict: "分守、分巡各道，监察府县，位高权重。正俸170两，实际约13200两，承上启下，节制一方。",
    historicalFigure: "明代王守仁（巡抚南赣，平定叛乱）",
    dailyLife: "巡视所辖各府县，监察官员政绩，处理跨府事务，是中央与地方之间的重要纽带。"
  },
  {
    minSalary: 15000000,
    maxSalary: 18000000,
    level: 52,
    title: "正四品·知府",
    dynasty: "明",
    verdict: "重镇知府，统辖要地，封疆大吏。正俸180两，实际约16200两，威震一方。",
    historicalFigure: "明朝要地知府（如苏州、杭州知府）",
    dailyLife: "统管重要府郡，处理军政要务，向巡抚直接汇报，是地方的实际掌权者。"
  },
  {
    minSalary: 18000000,
    maxSalary: 22000000,
    level: 53,
    title: "从四品·参政",
    dynasty: "明",
    verdict: "参赞要务，协理省政，省之股肱。正俸175两，实际约19800两，位高权重。",
    historicalFigure: "明朝参政",
    dailyLife: "协助布政使管理省政，参与重大决策，处理省级要务，是省政的实际操作者。"
  },
  {
    minSalary: 22000000,
    maxSalary: 30000000,
    level: 54,
    title: "正四品·参议",
    dynasty: "明",
    verdict: "参议政务，献策献言，朝廷之谋臣。正俸180两，实际约25200两，深受倚重。",
    historicalFigure: "明朝参议",
    dailyLife: "参与省政讨论，提出政策建议，协助处理重大事务，是省级决策的重要参与者。"
  },
  // 三品官 (L55-L58)
  {
    minSalary: 30000000,
    maxSalary: 37500000,
    level: 55,
    title: "从三品·按察使",
    dynasty: "明",
    verdict: "一省刑名之主，司法大权在握，铁面无私。正俸190两，实际约33000两，掌纠劾官邪，伸理冤抑，司法之最高长官。",
    historicalFigure: "明代海瑞（任应天巡抚，刚正不阿）",
    dailyLife: "审理重大案件，纠劾贪官污吏。主持秋审，复核死刑案件。是维护地方司法公正的关键人物。"
  },
  {
    minSalary: 37500000,
    maxSalary: 45000000,
    level: 56,
    title: "正三品·布政使",
    dynasty: "明",
    verdict: "一省行政之长，钱粮、民政总揽，封疆大吏。正俸200两，实际约40500两，掌一省之政令，承流宣化，方伯之尊。",
    historicalFigure: "清代李鸿章（直隶总督，北洋大臣）",
    dailyLife: "总揽一省政务，管理赋税、户籍、科举等事务。定期向朝廷汇报，是地方行政的核心人物。"
  },
  {
    minSalary: 45000000,
    maxSalary: 52500000,
    level: 57,
    title: "从三品·副使",
    dynasty: "明",
    verdict: "协理省政，辅佐藩臬，省之重臣。正俸195两，实际约48000两，参与要务决策。",
    historicalFigure: "明朝副使",
    dailyLife: "协助布政使或按察使管理省政，处理重大事务，是省级政务的重要官员。"
  },
  {
    minSalary: 52500000,
    maxSalary: 60000000,
    level: 58,
    title: "正三品·参政",
    dynasty: "明",
    verdict: "参赞省政，协理要务，省之柱石。正俸200两，实际约55500两，深受倚重。",
    historicalFigure: "明朝参政",
    dailyLife: "参与省级重大决策，协助布政使处理政务，是省政的核心参与者。"
  },
  // 二品官 (L59-L62)
  {
    minSalary: 60000000,
    maxSalary: 75000000,
    level: 59,
    title: "从二品·巡抚",
    dynasty: "明",
    verdict: "节制一省军政，代天巡狩，威震华夏。正俸220两，实际约66000两，巡行地方，抚安军民，一省之最高长官。",
    historicalFigure: "清代林则徐（湖广总督，'苟利国家生死以'）",
    dailyLife: "节制一省文武百官，处理军政大事。巡视各地，考察官员，向皇帝直接奏报。"
  },
  {
    minSalary: 75000000,
    maxSalary: 90000000,
    level: 60,
    title: "正二品·总督",
    dynasty: "明",
    verdict: "节制数省，手握重兵，真正的封疆大吏。正俸240两，实际约81000两，总揽军政大权，节制文武百官，位极人臣。",
    historicalFigure: "汉末刘表（荆州牧）",
    dailyLife: "统辖数省军政，处理重大军务和边患。可直接向皇帝上奏，是地方最高权力代表。"
  },
  {
    minSalary: 90000000,
    maxSalary: 105000000,
    level: 61,
    title: "从二品·侍郎",
    dynasty: "明",
    verdict: "六部侍郎，协理部务，朝廷之重臣。正俸230两，实际约96000两，参与国政要务。",
    historicalFigure: "明朝六部侍郎",
    dailyLife: "协助尚书管理部务，参与廷议，向皇帝进言，是朝廷中枢的核心官员。"
  },
  {
    minSalary: 105000000,
    maxSalary: 120000000,
    level: 62,
    title: "正二品·巡抚（加衔）",
    dynasty: "明",
    verdict: "加衔巡抚，位高权重，封疆之重任。正俸240两，实际约111000两，节制军政，威震一方。",
    historicalFigure: "明朝巡抚（加兵部侍郎衔或都察院右都御史衔）",
    dailyLife: "以更高品级节制一省，处理军政要务，直接向皇帝奏报，权力更大。"
  },
  // 一品官 (L63-L66)
  {
    minSalary: 120000000,
    maxSalary: 150000000,
    level: 63,
    title: "从一品·尚书",
    dynasty: "明",
    verdict: "六部之首，执掌国政，朝廷之栋梁。正俸260两，实际约132000两，吏户礼兵刑工，各有所掌，国之重臣。",
    historicalFigure: "明代张居正（任首辅前曾任尚书）",
    dailyLife: "主持部务，参与廷议，向皇帝进言。每日处理大量奏章，是国家行政的中枢人物。"
  },
  {
    minSalary: 150000000,
    maxSalary: 180000000,
    level: 64,
    title: "正一品·大学士",
    dynasty: "明",
    verdict: "殿阁大学士，辅弼之臣，一人之下万人之上。正俸280两，实际约162000两，入阁办事，参预机务，宰相之尊。",
    historicalFigure: "蜀汉诸葛亮（丞相，鞠躬尽瘁）",
    dailyLife: "入阁参预机务，票拟奏章，辅佐皇帝处理政务。是朝廷决策的核心人物，权倾朝野。"
  },
  {
    minSalary: 180000000,
    maxSalary: 210000000,
    level: 65,
    title: "从一品·太子太保",
    dynasty: "明",
    verdict: "东宫师保，教导储君，位尊权重。正俸270两，实际约192000两，辅佐太子，关乎国本。",
    historicalFigure: "明朝太子太保",
    dailyLife: "辅导太子读书，参与朝政，是储君的重要师傅，地位尊崇。"
  },
  {
    minSalary: 210000000,
    maxSalary: 240000000,
    level: 66,
    title: "正一品·少傅",
    dynasty: "明",
    verdict: "三公之列，位极人臣，荣宠无比。正俸280两，实际约222000两，辅佐朝政，德高望重。",
    historicalFigure: "明朝少傅（往往是加衔）",
    dailyLife: "参与朝廷重大决策，辅佐皇帝处理政务，是最高级别的朝廷重臣。"
  },
  // 超品/皇室 (L67-L70)
  {
    minSalary: 240000000,
    maxSalary: 300000000,
    level: 67,
    title: "亲王（低俸）",
    dynasty: "明",
    verdict: "天潢贵胄，皇室宗亲，尊贵无比。年俸约10000两加封地收入，金枝玉叶，龙子龙孙，天下之至尊至贵。",
    historicalFigure: "明代朱权（宁王，著有《太和正音谱》）",
    dailyLife: "居于王府，享受荣华富贵。参与重大典礼，但需谨守本分，不可干预朝政。"
  },
  {
    minSalary: 300000000,
    maxSalary: 370000000,
    level: 68,
    title: "郡王",
    dynasty: "明",
    verdict: "皇室宗亲，受封郡王，位尊权重。年俸约8000两加封地，爵位世袭，荣耀无比。",
    historicalFigure: "明朝郡王",
    dailyLife: "居于封地，管理藩地事务，享受朝廷供奉，参与皇室典礼。"
  },
  {
    minSalary: 370000000,
    maxSalary: 450000000,
    level: 69,
    title: "亲王（高俸）",
    dynasty: "明",
    verdict: "嫡亲皇子，受封亲王，位极尊贵。年俸约15000两加丰厚封地，金枝玉叶，天潢贵胄。",
    historicalFigure: "明朝亲王（嫡出）",
    dailyLife: "居于王府，享受极高待遇，参与重大国事，但不得干预朝政，享受荣华富贵。"
  },
  {
    minSalary: 450000000,
    maxSalary: 500000000,
    level: 70,
    title: "议政王",
    dynasty: "明",
    verdict: "参与议政，辅佐朝廷，权柄在握。年俸约20000两加封地，可参预机务，位高权重。",
    historicalFigure: "清朝议政王",
    dailyLife: "参与朝廷重大决策，议政于朝堂，享受皇室最高待遇，权力仅次于摄政王。"
  },
  // 权臣/摄政 (L71-L74)
  {
    minSalary: 500000000,
    maxSalary: 600000000,
    level: 71,
    title: "铁帽子王",
    dynasty: "明",
    verdict: "世袭罔替，爵位永固，皇室之柱石。不降等承袭，子孙永享荣华，权势熏天。",
    historicalFigure: "清代恭亲王奕訢",
    dailyLife: "享受最高待遇，爵位世代相传不降级，参与重大国事，是皇室最尊贵的成员。"
  },
  {
    minSalary: 600000000,
    maxSalary: 750000000,
    level: 72,
    title: "摄政王",
    dynasty: "明",
    verdict: "代天摄政，总揽朝纲，权倾天下。皇帝年幼或特授，亲王摄政，号令天下，莫敢不从。",
    historicalFigure: "清朝多尔衮",
    dailyLife: "代行皇帝职权，总揽朝政。每日批阅奏章，召见大臣，决策国家大事，实际掌权者。"
  },
  {
    minSalary: 750000000,
    maxSalary: 900000000,
    level: 73,
    title: "监国太子",
    dynasty: "明",
    verdict: "储君监国，代理朝政，国本所系。皇帝巡幸或委以重任，太子监国，学习治国。",
    historicalFigure: "明朝监国太子",
    dailyLife: "代理朝政，处理日常政务，学习如何治理国家，为继位做准备。"
  },
  {
    minSalary: 900000000,
    maxSalary: 1000000000,
    level: 74,
    title: "太上皇",
    dynasty: "明",
    verdict: "退位之尊，虽不理政，然地位崇高。禅位于子，颐养天年，受万民敬仰。",
    historicalFigure: "明朝嘉靖帝父亲（追尊）",
    dailyLife: "不再处理朝政，在宫中颐养天年，享受最高待遇，偶尔给新皇帝一些指导。"
  },
  // 皇帝 (L75)
  {
    minSalary: 100000000,
    maxSalary: 999999999,
    level: 75,
    title: "皇帝",
    dynasty: "明",
    verdict: "九五之尊，天下之主，富有四海。普天之下，莫非王土；率土之滨，莫非王臣。唯有年入亿两者，方堪此位。",
    historicalFigure: "明朝万历皇帝",
    dailyLife: "清晨上朝听政，批阅奏章，召见大臣。下午读书学习或处理紧急事务。晚上批阅奏章至深夜，日理万机。"
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

// ========== 生活质量相关导出（从 roleMapping 重新导出） ==========

export { 
  calculateQualityOfLife,
  normalizeQoL,
  adjustLevelByQoL,
  getQoLComment,
  getQoLStars,
  getSpecialComboDesc,
};

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
  // 计算生活质量并归一化
  const qol = calculateQualityOfLife(userInput, level);
  const normalizedQoL = normalizeQoL(qol);
  
  // 获取官职名称
  const levelData = LEVEL_MAPPING.find(m => m.level === level);
  const title = levelData?.title || '未知';
  
  // 调用新的场景生成器（传入官职名称）
  const scene = generateScene(userInput, level, title, normalizedQoL);
  return {
    morning: scene.morning,
    afternoon: scene.afternoon,
    evening: scene.evening,
    mood: scene.mood,
  };
}

// 根据用户输入生成个性化评语（简短版，仅用于履历评述）
export function generatePersonalizedComment(
  userInput: UserInput,
  level: number
): string {
  const qol = calculateQualityOfLife(userInput, level);
  const specialCombo = getSpecialComboDesc(userInput);
  
  // 如果有特殊组合，直接返回
  if (specialCombo) {
    return specialCombo;
  }
  
  // 否则返回生活质量总评
  return getQoLComment(qol);
}

// 生成增强版判词（使用加权决策树）
export function generateEnhancedVerdict(
  baseVerdict: string,
  userInput: UserInput,
  level: number
): string {
  const qol = calculateQualityOfLife(userInput, level);
  const specialCombo = getSpecialComboDesc(userInput);
  
  // 构建评语：基础官职描述 + 修饰因素 + 总评
  const parts: string[] = [];
  
  // 1. 基础官职描述
  parts.push(baseVerdict);
  
  // 2. 年限和加班（合并为一句）
  parts.push(`${YEARS_DESC[userInput.workYears]}，${OVERTIME_DESC[userInput.overtimeFreq]}`);
  
  // 3. 城市和福利（合并为一句）
  const cityShort = userInput.cityTier === '1' ? '身居京师' : 
                    userInput.cityTier === '2' ? '居于省城' :
                    userInput.cityTier === '3' ? '住在府城' :
                    userInput.cityTier === '4' ? '居于县城' : '身处小城';
  const benefitsShort = userInput.benefits === 'excellent' ? '恩赏优厚' :
                        userInput.benefits === 'good' ? '待遇尚可' :
                        userInput.benefits === 'average' ? '俸禄平平' : '俸禄微薄';
  parts.push(`${cityShort}，${benefitsShort}`);
  
  // 4. 特殊组合或生活质量总评
  if (specialCombo) {
    parts.push(specialCombo);
  } else {
    parts.push(getQoLComment(qol));
  }
  
  return parts.join('。');
}

// ========== 历史人物动态调整 ==========

/**
 * 根据生活质量调整后获取历史人物对照
 * @param level 原始等级
 * @param userInput 用户输入
 * @returns 调整后的历史人物
 */
export function getAdjustedHistoricalFigure(
  level: number,
  userInput: UserInput
): string {
  const qol = calculateQualityOfLife(userInput, level);
  const adjustedLevel = adjustLevelByQoL(level, qol);
  
  // 获取调整后等级对应的历史人物
  const adjustedMapping = LEVEL_MAPPING.find(m => m.level === adjustedLevel);
  
  if (adjustedMapping?.historicalFigure) {
    return adjustedMapping.historicalFigure;
  }
  
  // 如果没有找到，返回原等级的历史人物
  const originalMapping = LEVEL_MAPPING.find(m => m.level === level);
  return originalMapping?.historicalFigure || '古代某官吏';
}
