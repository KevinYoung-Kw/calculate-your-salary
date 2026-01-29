// 场景内容数据 - 基于官职类型的场景生成系统

import type { OccupationCategory } from './occupationClassifier';

// ========== 场景内容接口 ==========
export interface SceneContent {
  morning: string;
  afternoon: string;
  evening: string;
  mood: string;
}

// ========== 默认场景（兜底） ==========
export const DEFAULT_SCENE: SceneContent = {
  morning: '卯时起身，用过早膳便开始一日的劳作。',
  afternoon: '午后继续忙碌，处理各项事务。',
  evening: '酉时收工，归家歇息。',
  mood: '日复一日，平淡度日'
};

// ========== 每个Level的完整场景描写（让每个等级有独特体验） ==========
export interface LevelSceneDetail {
  morning: string;    // 早晨特有描写
  afternoon: string;  // 下午特有描写
  evening: string;    // 晚上特有描写
  highlight: string;  // 今日特事（突出该level的特色）
}

export const LEVEL_SCENE_DETAILS: Record<number, LevelSceneDetail> = {
  // ========== L0-L4: 底层体力劳动者 ==========
  0: { // 流民
    morning: '揉揉眼睛四处张望，看看有没有施粥的地方。',
    afternoon: '在街头巷尾游荡，寻找任何能糊口的机会。有时帮人搬个东西，有时捡些废物去卖。',
    evening: '裹紧身上破旧的衣衫，肚子咕咕叫着。',
    highlight: '今日的破庙里又来了几个流民，大家挤在一起取暖。'
  },
  1: { // 雇工
    morning: '匆匆喝了碗稀粥便往工地赶，生怕去晚了被工头骂。',
    afternoon: '在工地上挥汗如雨，搬砖、和泥、挑担，干的都是最苦最累的活。',
    evening: '领了今日的工钱，买了几个馒头充饥。',
    highlight: '工头递来今天的工钱，几文铜板在手心里沉甸甸的。'
  },
  2: { // 学徒
    morning: '先把作坊里里外外打扫干净，等着师傅来教手艺。',
    afternoon: '跟在师傅身边，仔细看、认真学。虽然只能打打下手，但心里满是期待。',
    evening: '收拾完作坊，趁着月光复习今天学的技法，暗暗发誓要学有所成。',
    highlight: '师傅今日教了一个新技法，得好好记住。'
  },
  3: { // 小工
    morning: '到码头上等活。今日运气不错，很快便有人来雇。',
    afternoon: '扛着沉重的货物来回搬运，汗水湿透了衣背，但不敢停歇。',
    evening: '数了数今日的工钱，去路边摊买了碗面，热腾腾地吃着。',
    highlight: '今日搬了二十担货，肩膀酸痛，但总算挣到了工钱。'
  },
  4: { // 杂役
    morning: '到府上当值，先把院子扫干净，再去厨房领今日的差事。',
    afternoon: '府里事务繁杂，跑腿传话、端茶倒水、搬搬抬抬，片刻不得闲。',
    evening: '在下人房里和同伴聊聊天，等着发月钱。',
    highlight: '管家交代了新差事，得用心办好，或许能得几个赏钱。'
  },
  
  // ========== L5-L10: 工匠/伙计 ==========
  5: { // 伙计
    morning: '整理好仪容便往铺子赶。东家要求伙计们必须精神抖擞。',
    afternoon: '在铺子里招呼客人，介绍货物，察言观色。做买卖讲究眼力见儿。',
    evening: '帮着盘点货物，东家分了些赏钱，心里美滋滋的。',
    highlight: '东家今日心情不错，多赏了半吊钱。'
  },
  6: { // 店铺伙计
    morning: '比东家来得还早，先把铺子里外收拾干净，把货物摆放整齐。',
    afternoon: '熟练地招呼来往客人，记账、算账、包货，井井有条。',
    evening: '东家夸我做事利落，暗示过些日子可能升我做掌柜。',
    highlight: '老客户今日又来了，掌柜夸我招呼得好。'
  },
  7: { // 小贩
    morning: '去集市进货，挑着担子沿街叫卖。今日进的货成色不错。',
    afternoon: '走街串巷，吆喝声此起彼伏。遇到熟客还能聊上几句。',
    evening: '清点今日的收入。比昨天多卖了一成，心里挺高兴。',
    highlight: '今日走街串巷，卖出了比昨日多一成的货。'
  },
  8: { // 力役脚夫
    morning: '到驿站等活，今日要送一批货到隔壁县，得走上一整天。',
    afternoon: '挑着沉重的担子翻山越岭，脚上磨出了水泡也不敢停。',
    evening: '到达目的地，领了脚钱。找了家小店住下，明日还要赶回去。',
    highlight: '脚上的水泡又磨破了，但看着今天的收入，值了。'
  },
  9: { // 工匠
    morning: '来到自己的工坊，今日要完成一件定制的器物。准备好工具便开始。',
    afternoon: '全神贯注地制作，每一个细节都不敢马虎。这是多年练就的手艺。',
    evening: '看着完工的作品颇为满意。明日客人来取，定能满意。',
    highlight: '今日打造的这件器物，自己也颇为满意。'
  },
  10: { // 资深工匠
    morning: '指导几个徒弟干活，自己则专门处理那些高难度的订单。',
    afternoon: '一位远道而来的客人慕名而来，要定制一件精品。谈好价钱便开始动手。',
    evening: '收徒弟们的束脩，安排明日的活计。这手艺总算有了些名气。',
    highlight: '又有客人慕名而来，这手艺总算有了些名气。'
  },
  
  // ========== L11-L14: 商贾富户 ==========
  11: { // 小商人
    morning: '先去仓库查看货物，今日要和一个大客户谈一笔生意。',
    afternoon: '在茶馆里和客户洽谈，讨价还价间谈妥了一笔买卖。',
    evening: '盘算着利润，这笔生意做得不错，值得庆祝一番。',
    highlight: '进了一批好货，若是卖得好，这个月能多挣些。'
  },
  12: { // 小掌柜
    morning: '来到自己的铺子，看伙计们忙碌着。自己不必亲自站柜台了。',
    afternoon: '处理账目，会见几个供货商，谈妥了下季度的货源。',
    evening: '算着这个月的盈利，盘算着是否该开一家分店。',
    highlight: '铺子里的伙计越来越得力，自己也能歇歇了。'
  },
  13: { // 富户
    morning: '仆人伺候着洗漱更衣，早膳已经备好。',
    afternoon: '去田庄转了一圈，看看今年的收成。管事的毕恭毕敬地汇报。',
    evening: '设宴款待几位乡绅好友，推杯换盏间谈笑风生。',
    highlight: '田里的庄稼长势喜人，今年应是个丰年。'
  },
  14: { // 小地主
    morning: '管家来报今日的事务，有几户佃农要来交租。',
    afternoon: '在厅堂里收租，账房先生一一核对。佃户们恭恭敬敬。',
    evening: '清点了收上来的粮食和银钱，今年收成不错，心情甚好。',
    highlight: '收租时佃户们恭恭敬敬，这地主的日子还是舒坦。'
  },
  
  // ========== L15-L23: 衙门吏员 ==========
  15: { // 衙役
    morning: '到衙门当值，换上公服，站在堂前准备迎接今日的升堂。',
    afternoon: '知县大人升堂问案，自己喝道"威武"，声音洪亮，气势十足。',
    evening: '和同僚喝了几杯，今日门包收了不少，日子过得去。',
    highlight: '今日在衙门站堂，喝道的声音洪亮，老差役都夸好。'
  },
  16: { // 捕快
    morning: '出门巡逻，走街串巷，盘查可疑人员。',
    afternoon: '接到报案，有人家失窃。仔细查访，很快便锁定了嫌犯。',
    evening: '将贼人缉拿归案，知县大人赞许有加，赏了几两银子。',
    highlight: '又破了一桩案子，知县大人颇为赞许。'
  },
  17: { // 书吏
    morning: '来到衙门，开始抄写今日的公文。一笔一画，不敢潦草。',
    afternoon: '有百姓来请写状纸，收了些润笔费。这也是一笔进项。',
    evening: '抄完最后一份公文，收拾好笔墨。今日挣的不少。',
    highlight: '今日代写了几份状纸，润笔费也是一笔进项。'
  },
  18: { // 门子
    morning: '在衙门口当值，见官行礼，遇民问询。',
    afternoon: '有人来衙门办事，收了门包才放人进去。这是规矩。',
    evening: '数数今日的门包，收入颇丰。买了只烧鸡犒劳自己。',
    highlight: '门包收得不少，这个月的月钱有着落了。'
  },
  19: { // 账房
    morning: '来到东家的店铺，开始核对昨日的账目。',
    afternoon: '算盘打得噼啪响，每一笔收支都记得清清楚楚。',
    evening: '账目核对完毕，交给东家过目。东家满意地点点头。',
    highlight: '账目清清楚楚，东家十分满意。'
  },
  20: { // 师爷
    morning: '在书房研读律法条文，为今日的案子做准备。',
    afternoon: '陪知县大人审案，在旁出谋划策，帮着分析案情。',
    evening: '知县大人采纳了我的建议，案子判得甚是妥当。得了一份赏赐。',
    highlight: '为知县大人出了个好主意，得了一份赏赐。'
  },
  21: { // 主簿
    morning: '来到衙门，开始整理户籍簿册。这是一县的根本。',
    afternoon: '有上峰派人来查验户籍，自己的册子整理得井井有条。',
    evening: '查验顺利通过，上峰颇为满意。知县大人也夸奖了几句。',
    highlight: '户籍簿册整理得井井有条，上峰来查也挑不出毛病。'
  },
  22: { // 押司
    morning: '整理好案卷，准备陪知县大人升堂审案。',
    afternoon: '在堂上记录口供，协助知县大人审理案件。学到不少门道。',
    evening: '案子审完，整理好卷宗归档。知县大人说过几年可推荐入流。',
    highlight: '今日陪知县大人审案，旁听学到了不少。'
  },
  23: { // 大掌柜
    morning: '巡视几家店铺，听取各店伙计的汇报。生意蒸蒸日上。',
    afternoon: '和几个大客户商谈，又谈成了几笔大买卖。',
    evening: '和家人商量开分号的事。生意越做越大了。',
    highlight: '店里的生意越做越大，已经开始筹划开分号了。'
  },
  
  // ========== L24-L34: 九品-八品官员 ==========
  24: { // 从九品·典史
    morning: '穿戴好官服官帽，虽是末品，走出门去也是威风凛凛。',
    afternoon: '在县衙处理刑名事务，虽然品级不高，但也是朝廷命官。',
    evening: '虽然简陋，但总算是有了个官身。',
    highlight: '换上了官服官帽，虽是末品，也是朝廷命官了。'
  },
  25: { // 正九品·巡检
    morning: '带领弓兵出巡，巡查辖区内的治安情况。',
    afternoon: '在各村镇走访，了解民情。百姓见了都恭敬行礼。',
    evening: '写今日的巡查报告。',
    highlight: '带着弓兵巡查辖区，百姓见了都恭敬行礼。'
  },
  26: { // 从九品·教谕
    morning: '来到县学，学生们恭敬地行礼问好。',
    afternoon: '在讲堂上授课，讲解经义。看着学生们认真听讲，颇感欣慰。',
    evening: '批改学生的文章，发现几个可造之材。',
    highlight: '县学里的学生越来越多，桃李满门指日可待。'
  },
  27: { // 正九品·训导
    morning: '协助教谕准备今日的课业。',
    afternoon: '在学堂辅导学生，讲解疑难。',
    evening: '批改作业，记录学生的进步情况。',
    highlight: '批改学生文章，发现了几个可造之材。'
  },
  28: { // 富商
    morning: '听取各处生意的汇报。',
    afternoon: '与官府中人周旋，打点关系。',
    evening: '设宴款待贵客，商谈合作事宜。',
    highlight: '生意兴隆，已在同行中小有名气。'
  },
  29: { // 从八品·县丞
    morning: '来到县衙，准备今日的公务。作为知县的副手，事务繁忙。',
    afternoon: '代知县处理了一桩民事纠纷，双方都心服口服。',
    evening: '写好今日的公务报告，明日要呈给知县过目。',
    highlight: '今日代行知县职权处理了一桩纠纷，颇有成就感。'
  },
  30: { // 正八品·州同
    morning: '来到州衙，协助知州处理公务。',
    afternoon: '有一件棘手的案子，自己提出的处理方案得到知州赏识。',
    evening: '知州大人暗示过些日子会向上推荐。前程可期。',
    highlight: '协助知州处理了一件棘手的案子，得到了赏识。'
  },
  31: { // 从八品·学正
    morning: '主持州学的晨读，督促学生们用功。',
    afternoon: '主持了一场考试，选拔优秀学子参加乡试。',
    evening: '批阅考卷，选出几个出类拔萃的。',
    highlight: '在州学主持了一场考试，选拔出几个好苗子。'
  },
  32: { // 正八品·教授
    morning: '来到府学，学生和助教恭敬相迎。',
    afternoon: '在讲堂授课，讲解高深的经义。',
    evening: '与几位名士切磋学问，收获颇丰。',
    highlight: '府学教授之职责任重大，不敢有丝毫懈怠。'
  },
  33: { // 从八品·训导
    morning: '协助教授准备今日的课业。',
    afternoon: '辅导学生，解答疑难。',
    evening: '整理学籍档案，记录学生的学业情况。',
    highlight: '辅佐教授管理府学，颇得信任。'
  },
  34: { // 大商人
    morning: '仆人伺候着洗漱，准备今日的事务。',
    afternoon: '与官府要员会面，商谈大宗买卖。',
    evening: '在自家园林设宴，款待达官贵人。',
    highlight: '生意越做越大，已开始与官府打交道了。'
  },
  
  // ========== L35-L50: 七品-五品官员 ==========
  35: { // 从七品·县令
    morning: '穿戴整齐升堂，百姓跪拜，"青天大老爷"的称呼听着顺耳。',
    afternoon: '审理了几桩案子，断案公正，百姓心服。',
    evening: '在后衙批阅公文，思考如何为民造福。',
    highlight: '升堂问案，一言可决百姓生死，不敢不慎。'
  },
  36: { // 正七品·知县
    morning: '先看了下属呈上的各项报告，然后升堂问案。',
    afternoon: '巡视了县内的水利工程，督促修缮。',
    evening: '在书房研读律法，为明日的案子做准备。',
    highlight: '一县之主，牧民有责，需时时警醒。'
  },
  37: { // 从七品·评事
    morning: '来到大理寺，开始审阅各地呈上的案卷。',
    afternoon: '参与评议了几桩大案，秉公执法，不畏权贵。',
    evening: '整理今日的评议意见，准备明日上呈。',
    highlight: '大理寺评事，掌刑名大权，秉公执法。'
  },
  38: { // 正七品·推官
    morning: '升堂审案，今日有几桩疑难案件要推问。',
    afternoon: '仔细推敲案情，明察秋毫，终于理清了头绪。',
    evening: '撰写判词，力求公正无私。',
    highlight: '推问刑狱，明察秋毫，不使一人蒙冤。'
  },
  39: { // 从七品·州判
    morning: '来到州衙，处理今日的刑名事务。',
    afternoon: '审理了几桩案子，职责日重。',
    evening: '向知州汇报今日的审案情况。',
    highlight: '协理州政，分掌刑名，职责日重。'
  },
  40: { // 豪商巨贾
    morning: '仆人成群伺候，准备今日要务。',
    afternoon: '与朝廷官员商议大宗采买事宜。',
    evening: '在私家园林设宴，达官贵人云集。',
    highlight: '富甲一方，与官员交往，已非普通商贾。'
  },
  41: { // 从六品·主事
    morning: '来到六部衙门，处理今日的公务。终于成了京官。',
    afternoon: '参与起草了一份重要文书，上司颇为满意。',
    evening: '虽然清贫，但前途光明。',
    highlight: '入了六部衙门，成了真正的京官。'
  },
  42: { // 正六品·通判
    morning: '来到府衙，分管粮运事务。',
    afternoon: '下乡巡查粮仓，督促地方官员。',
    evening: '撰写巡查报告，准备呈交知府。',
    highlight: '佐理府政，分管粮运，责任重大。'
  },
  43: { // 从六品·都事
    morning: '来到都察院，处理机要文书。',
    afternoon: '经手的都是朝廷机密，不敢有丝毫大意。',
    evening: '整理好文书归档，确保万无一失。',
    highlight: '在都察院掌管文书，经手的都是机密要务。'
  },
  44: { // 正六品·员外郎
    morning: '来到六部衙门，参与部务讨论。',
    afternoon: '起草了一份重要奏章，参与国政。',
    evening: '研读政令，不敢懈怠。',
    highlight: '员外郎之职，参与国政，不敢懈怠。'
  },
  45: { // 从六品·郎中
    morning: '来到衙门，主持本司事务。',
    afternoon: '处理各项政务，起草重要文书。',
    evening: '参与廷议，献言献策。',
    highlight: '六部郎中，掌一司之务，权柄在握。'
  },
  46: { // 从五品·知州
    morning: '升堂理事，一州大小事务皆需过问。',
    afternoon: '巡视各县，考核属下官员。',
    evening: '批阅公文，处理疑难案件。',
    highlight: '一州之长，统辖数县，已是地方大员。'
  },
  47: { // 正五品·知府
    morning: '在府衙升堂，属下各县官员恭候听命。',
    afternoon: '巡视府内各项工程，督促进度。',
    evening: '设宴款待上司，打点关系。',
    highlight: '一府之尊，坐镇一方，威震州县。'
  },
  48: { // 从五品·同知
    morning: '协助知府处理府务。',
    afternoon: '分管专项事务，独当一面。',
    evening: '向知府汇报工作进展。',
    highlight: '协助知府管理府务，分担重任。'
  },
  49: { // 正五品·参政
    morning: '来到布政使司衙门，参与省政讨论。',
    afternoon: '协助布政使处理重大事务。',
    evening: '研读政令，准备明日的廷议。',
    highlight: '参赞省政，已入高层，前途无量。'
  },
  50: { // 从五品·佥事
    morning: '奉命巡视地方，监察官员政绩。',
    afternoon: '走访各府县，了解民情。',
    evening: '撰写巡查报告，如实上奏。',
    highlight: '分巡分守，监察地方，是朝廷的耳目。'
  },
  
  // ========== L51-L66: 四品-一品高官 ==========
  51: { // 从四品·道员
    morning: '在道台衙门升堂，节制数府官员。',
    afternoon: '处理跨府事务，协调各方。',
    evening: '批阅各府呈报，上报藩司。',
    highlight: '分守一道，节制数府，位高权重。'
  },
  52: { // 正四品·知府
    morning: '在重镇府衙升堂，处理军政要务。',
    afternoon: '接见朝廷派来的钦差，商议大事。',
    evening: '向巡抚大人呈报要务。',
    highlight: '重镇知府，执掌要地，责任重大。'
  },
  53: { // 从四品·参政
    morning: '参与省政重大决策会议。',
    afternoon: '处理省级要务，协助布政使。',
    evening: '研读朝廷政令，准备对策。',
    highlight: '参赞要务，协理省政，深受倚重。'
  },
  54: { // 正四品·参议
    morning: '在布政使司议事。',
    afternoon: '提出政策建议，献策献言。',
    evening: '草拟奏章，为一省之谋臣。',
    highlight: '参议省政，献策献言，为一省之谋臣。'
  },
  55: { // 从三品·按察使
    morning: '在按察使司升堂，处理刑名大案。',
    afternoon: '主持秋审，复核死刑案件。',
    evening: '批阅各府呈报的案卷，纠劾官邪。',
    highlight: '一省刑名之主，纠劾官邪，伸理冤抑。'
  },
  56: { // 正三品·布政使
    morning: '在布政使司主持省政。',
    afternoon: '处理一省的钱粮、民政事务。',
    evening: '向朝廷呈报省务，承流宣化。',
    highlight: '一省行政之长，承流宣化，方伯之尊。'
  },
  57: { // 从三品·副使
    morning: '协助藩臬处理省政。',
    afternoon: '参与重大决策讨论。',
    evening: '处理分管事务。',
    highlight: '辅佐藩臬，参与省政要务决策。'
  },
  58: { // 正三品·参政
    morning: '参与省级重大会议。',
    afternoon: '协助布政使处理政务。',
    evening: '研究政令，为省之柱石。',
    highlight: '参赞省政，为一省之柱石。'
  },
  59: { // 从二品·巡抚
    morning: '在巡抚衙门主持军政大事。',
    afternoon: '节制一省文武，处理重大军务。',
    evening: '批阅奏章，向皇帝直接奏报。',
    highlight: '节制一省军政，代天巡狩，威震华夏。'
  },
  60: { // 正二品·总督
    morning: '在总督府召集各省大员议事。',
    afternoon: '统筹数省军政，处理边防要务。',
    evening: '批阅军报，向朝廷奏报军情。',
    highlight: '节制数省，手握重兵，真正的封疆大吏。'
  },
  61: { // 从二品·侍郎
    morning: '来到六部衙门，协助尚书处理部务。',
    afternoon: '参与廷议，向皇帝进言。',
    evening: '批阅奏章，处理部务。',
    highlight: '六部侍郎，协理部务，朝廷重臣。'
  },
  62: { // 正二品·巡抚（加衔）
    morning: '以更高品级主持一省军政。',
    afternoon: '处理军政要务，直接奏报皇帝。',
    evening: '权力更大，责任更重。',
    highlight: '加衔巡抚，节制军政，权倾一方。'
  },
  63: { // 从一品·尚书
    morning: '主持六部部务，向皇帝奏事。',
    afternoon: '参与廷议，决策国家大事。',
    evening: '批阅堆积如山的奏章。',
    highlight: '六部之首，执掌国政，朝廷栋梁。'
  },
  64: { // 正一品·大学士
    morning: '入阁参预机务，票拟奏章。',
    afternoon: '辅佐皇帝处理政务，权倾朝野。',
    evening: '在值房处理要务，日理万机。',
    highlight: '殿阁大学士，入阁办事，参预机务，宰相之尊。'
  },
  65: { // 从一品·太子太保
    morning: '到东宫辅导太子读书。',
    afternoon: '参与朝政，是储君的重要师傅。',
    evening: '研读经史，准备明日的讲义。',
    highlight: '东宫师保，辅导储君，关乎国本。'
  },
  66: { // 正一品·少傅
    morning: '参与朝廷重大决策会议。',
    afternoon: '辅佐皇帝，位极人臣。',
    evening: '德高望重，受万人敬仰。',
    highlight: '三公之列，位极人臣，荣宠无比。'
  },
  
  // ========== L67-L74: 皇室成员 ==========
  67: { // 亲王（低俸）
    morning: '宫人伺候着梳洗更衣。',
    afternoon: '在府中闲居，不得干预朝政。',
    evening: '与幕僚宾客饮酒作乐。',
    highlight: '身为亲王，虽不理政，却享尽荣华。'
  },
  68: { // 郡王
    morning: '宫人伺候着梳洗更衣。',
    afternoon: '管理封地事务，享受朝廷供奉。',
    evening: '举办宴会，款待来访贵客。',
    highlight: '郡王之尊，封地收入丰厚，世代富贵。'
  },
  69: { // 亲王（高俸）
    morning: '宫人成群伺候梳洗更衣。',
    afternoon: '虽不得干政，但享受极高待遇。',
    evening: '赏戏听曲，极尽奢华。',
    highlight: '嫡亲皇子，金枝玉叶，天潢贵胄。'
  },
  70: { // 议政王
    morning: '早朝议政，参与朝廷重大决策。',
    afternoon: '与军机大臣商议国事。',
    evening: '批阅奏章，权力仅次于摄政王。',
    highlight: '议政王爷，参预机务，权势熏天。'
  },
  71: { // 铁帽子王
    morning: '宫人伺候着梳洗更衣。',
    afternoon: '爵位世代相传，子孙永享荣华。',
    evening: '参与皇室重大典礼，地位尊崇。',
    highlight: '铁帽子王，世袭罔替，子孙永享荣华。'
  },
  72: { // 摄政王
    morning: '代行皇帝职权，早朝听政。',
    afternoon: '总揽朝纲，决策国家大事。',
    evening: '批阅奏章至深夜，实际掌权者。',
    highlight: '摄政王爷，代天摄政，总揽朝纲。'
  },
  73: { // 监国太子
    morning: '代理朝政，处理日常政务。',
    afternoon: '学习如何治理国家，为继位做准备。',
    evening: '研读奏章，请教师傅。',
    highlight: '监国太子，代理朝政，学习治国。'
  },
  74: { // 皇帝
    morning: '早朝听政，群臣跪拜，"万岁"之声响彻金銮殿。',
    afternoon: '召见大臣，批阅奏章，决策天下大事。',
    evening: '批阅奏章至深夜，日理万机。',
    highlight: '九五之尊，天下之主，富有四海。'
  }
};

