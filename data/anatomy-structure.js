/* 解剖生理: 問題未生成の系統(空単元)の分類骨組み。
 * 分類マスターから自動生成。手編集しない。
 * 神経系は実データ(nervous-system.js)を使うためここには含めない。
 * 各リーフは questions を持たない(0問)。範囲選択ツリーに構造として表示される。
 * 単元数=11 / リーフ総数=255
 */
(function () {
  var UNITS = [
 {
  "id": "general",
  "name": "総論",
  "order": 0,
  "nodes": [
   {
    "name": "0.1 細胞",
    "children": [
     {
      "name": "細胞の全体構造と細胞小器官",
      "leaf": "general#0"
     },
     {
      "name": "核・DNA・染色体",
      "leaf": "general#1"
     },
     {
      "name": "細胞膜の構造（脂質二重層・膜タンパク）",
      "leaf": "general#2"
     },
     {
      "name": "拡散と浸透",
      "leaf": "general#3"
     },
     {
      "name": "能動輸送（Na-K ポンプなど）",
      "leaf": "general#4"
     },
     {
      "name": "エンドサイトーシス・エキソサイトーシス",
      "leaf": "general#5"
     },
     {
      "name": "体細胞分裂の過程",
      "leaf": "general#6"
     },
     {
      "name": "減数分裂と生殖細胞",
      "leaf": "general#7"
     },
     {
      "name": "DNA複製と修復",
      "leaf": "general#8"
     },
     {
      "name": "転写と翻訳（タンパク合成）",
      "leaf": "general#9"
     }
    ]
   },
   {
    "name": "0.2 組織",
    "children": [
     {
      "name": "上皮組織の分類（形・層）",
      "leaf": "general#10"
     },
     {
      "name": "腺上皮（外分泌・内分泌）",
      "leaf": "general#11"
     },
     {
      "name": "結合組織（線維性・脂肪）",
      "leaf": "general#12"
     },
     {
      "name": "支持組織（軟骨・骨）",
      "leaf": "general#13"
     },
     {
      "name": "筋組織3種の比較",
      "leaf": "general#14"
     },
     {
      "name": "神経組織の概観",
      "leaf": "general#15"
     }
    ]
   },
   {
    "name": "0.3 人体の構成",
    "children": [
     {
      "name": "方向・面・体位の用語",
      "leaf": "general#16"
     },
     {
      "name": "体腔と漿膜",
      "leaf": "general#17"
     }
    ]
   },
   {
    "name": "0.4 恒常性と基礎調節",
    "children": [
     {
      "name": "ホメオスタシスの概念",
      "leaf": "general#18"
     },
     {
      "name": "ネガティブ／ポジティブフィードバック",
      "leaf": "general#19"
     },
     {
      "name": "体液区分（細胞内液・細胞外液・血漿）",
      "leaf": "general#20"
     },
     {
      "name": "体液の浸透圧とpH（定義）",
      "leaf": "general#21"
     },
     {
      "name": "産熱と放熱のしくみ（概観）",
      "leaf": "general#22"
     }
    ]
   }
  ]
 },
 {
  "id": "locomotor",
  "name": "運動器系",
  "order": 1,
  "nodes": [
   {
    "name": "1.1 骨",
    "children": [
     {
      "name": "骨の分類（長・短・扁平・不規則）",
      "leaf": "locomotor#23"
     },
     {
      "name": "骨の微細構造（緻密骨・海綿骨・骨単位）",
      "leaf": "locomotor#24"
     },
     {
      "name": "骨の発生（軟骨内骨化・膜内骨化）",
      "leaf": "locomotor#25"
     },
     {
      "name": "骨の成長と骨端線",
      "leaf": "locomotor#26"
     },
     {
      "name": "骨のリモデリングとCa代謝",
      "leaf": "locomotor#27"
     },
     {
      "name": "頭蓋骨（脳頭蓋・顔面頭蓋）",
      "leaf": "locomotor#28"
     },
     {
      "name": "脊柱",
      "leaf": "locomotor#29"
     },
     {
      "name": "胸郭",
      "leaf": "locomotor#30"
     },
     {
      "name": "上肢骨",
      "leaf": "locomotor#31"
     },
     {
      "name": "下肢骨",
      "leaf": "locomotor#32"
     }
    ]
   },
   {
    "name": "1.2 関節",
    "children": [
     {
      "name": "関節の分類（不動・半可動・可動）",
      "leaf": "locomotor#33"
     },
     {
      "name": "滑膜性関節の構造",
      "leaf": "locomotor#34"
     },
     {
      "name": "関節運動の用語（屈曲・伸展・回旋等）",
      "leaf": "locomotor#35"
     },
     {
      "name": "上肢の主要関節（肩・肘・手）",
      "leaf": "locomotor#36"
     },
     {
      "name": "下肢の主要関節（股・膝・足）",
      "leaf": "locomotor#37"
     }
    ]
   },
   {
    "name": "1.3 骨格筋",
    "children": [
     {
      "name": "骨格筋の肉眼構造（起始・停止・腱）",
      "leaf": "locomotor#38"
     },
     {
      "name": "筋線維の微細構造",
      "leaf": "locomotor#39"
     },
     {
      "name": "サルコメアと収縮タンパク",
      "leaf": "locomotor#40"
     },
     {
      "name": "神経筋接合部",
      "leaf": "locomotor#41"
     },
     {
      "name": "興奮収縮連関",
      "leaf": "locomotor#42"
     },
     {
      "name": "筋収縮の様式（等尺・等張・単収縮・強縮）",
      "leaf": "locomotor#43"
     },
     {
      "name": "筋のエネルギー代謝",
      "leaf": "locomotor#44"
     },
     {
      "name": "頭頚部の主要筋",
      "leaf": "locomotor#45"
     },
     {
      "name": "体幹の主要筋",
      "leaf": "locomotor#46"
     },
     {
      "name": "上肢の主要筋",
      "leaf": "locomotor#47"
     },
     {
      "name": "下肢の主要筋",
      "leaf": "locomotor#48"
     }
    ]
   }
  ]
 },
 {
  "id": "sensory",
  "name": "感覚器系",
  "order": 3,
  "nodes": [
   {
    "name": "3.1 視覚器（眼）",
    "children": [
     {
      "name": "眼球壁の3層構造（線維膜・血管膜・網膜）",
      "leaf": "sensory#49"
     },
     {
      "name": "前眼房・水晶体・硝子体",
      "leaf": "sensory#50"
     },
     {
      "name": "網膜の層構造と光受容細胞",
      "leaf": "sensory#51"
     },
     {
      "name": "視覚伝導路",
      "leaf": "sensory#52"
     },
     {
      "name": "遠近調節（毛様体と水晶体）",
      "leaf": "sensory#53"
     },
     {
      "name": "対光反射・輻輳反射",
      "leaf": "sensory#54"
     },
     {
      "name": "眼の付属器（眼瞼・涙器・外眼筋）",
      "leaf": "sensory#55"
     }
    ]
   },
   {
    "name": "3.2 聴覚・平衡覚（耳）",
    "children": [
     {
      "name": "外耳の構造",
      "leaf": "sensory#56"
     },
     {
      "name": "中耳と耳小骨",
      "leaf": "sensory#57"
     },
     {
      "name": "内耳・蝸牛の構造",
      "leaf": "sensory#58"
     },
     {
      "name": "音の伝導と聴覚受容",
      "leaf": "sensory#59"
     },
     {
      "name": "聴覚伝導路",
      "leaf": "sensory#60"
     },
     {
      "name": "前庭・半規管の構造",
      "leaf": "sensory#61"
     },
     {
      "name": "平衡覚の伝導",
      "leaf": "sensory#62"
     }
    ]
   },
   {
    "name": "3.3 化学感覚",
    "children": [
     {
      "name": "嗅覚器と嗅覚伝導路",
      "leaf": "sensory#63"
     },
     {
      "name": "味覚器と味覚伝導路",
      "leaf": "sensory#64"
     }
    ]
   },
   {
    "name": "3.4 皮膚・外皮",
    "children": [
     {
      "name": "表皮の層構造",
      "leaf": "sensory#65"
     },
     {
      "name": "真皮と皮下組織",
      "leaf": "sensory#66"
     },
     {
      "name": "皮膚の付属器（毛・爪・皮膚腺）",
      "leaf": "sensory#67"
     },
     {
      "name": "皮膚感覚の受容器",
      "leaf": "sensory#68"
     },
     {
      "name": "皮膚感覚の伝導路",
      "leaf": "sensory#69"
     }
    ]
   }
  ]
 },
 {
  "id": "endocrine",
  "name": "内分泌系",
  "order": 4,
  "nodes": [
   {
    "name": "4.1 内分泌総論",
    "children": [
     {
      "name": "ホルモンの分類（ペプチド・ステロイド・アミン）",
      "leaf": "endocrine#70"
     },
     {
      "name": "受容体と作用機序（膜受容体・核内受容体）",
      "leaf": "endocrine#71"
     },
     {
      "name": "フィードバック調節（長環・短環）",
      "leaf": "endocrine#72"
     },
     {
      "name": "内分泌軸の概念",
      "leaf": "endocrine#73"
     }
    ]
   },
   {
    "name": "4.2 視床下部・下垂体",
    "children": [
     {
      "name": "視床下部ホルモン（放出／抑制因子）",
      "leaf": "endocrine#74"
     },
     {
      "name": "下垂体の構造（前葉・後葉・門脈系）",
      "leaf": "endocrine#75"
     },
     {
      "name": "成長ホルモン（GH）",
      "leaf": "endocrine#76"
     },
     {
      "name": "プロラクチン",
      "leaf": "endocrine#77"
     },
     {
      "name": "TSH・ACTH・ゴナドトロピン（LH・FSH）",
      "leaf": "endocrine#78"
     },
     {
      "name": "ADH（バソプレシン）",
      "leaf": "endocrine#79"
     },
     {
      "name": "オキシトシン",
      "leaf": "endocrine#80"
     }
    ]
   },
   {
    "name": "4.3 甲状腺・副甲状腺",
    "children": [
     {
      "name": "甲状腺の構造とT3/T4合成",
      "leaf": "endocrine#81"
     },
     {
      "name": "甲状腺ホルモンの作用",
      "leaf": "endocrine#82"
     },
     {
      "name": "カルシトニン",
      "leaf": "endocrine#83"
     },
     {
      "name": "副甲状腺ホルモン（PTH）",
      "leaf": "endocrine#84"
     },
     {
      "name": "血中Ca・P調節（PTH・カルシトニン・活性型ビタミンD）",
      "leaf": "endocrine#85"
     }
    ]
   },
   {
    "name": "4.4 副腎",
    "children": [
     {
      "name": "副腎皮質の層構造",
      "leaf": "endocrine#86"
     },
     {
      "name": "糖質コルチコイド",
      "leaf": "endocrine#87"
     },
     {
      "name": "電解質コルチコイド（アルドステロン）",
      "leaf": "endocrine#88"
     },
     {
      "name": "副腎性アンドロゲン",
      "leaf": "endocrine#89"
     },
     {
      "name": "副腎髄質ホルモン（カテコールアミン）",
      "leaf": "endocrine#90"
     }
    ]
   },
   {
    "name": "4.5 膵島",
    "children": [
     {
      "name": "膵島の構造（α・β・δ細胞）",
      "leaf": "endocrine#91"
     },
     {
      "name": "インスリンの作用",
      "leaf": "endocrine#92"
     },
     {
      "name": "グルカゴンの作用",
      "leaf": "endocrine#93"
     },
     {
      "name": "血糖調節の全体像",
      "leaf": "endocrine#94"
     }
    ]
   },
   {
    "name": "4.6 その他の内分泌",
    "children": [
     {
      "name": "性腺ホルモン（テストステロン・エストロゲン・プロゲステロン）",
      "leaf": "endocrine#95"
     },
     {
      "name": "松果体とメラトニン",
      "leaf": "endocrine#96"
     },
     {
      "name": "消化管ホルモン（ガストリン・セクレチン・CCK等）",
      "leaf": "endocrine#97"
     },
     {
      "name": "心房性ナトリウム利尿ペプチド（ANP）",
      "leaf": "endocrine#98"
     }
    ]
   }
  ]
 },
 {
  "id": "circulatory",
  "name": "循環器系",
  "order": 5,
  "nodes": [
   {
    "name": "5.1 心臓",
    "children": [
     {
      "name": "心臓の位置と外形",
      "leaf": "circulatory#99"
     },
     {
      "name": "心房・心室・心中隔",
      "leaf": "circulatory#100"
     },
     {
      "name": "心臓弁（房室弁・半月弁）",
      "leaf": "circulatory#101"
     },
     {
      "name": "冠状動脈と冠循環",
      "leaf": "circulatory#102"
     },
     {
      "name": "心筋の性質（自動能・不応期）",
      "leaf": "circulatory#103"
     },
     {
      "name": "洞房結節と歩調取り",
      "leaf": "circulatory#104"
     },
     {
      "name": "刺激伝導系",
      "leaf": "circulatory#105"
     },
     {
      "name": "心周期（拡張期・収縮期）",
      "leaf": "circulatory#106"
     },
     {
      "name": "心音（Ⅰ音・Ⅱ音）",
      "leaf": "circulatory#107"
     },
     {
      "name": "心電図の基礎（P・QRS・T波の意味）",
      "leaf": "circulatory#108"
     },
     {
      "name": "心拍出量とその規定因子",
      "leaf": "circulatory#109"
     },
     {
      "name": "フランク・スターリングの法則",
      "leaf": "circulatory#110"
     }
    ]
   },
   {
    "name": "5.2 血管系",
    "children": [
     {
      "name": "動脈の構造",
      "leaf": "circulatory#111"
     },
     {
      "name": "静脈と静脈弁",
      "leaf": "circulatory#112"
     },
     {
      "name": "毛細血管と物質交換（スターリングの法則）",
      "leaf": "circulatory#113"
     },
     {
      "name": "体循環と肺循環",
      "leaf": "circulatory#114"
     },
     {
      "name": "頭頚部の主要動脈",
      "leaf": "circulatory#115"
     },
     {
      "name": "上肢の主要動脈",
      "leaf": "circulatory#116"
     },
     {
      "name": "胸腹部大動脈と主要分枝",
      "leaf": "circulatory#117"
     },
     {
      "name": "下肢の主要動脈",
      "leaf": "circulatory#118"
     },
     {
      "name": "上大静脈系・下大静脈系",
      "leaf": "circulatory#119"
     },
     {
      "name": "門脈系",
      "leaf": "circulatory#120"
     }
    ]
   },
   {
    "name": "5.3 循環の調節",
    "children": [
     {
      "name": "血圧の規定因子（心拍出量・末梢抵抗）",
      "leaf": "circulatory#121"
     },
     {
      "name": "圧受容器反射（頚動脈洞・大動脈弓）",
      "leaf": "circulatory#122"
     },
     {
      "name": "血圧の体液性調節（RAA系）",
      "leaf": "circulatory#123"
     },
     {
      "name": "局所循環の調節（脳・冠・皮膚）",
      "leaf": "circulatory#124"
     }
    ]
   },
   {
    "name": "5.4 リンパ系",
    "children": [
     {
      "name": "リンパ管とリンパ節",
      "leaf": "circulatory#125"
     },
     {
      "name": "胸管とリンパ還流",
      "leaf": "circulatory#126"
     },
     {
      "name": "脾臓の構造と機能",
      "leaf": "circulatory#127"
     },
     {
      "name": "胸腺",
      "leaf": "circulatory#128"
     }
    ]
   }
  ]
 },
 {
  "id": "hematoimmune",
  "name": "血液・免疫系",
  "order": 6,
  "nodes": [
   {
    "name": "6.1 血液の組成",
    "children": [
     {
      "name": "血液の機能と量",
      "leaf": "hematoimmune#129"
     },
     {
      "name": "血漿の成分（血漿タンパク）",
      "leaf": "hematoimmune#130"
     },
     {
      "name": "血球の種類と割合",
      "leaf": "hematoimmune#131"
     },
     {
      "name": "造血の場と造血幹細胞",
      "leaf": "hematoimmune#132"
     }
    ]
   },
   {
    "name": "6.2 赤血球",
    "children": [
     {
      "name": "赤血球の構造とライフサイクル",
      "leaf": "hematoimmune#133"
     },
     {
      "name": "ヘモグロビンの構造と機能",
      "leaf": "hematoimmune#134"
     },
     {
      "name": "鉄代謝",
      "leaf": "hematoimmune#135"
     },
     {
      "name": "赤血球の崩壊とビリルビン代謝",
      "leaf": "hematoimmune#136"
     }
    ]
   },
   {
    "name": "6.3 止血",
    "children": [
     {
      "name": "血小板と一次止血",
      "leaf": "hematoimmune#137"
     },
     {
      "name": "凝固カスケード（内因系・外因系・共通経路）",
      "leaf": "hematoimmune#138"
     },
     {
      "name": "線溶系",
      "leaf": "hematoimmune#139"
     }
    ]
   },
   {
    "name": "6.4 白血球",
    "children": [
     {
      "name": "好中球・好酸球・好塩基球",
      "leaf": "hematoimmune#140"
     },
     {
      "name": "リンパ球（T・B・NK）",
      "leaf": "hematoimmune#141"
     },
     {
      "name": "単球・マクロファージ",
      "leaf": "hematoimmune#142"
     }
    ]
   },
   {
    "name": "6.5 免疫",
    "children": [
     {
      "name": "自然免疫（バリア・食作用）",
      "leaf": "hematoimmune#143"
     },
     {
      "name": "補体系",
      "leaf": "hematoimmune#144"
     },
     {
      "name": "抗原提示とMHC",
      "leaf": "hematoimmune#145"
     },
     {
      "name": "細胞性免疫（T細胞）",
      "leaf": "hematoimmune#146"
     },
     {
      "name": "液性免疫（B細胞と抗体産生）",
      "leaf": "hematoimmune#147"
     },
     {
      "name": "抗体（免疫グロブリン）の種類と機能",
      "leaf": "hematoimmune#148"
     },
     {
      "name": "アレルギー反応の分類（Ⅰ〜Ⅳ型）",
      "leaf": "hematoimmune#149"
     }
    ]
   },
   {
    "name": "6.6 血液型",
    "children": [
     {
      "name": "ABO式血液型",
      "leaf": "hematoimmune#150"
     },
     {
      "name": "Rh式血液型",
      "leaf": "hematoimmune#151"
     },
     {
      "name": "輸血の適合と交差適合",
      "leaf": "hematoimmune#152"
     }
    ]
   }
  ]
 },
 {
  "id": "respiratory",
  "name": "呼吸器系",
  "order": 7,
  "nodes": [
   {
    "name": "7.1 呼吸器の構造",
    "children": [
     {
      "name": "鼻腔・副鼻腔",
      "leaf": "respiratory#153"
     },
     {
      "name": "咽頭・喉頭",
      "leaf": "respiratory#154"
     },
     {
      "name": "気管・気管支の分岐",
      "leaf": "respiratory#155"
     },
     {
      "name": "肺の外形と分葉",
      "leaf": "respiratory#156"
     },
     {
      "name": "肺胞と呼吸細気管支",
      "leaf": "respiratory#157"
     },
     {
      "name": "胸膜と胸膜腔",
      "leaf": "respiratory#158"
     },
     {
      "name": "胸郭と横隔膜",
      "leaf": "respiratory#159"
     }
    ]
   },
   {
    "name": "7.2 換気",
    "children": [
     {
      "name": "呼吸運動のしくみ（吸息・呼息）",
      "leaf": "respiratory#160"
     },
     {
      "name": "呼吸筋（横隔膜・肋間筋）",
      "leaf": "respiratory#161"
     },
     {
      "name": "肺気量（TLC・VC・FRC等）",
      "leaf": "respiratory#162"
     },
     {
      "name": "換気量（一回換気量・肺胞換気量・死腔）",
      "leaf": "respiratory#163"
     }
    ]
   },
   {
    "name": "7.3 ガス交換と運搬",
    "children": [
     {
      "name": "肺胞でのガス交換",
      "leaf": "respiratory#164"
     },
     {
      "name": "換気血流比",
      "leaf": "respiratory#165"
     },
     {
      "name": "酸素の運搬と酸素解離曲線",
      "leaf": "respiratory#166"
     },
     {
      "name": "二酸化炭素の運搬",
      "leaf": "respiratory#167"
     },
     {
      "name": "酸塩基平衡と呼吸性代償",
      "leaf": "respiratory#168"
     }
    ]
   },
   {
    "name": "7.4 呼吸の調節",
    "children": [
     {
      "name": "呼吸中枢（延髄・橋）",
      "leaf": "respiratory#169"
     },
     {
      "name": "中枢性・末梢性化学受容器",
      "leaf": "respiratory#170"
     },
     {
      "name": "反射性の呼吸調節（ヘーリング・ブロイアー等）",
      "leaf": "respiratory#171"
     }
    ]
   }
  ]
 },
 {
  "id": "digestive",
  "name": "消化器系・代謝",
  "order": 8,
  "nodes": [
   {
    "name": "8.1 消化管の構造と運動",
    "children": [
     {
      "name": "消化管壁の4層構造",
      "leaf": "digestive#172"
     },
     {
      "name": "消化管の神経支配（腸神経系・自律神経）",
      "leaf": "digestive#173"
     },
     {
      "name": "消化管運動（蠕動・分節運動）",
      "leaf": "digestive#174"
     }
    ]
   },
   {
    "name": "8.2 各部位の構造と消化",
    "children": [
     {
      "name": "口腔と唾液腺",
      "leaf": "digestive#175"
     },
     {
      "name": "咀嚼と嚥下",
      "leaf": "digestive#176"
     },
     {
      "name": "食道",
      "leaf": "digestive#177"
     },
     {
      "name": "胃の構造と胃液分泌",
      "leaf": "digestive#178"
     },
     {
      "name": "胃の運動と排出",
      "leaf": "digestive#179"
     },
     {
      "name": "小腸の構造（十二指腸・空腸・回腸）",
      "leaf": "digestive#180"
     },
     {
      "name": "小腸の運動と消化",
      "leaf": "digestive#181"
     },
     {
      "name": "大腸の構造",
      "leaf": "digestive#182"
     },
     {
      "name": "排便のしくみ",
      "leaf": "digestive#183"
     }
    ]
   },
   {
    "name": "8.3 消化器付属器",
    "children": [
     {
      "name": "肝臓の肉眼構造",
      "leaf": "digestive#184"
     },
     {
      "name": "肝小葉の微細構造",
      "leaf": "digestive#185"
     },
     {
      "name": "肝臓の機能（解毒・タンパク合成）",
      "leaf": "digestive#186"
     },
     {
      "name": "胆嚢と胆汁",
      "leaf": "digestive#187"
     },
     {
      "name": "膵臓の外分泌",
      "leaf": "digestive#188"
     }
    ]
   },
   {
    "name": "8.4 消化と吸収",
    "children": [
     {
      "name": "糖質の消化と吸収",
      "leaf": "digestive#189"
     },
     {
      "name": "タンパク質の消化と吸収",
      "leaf": "digestive#190"
     },
     {
      "name": "脂質の消化と吸収",
      "leaf": "digestive#191"
     },
     {
      "name": "水・電解質の吸収",
      "leaf": "digestive#192"
     },
     {
      "name": "ビタミンの吸収",
      "leaf": "digestive#193"
     }
    ]
   },
   {
    "name": "8.5 代謝",
    "children": [
     {
      "name": "解糖系・TCA回路・電子伝達系",
      "leaf": "digestive#194"
     },
     {
      "name": "糖新生とグリコーゲン代謝",
      "leaf": "digestive#195"
     },
     {
      "name": "脂質代謝（β酸化・脂肪酸合成）",
      "leaf": "digestive#196"
     },
     {
      "name": "タンパク質・アミノ酸代謝",
      "leaf": "digestive#197"
     },
     {
      "name": "尿素サイクル",
      "leaf": "digestive#198"
     },
     {
      "name": "基礎代謝と呼吸商",
      "leaf": "digestive#199"
     },
     {
      "name": "ビタミンと必須栄養素",
      "leaf": "digestive#200"
     }
    ]
   }
  ]
 },
 {
  "id": "urinary",
  "name": "泌尿器系・体液調節",
  "order": 9,
  "nodes": [
   {
    "name": "9.1 腎の構造",
    "children": [
     {
      "name": "腎臓の位置と外形",
      "leaf": "urinary#201"
     },
     {
      "name": "腎の内部構造（皮質・髄質）",
      "leaf": "urinary#202"
     },
     {
      "name": "ネフロンの構成（糸球体・尿細管）",
      "leaf": "urinary#203"
     },
     {
      "name": "腎の血管系（輸入・輸出細動脈）",
      "leaf": "urinary#204"
     },
     {
      "name": "尿路の構造（尿管・膀胱・尿道）",
      "leaf": "urinary#205"
     }
    ]
   },
   {
    "name": "9.2 尿生成",
    "children": [
     {
      "name": "糸球体濾過（GFR）",
      "leaf": "urinary#206"
     },
     {
      "name": "近位尿細管での再吸収",
      "leaf": "urinary#207"
     },
     {
      "name": "ヘンレループと対向流系",
      "leaf": "urinary#208"
     },
     {
      "name": "遠位尿細管・集合管",
      "leaf": "urinary#209"
     },
     {
      "name": "尿の濃縮と希釈",
      "leaf": "urinary#210"
     },
     {
      "name": "クリアランスの概念",
      "leaf": "urinary#211"
     }
    ]
   },
   {
    "name": "9.3 体液・電解質の調節",
    "children": [
     {
      "name": "体液量と浸透圧の調節（ADH）",
      "leaf": "urinary#212"
     },
     {
      "name": "RAA系による調節",
      "leaf": "urinary#213"
     },
     {
      "name": "Na・Kの調節",
      "leaf": "urinary#214"
     },
     {
      "name": "Ca・P・Mgの調節",
      "leaf": "urinary#215"
     }
    ]
   },
   {
    "name": "9.4 酸塩基平衡",
    "children": [
     {
      "name": "緩衝系（重炭酸・タンパク・リン酸）",
      "leaf": "urinary#216"
     },
     {
      "name": "呼吸性の酸塩基調節",
      "leaf": "urinary#217"
     },
     {
      "name": "腎による酸塩基調節（H⁺排泄・HCO₃⁻再生）",
      "leaf": "urinary#218"
     }
    ]
   },
   {
    "name": "9.5 排尿",
    "children": [
     {
      "name": "蓄尿と排尿の神経支配",
      "leaf": "urinary#219"
     },
     {
      "name": "排尿反射",
      "leaf": "urinary#220"
     }
    ]
   }
  ]
 },
 {
  "id": "reproductive",
  "name": "生殖器系",
  "order": 10,
  "nodes": [
   {
    "name": "10.1 男性生殖器",
    "children": [
     {
      "name": "精巣の構造",
      "leaf": "reproductive#221"
     },
     {
      "name": "精子形成",
      "leaf": "reproductive#222"
     },
     {
      "name": "精路（精巣上体・精管・射精管）",
      "leaf": "reproductive#223"
     },
     {
      "name": "副生殖腺（精嚢・前立腺・尿道球腺）",
      "leaf": "reproductive#224"
     },
     {
      "name": "陰茎と勃起・射精",
      "leaf": "reproductive#225"
     },
     {
      "name": "男性ホルモン（テストステロン）",
      "leaf": "reproductive#226"
     }
    ]
   },
   {
    "name": "10.2 女性生殖器",
    "children": [
     {
      "name": "卵巣の構造",
      "leaf": "reproductive#227"
     },
     {
      "name": "卵胞の発育と卵子形成",
      "leaf": "reproductive#228"
     },
     {
      "name": "卵管",
      "leaf": "reproductive#229"
     },
     {
      "name": "子宮の構造",
      "leaf": "reproductive#230"
     },
     {
      "name": "腟と外陰",
      "leaf": "reproductive#231"
     },
     {
      "name": "女性ホルモン（エストロゲン・プロゲステロン）",
      "leaf": "reproductive#232"
     },
     {
      "name": "乳房と乳汁分泌",
      "leaf": "reproductive#233"
     }
    ]
   },
   {
    "name": "10.3 性周期・受精・妊娠",
    "children": [
     {
      "name": "卵巣周期",
      "leaf": "reproductive#234"
     },
     {
      "name": "子宮内膜（月経）周期",
      "leaf": "reproductive#235"
     },
     {
      "name": "受精と卵管移送",
      "leaf": "reproductive#236"
     },
     {
      "name": "着床と胎盤形成",
      "leaf": "reproductive#237"
     },
     {
      "name": "胎盤の機能",
      "leaf": "reproductive#238"
     },
     {
      "name": "妊娠中の母体変化",
      "leaf": "reproductive#239"
     },
     {
      "name": "分娩の生理",
      "leaf": "reproductive#240"
     }
    ]
   }
  ]
 },
 {
  "id": "development",
  "name": "発生・成長・老化",
  "order": 11,
  "nodes": [
   {
    "name": "11.1 発生",
    "children": [
     {
      "name": "配偶子形成",
      "leaf": "development#241"
     },
     {
      "name": "受精と卵割",
      "leaf": "development#242"
     },
     {
      "name": "胚盤胞と着床",
      "leaf": "development#243"
     },
     {
      "name": "三胚葉の形成",
      "leaf": "development#244"
     },
     {
      "name": "神経管と体節",
      "leaf": "development#245"
     },
     {
      "name": "器官形成の概観",
      "leaf": "development#246"
     },
     {
      "name": "胎児循環",
      "leaf": "development#247"
     }
    ]
   },
   {
    "name": "11.2 成長・発達",
    "children": [
     {
      "name": "新生児期・乳児期の生理的特徴",
      "leaf": "development#248"
     },
     {
      "name": "幼児期・学童期の成長",
      "leaf": "development#249"
     },
     {
      "name": "第二次性徴と思春期",
      "leaf": "development#250"
     }
    ]
   },
   {
    "name": "11.3 老化",
    "children": [
     {
      "name": "循環・呼吸・腎の加齢変化",
      "leaf": "development#251"
     },
     {
      "name": "骨格筋・骨の加齢変化",
      "leaf": "development#252"
     },
     {
      "name": "神経・感覚器の加齢変化",
      "leaf": "development#253"
     },
     {
      "name": "内分泌・代謝の加齢変化",
      "leaf": "development#254"
     }
    ]
   }
  ]
 }
];
  UNITS.forEach(function (u) {
    window.QuizBank.registerUnit('anatomy', {
      id: u.id, name: u.name, order: u.order, schema: 2,
      nodes: u.nodes, questions: []
    });
  });
})();