// ========== 按官职类型的基础场景模板（主要用于提供基础mood和兜底） ==========
const SCENE_BY_OCCUPATION: Record<OccupationCategory, SceneContent> = {
  // ========== 体力劳动者：流民、雇工、小工、脚夫等 ==========
  labor: {
    morning: '卯时起身，吃过简单的早饭便出门做工。今日的活计不算太重，心情还算轻松。',
    afternoon: '下午继续干活，虽然辛苦但已习惯。工友们说说笑笑，倒也不觉得太累。',
    evening: '酉时收工，领了今日的工钱。回到住处买些便宜的酒菜，一个人慢慢吃着，日子虽苦但也还能过。',
    mood: '虽然清贫，聊以度日'
  },

  // ========== 工匠手艺人：学徒、工匠、铁匠、木匠等 ==========
  craft: {
    morning: '卯时起身，用过家中的早膳，步行前往工坊。一路上街市渐渐热闹起来。',
    afternoon: '在工坊专心制作，手艺渐有精进。午膳是自带的饭菜，与同行一起用餐，说说笑笑。',
    evening: '酉时准时收工，回家路上买些酒菜。家中已备好热腾腾的晚饭，日子虽不富裕却有滋味。',
    mood: '踏实过日子，小有盼头'
  },

  // ========== 商贾：小贩、商人、掌柜、地主等 ==========
  merchant: {
    morning: '卯时起身，精心打扮一番。早膳后先到铺面看看，安排伙计们今日的任务。',
    afternoon: '上午接待几位重要主顾，下午处理账目、盘点货物。偶尔亲自出马拜访大客户，凭着多年积累的人脉，生意做得顺风顺水。',
    evening: '酉时打烊，回家路上买些点心给孩子。晚饭后与家人闲坐聊天，盘算着下月的经营计划。日子越过越好，心里踏实。',
    mood: '生意兴隆，心满意足'
  },

  // ========== 衙门小吏：杂役、衙役、书办、录事等 ==========
  clerk: {
    morning: '卯时起身，用过家中的早膳，步行前往衙门。一路上街市渐渐热闹起来。',
    afternoon: '在衙门抄写公文，誊录档案。午膳是自带的饭菜，与同僚一起用餐，说说笑笑。',
    evening: '酉时准时散衙，回家路上买些酒菜。家中已备好热腾腾的晚饭，日子虽不富裕却有滋味。',
    mood: '踏实过日子，小有盼头'
  },

  // ========== 文人师爷：师爷、幕僚、教谕等 ==========
  scholar: {
    morning: '卯时起身，从容用过早膳。换上整洁的长衫，踱步前往衙门（或学堂）。晨光熹微，街市渐渐热闹，心情颇为舒畅。',
    afternoon: '午后处理案牍（或教授学生），偶与同僚商议。茶歇时分品一盏香茗，工作虽忙却也有条不紊。',
    evening: '酉时准时散衙，夕阳西下。归家路上逛逛书肆，买本新书。晚饭后在灯下读书，日子平淡却充实。',
    mood: '岁月静好，心境平和'
  },

  // ========== 正式官员：县丞、知县、知府等 ==========
  official: {
    morning: '卯时起身，仆人已备好热水香茗。从容用过早膳，乘轿前往衙门。轿中尚可阅读文书，筹谋今日政务。',
    afternoon: '在公房处理政务，属下恭敬地禀报各项事宜。午膳与同僚相聚，谈笑风生。',
    evening: '酉时散衙，归府与家人共进晚餐。饭后或在书房读书，或在园中散步，生活闲适惬意。',
    mood: '事业有成，生活富足'
  },

  // ========== 高级官员：道台、巡抚、总督、尚书等 ==========
  elite: {
    morning: '卯时起身，仆人伺候着洗漱更衣。从容用过丰盛的早膳，乘八抬大轿前往衙门。仪仗威严，沿途官民肃立。',
    afternoon: '在衙门处理要务，各府州官员恭候听命。午膳是御厨级别的精致菜肴，与几位同僚边享用边商议军国大事。',
    evening: '酉时散衙，归府。府邸宏伟，亭台楼阁，奇花异石。与家人共进晚宴，饭后或在戏台听戏，或在书房品鉴古玩。',
    mood: '位极人臣，荣华富贵'
  },

  // ========== 皇室成员：亲王、郡王、太子、皇帝等 ==========
  royal: {
    morning: '日上三竿方醒，宫人侍候着梳洗更衣。膳房早已备好御膳，山珍海味，应有尽有。用膳后或批阅奏章，或在御花园散步。',
    afternoon: '午后召见大臣议政，或在书房习字作画。时有妃嫔前来请安，宫中莺歌燕舞，奢华至极。午膳依然是满汉全席，珍馐百味。',
    evening: '傍晚在御花园赏花观景，或在养心殿批阅奏章。晚膳后或召妃嫔侍寝，或独处书房。宫中灯火辉煌，夜夜笙歌。',
    mood: '富有四海，天下至尊'
  }
};

/**
 * 根据官职类型获取基础场景（主要用于mood）
 * @param category 官职类型
 * @returns 场景内容
 */
export function getSceneByCategory(
  category: OccupationCategory
): SceneContent {
  return SCENE_BY_OCCUPATION[category] || DEFAULT_SCENE;
}

/**
 * 应用修饰（城市、年限、福利等）+ 基于level的完整场景
 * 住所和加班描写自然融入到一天的叙述中
 * @param scene 基础场景（按category选择的模板）
 * @param modifiers 修饰参数
 * @returns 最终场景
 */
export function applySceneModifiers(
  scene: SceneContent,
  modifiers: {
    workEnv: string;
    cityTier: string;
    workYears: string;
    benefits: string;
    overtime: string;
    level: number;
  }
): SceneContent {
  const level = modifiers.level;
  
  // ========== 优先使用Level专属场景（每个level都有独特描写） ==========
  const levelDetail = LEVEL_SCENE_DETAILS[level];
  let result: SceneContent;
  
  if (levelDetail) {
    // 使用该level的专属场景，但保留category模板的mood作为基础
    result = {
      morning: levelDetail.morning,
      afternoon: levelDetail.highlight + ' ' + levelDetail.afternoon,
      evening: levelDetail.evening,
      mood: scene.mood // 保留category的基础mood
    };
  } else {
    // 没有专属场景时，使用category模板
    result = { ...scene };
  }
  
  // ========== 住所描写（融入早晨起床场景） ==========
  let morningResidence = '';
  if (level >= 67) {
    morningResidence = '从金碧辉煌的龙床上醒来，宫人们早已在旁伺候。';
  } else if (level >= 55) {
    morningResidence = '从雕花大床上醒来，仆人们已在门外等候。三进大宅，处处气派。';
  } else if (level >= 40) {
    morningResidence = '从紫檀木床上醒来，下人伺候着洗漱。宅院宽敞，假山花园一应俱全。';
  } else if (level >= 25) {
    morningResidence = '从干净整洁的床榻上醒来。砖瓦房舍虽不算豪华，却也温馨舒适。';
  } else if (level >= 10) {
    morningResidence = '从简陋的土炕上醒来。两间土房勉强遮风挡雨，好歹有个安身之所。';
  } else if (level >= 5) {
    morningResidence = '从租来的小屋醒来。一床一桌，聊以安身，每月租金倒也不贵。';
  } else {
    morningResidence = '从破旧的草席上醒来。茅屋四壁萧条，寒风从墙缝里钻进来。';
  }
  
  // ========== 住所描写（融入晚间归家场景） ==========
  let eveningResidence = '';
  if (level >= 67) {
    eveningResidence = '回到富丽堂皇的寝宫，宫人们伺候着沐浴更衣。';
  } else if (level >= 55) {
    eveningResidence = '回到宏伟的府邸，管家早已安排好一切。';
  } else if (level >= 40) {
    eveningResidence = '回到宽敞的宅院，下人们恭敬地迎接。';
  } else if (level >= 25) {
    eveningResidence = '回到温馨的小院，家人已备好热饭热菜。';
  } else if (level >= 10) {
    eveningResidence = '回到简陋的住所，点上油灯。';
  } else if (level >= 5) {
    eveningResidence = '回到租住的小屋，每月租金倒也不贵。';
  } else {
    eveningResidence = '回到破旧的茅屋，四壁透风。';
  }
  
  // ========== 直接使用levelDetail的内容（已经精简过，不包含起床/住所/收工描写） ==========
  const morningWork = result.morning;
  const eveningActivity = result.evening;
  
  // ========== 加班强度对场景的影响（融入叙述，保留工作内容） ==========
  if (modifiers.overtime === 'extreme') {
    // 极端加班：寅时/天未亮就起，深夜/亥时才归，倒头就睡
    result.morning = '寅时天还未亮便被叫醒，' + morningResidence + ' 匆匆洗漱，连早饭都顾不上吃便出门了。' + (morningWork || '');
    result.afternoon = result.afternoon + ' 午饭只能随便对付几口，片刻不得闲。';
    result.evening = '亥时才拖着疲惫的身躯归来。' + eveningResidence + ' 浑身酸痛，倒头便睡，连衣服都没力气换。';
  } else if (modifiers.overtime === '996') {
    // 996：卯时/天蒙蒙亮起，戌时/入夜才归
    result.morning = '卯时天蒙蒙亮便起身，' + morningResidence + ' 匆匆用过早膳，便急忙出门。' + (morningWork || '');
    result.afternoon = result.afternoon + ' 午休匆匆，便又投入忙碌的事务中。';
    result.evening = '戌时入夜方归。' + eveningResidence + ' ' + (eveningActivity ? eveningActivity + ' ' : '') + '疲惫不堪，每旬才得一日休沐。';
  } else if (modifiers.overtime === 'frequent') {
    // 偶尔加班：正常起，偶尔晚归
    result.morning = '卯时起身，' + morningResidence + ' 用过早膳，按时出门。' + (morningWork || '');
    result.afternoon = result.afternoon + ' 时有紧急事务需要加班处理。';
    result.evening = '酉时收工，偶尔需多留一会儿。' + eveningResidence + ' ' + (eveningActivity || '') + ' 虽然偶有加班，但尚能应付。';
  } else if (modifiers.overtime === 'flex') {
    // 弹性工作：睡到自然醒，悠闲自在
    result.morning = '睡到日上三竿才悠悠醒来。' + morningResidence + ' 从容用过早膳，不急不忙。' + (morningWork || '');
    result.afternoon = result.afternoon + ' 下午颇为悠闲，想歇便歇。';
    result.evening = '傍晚早早便收工了。' + eveningResidence + ' ' + (eveningActivity ? eveningActivity + ' ' : '') + '时间充裕，或品茗读书，或与家人闲话，甚是惬意。';
  } else {
    // 正常作息：日出而作，日落而息
    result.morning = '卯时起身，' + morningResidence + ' 从容用过早膳，按时出门。' + (morningWork || '');
    result.evening = '酉时准时收工。' + eveningResidence + ' ' + (eveningActivity || '') + ' 日出而作，日落而息，作息规律。';
  }
  
  // ========== 工作环境修饰 ==========
  if (modifiers.workEnv === 'remote') {
    result.morning = result.morning.replace('前往衙门', '在府中书房便可处理事务');
    result.morning = result.morning.replace('往衙门赶', '在家中便可处理事务');
    result.morning = result.morning.replace('赶往衙门', '在家中处理事务');
    result.morning = result.morning.replace('便出门了', '便在家中开始处理事务');
    result.morning = result.morning.replace('按时出门', '便开始处理事务');
    result.morning = result.morning.replace('出门', '开始处理事务');
  } else if (modifiers.workEnv === 'outdoor') {
    result.afternoon += ' 常需外出巡查，风吹日晒，颇为辛苦。';
  }
  
  // ========== 城市等级修饰 ==========
  if (modifiers.cityTier === '1') {
    result.morning = result.morning.replace('街市', '京师繁华街市');
    result.evening += ' 京师的夜晚依然灯火通明。';
  } else if (modifiers.cityTier === '2') {
    result.morning = result.morning.replace('街市', '省城街市');
  } else if (modifiers.cityTier === '4' || modifiers.cityTier === '5') {
    result.evening += ' 乡野宁静，满天繁星。';
  }
  
  // ========== 工作年限修饰 ==========
  if (modifiers.workYears === '0-1') {
    result.mood += '，初入此道，诸事生疏';
  } else if (modifiers.workYears === '15+') {
    result.afternoon += ' 不时有后辈前来请教，自己也乐于指点。';
    result.mood += '，资历深厚';
  }
  
  // ========== 福利待遇修饰 ==========
  if (modifiers.benefits === 'excellent') {
    if (level >= 40) {
      result.evening += ' 另有朝廷厚赏，生活极尽奢华。';
    } else if (level >= 15) {
      result.evening += ' 另有恩赏补贴，生活甚是优渥。';
    } else {
      result.evening += ' 偶有赏赐，日子比旁人好过些。';
    }
  } else if (modifiers.benefits === 'poor') {
    if (level >= 40) {
      result.evening += ' 虽位高权重，俸禄却不甚丰厚。';
    } else {
      result.mood += '，俸禄微薄';
    }
  }
  
  // ========== 综合mood（加班强度 + 其他因素） ==========
  if (modifiers.overtime === '996') {
    if (modifiers.cityTier === '1') {
      result.mood = '京师繁华背后，是无尽的疲惫';
    } else {
      result.mood = '身心俱疲，只盼熬过这一关';
    }
  } else if (modifiers.overtime === 'extreme') {
    if (modifiers.benefits === 'poor') {
      result.mood = '卖命如牛马，所得不及温饱';
    } else {
      result.mood = '殚精竭虑，如履薄冰';
    }
  } else if (modifiers.overtime === 'flex') {
    if (modifiers.workEnv === 'remote' && modifiers.benefits === 'excellent') {
      result.mood = '神仙眷侣般的日子';
    } else if (level >= 60) {
      result.mood = '位极人臣，逍遥自在';
    } else if (level >= 40) {
      result.mood = '仕途顺遂，前程似锦';
    } else if (level >= 20) {
      result.mood = '悠然自得，小日子过得不错';
    } else {
      result.mood = '虽不富裕，但悠闲自在';
    }
  }
  
  return result;
}
