/* ============================================================
   올팍프리(OLPARK FREE) 데이터 정의
   ------------------------------------------------------------
   출처(모두 실제 확인):
   1) 한국체육산업개발(주) 올림픽공원 공연정보 (공공데이터포털 3037877, 오픈API)
      공연 일정: https://www.ksponco.or.kr/olympicpark/eventInfo/eventInfoList?mid=a20301010100
      (2026-11-24 확인)
   2) 공연장별 시설·교통 안내(공연 상세 페이지의 장소안내)
   3) 올림픽공원 주차장 이용 안내(장애인 주차구역 면수), 2025-12-09
      https://www.ksponco.or.kr/board.es?act=view&bid=0046&list_no=82568&mid=a10301000000
   4) 올림픽공원 편의시설(안내센터 대여물품·운영시간)
      https://www.ksponco.or.kr/olympicpark/menu.es?mid=a20106010000
   5) 고객의 소리 답변(만남의광장 수유실 운영 중지), 2025-03-03
   6) 올림픽수영장 요금/시간안내(아쿠아로빅·실버반·자유수영)
   7) 한국관광공사 열린관광 모두의 여행 - 올림픽공원 무장애 정보
   ============================================================ */

const OLPARK = {};

/* ---------- 1. 확인된 공연 정보 (2026-11-24 기준) ---------- */
OLPARK.performances = [
  {
    id: "cho-yongpil-2026",
    title: "2026 조용필 & 위대한탄생 콘서트",
    venueId: "kspo-dome",
    period: "2026-11-27 ~ 2026-11-29",
    times: "11/27(금) 19:00 · 11/28(토) 18:00 · 11/29(일) 17:00",
    price: "VIP 176,000원 / R 165,000원 / S 143,000원 / A 110,000원",
    age: "8세 이상",
    runtime: "130분",
    tel: "1544-6399",
    source: "https://www.ksponco.or.kr/olympicpark/eventInfo/eventInfoView.es?mid=a20301010100&evtSeq=5159",
  },
  {
    id: "dynamicduo-2026",
    title: "2026 다이나믹 듀오 단독 콘서트 〈가끔씩 오래 보자〉",
    venueId: "olympic-hall",
    period: "2026-11-27 ~ 2026-11-29",
    times: "11/27(금) 20:00 · 11/28(토) 18:00 · 11/29(일) 17:00",
    price: "지정석 143,000원",
    age: "만 7세 이상",
    runtime: "상세페이지 미표기",
    tel: "1544-1555",
    source: "https://www.ksponco.or.kr/olympicpark/eventInfo/eventInfoView.es?mid=a20301010100&evtSeq=5168",
  },
  {
    id: "choi-hyunwoo-2026",
    title: "최현우 30주년 기념 공연 - LEGACY",
    venueId: "woori-art-hall",
    period: "2026-11-28 ~ 2027-01-03",
    times: "수·목·금 19:30 · 토 15:00/19:00 · 일 14:00 (일자별 변동)",
    price: "VIP 110,000원 / R 99,000원 / S 77,000원",
    age: "8세 이상",
    runtime: "120분",
    tel: "1688-6675",
    source: "https://www.ksponco.or.kr/olympicpark/eventInfo/eventInfoView.es?mid=a20301010100&evtSeq=5136",
  },
];

/* 지난 공연(참고) — 공연정보 데이터의 이력 확인용 */
OLPARK.pastPerformances = [
  { title: "2026-27 로이킴 LIVE TOUR [R:O:Y] in SEOUL", venue: "KSPO DOME", period: "2026-11-21 ~ 11-22" },
  { title: "2026 CRAVITY CONCERT 〈SONOROUS〉 in Seoul", venue: "올림픽홀", period: "2026-11-14 ~ 11-15" },
  { title: "TOMORROW X TOGETHER WORLD TOUR 〈STEAL THE WIND〉", venue: "KSPO DOME", period: "2026-11-13 ~ 11-15" },
];

/* ---------- 2. 공연장 정보 (시설·교통·장애인 편의) ---------- */
OLPARK.venues = {
  "kspo-dome": {
    name: "KSPO DOME(올림픽체조경기장)",
    short: "KSPO DOME",
    seats: "15,000석",
    gate: "동2문, 북2문",
    gateNote: "차량 진입 후 가장 가까운 관람 동선",
    parkingLot: "P5",
    parkingLotInfo: "P5 (06:00~22:00), 181대",
    parkingLotShortHours: "06:00~22:00",
    disabledSpaces: 10,
    disabledZone: "체조경기장",
    subway: "5호선·9호선 올림픽공원역 3번 출구",
    subwayStation: "olympic-park",
    bus: "지선 3216·3412·3413·3414 / 경기버스 30·30-5",
    wheelchairSeats: "공식 안내에 좌석 수 미표기 — 예매처·공연장 문의 필요",
    caption: "별도 안내 없음",
    accessibleNote: "수납식 객석 구조로 공연별 객석 배치가 달라져 휠체어석 위치는 공연별 확인 필요",
  },
  "olympic-hall": {
    name: "올림픽홀",
    short: "올림픽홀",
    seats: "고정 2,432석(이동식 포함), 플로어 500~600석",
    gate: "동2문",
    gateNote: "차량 진입 후 가장 가까운 관람 동선",
    parkingLot: "P2",
    parkingLotInfo: "P2 (06:00~23:00), 380대",
    parkingLotShortHours: "06:00~23:00",
    disabledSpaces: 5,
    disabledZone: "올림픽홀",
    subway: "5호선 올림픽공원역 3번 출구",
    subwayStation: "olympic-park",
    bus: "지선 3212·3214·3316·3413·4213 / 간선 371 / 공항버스 606 / 경기 30-5",
    wheelchairSeats: "장애인석 22석",
    caption: "별도 안내 없음",
    accessibleNote: "좌석배치도 기준 F1·F2·F3구역 앞쪽과 B1·D1구역 상단 일부에 장애인석 배치",
  },
  "woori-art-hall": {
    name: "우리금융아트홀(올림픽역도경기장)",
    short: "우리금융아트홀",
    seats: "1층 832석(휠체어석 12석 포함) + 2층 352석 = 1,184석",
    gate: "남2문",
    gateNote: "차량 진입 후 가장 가까운 관람 동선",
    parkingLot: "P7",
    parkingLotInfo: "P7 (06:00~23:00), 94대",
    parkingLotShortHours: "06:00~23:00",
    disabledSpaces: 6,
    disabledZone: "역도경기장",
    subway: "5호선 올림픽공원역 3번 출구",
    subwayStation: "olympic-park",
    bus: "지선 3216·3412·3413·3414 / 경기버스 30·30-5",
    wheelchairSeats: "휠체어석 12석(1층)",
    caption: "영상자막기 보유(서라운드 음향)",
    accessibleNote: "리모델링(2년) 후 개관, 1층에 휠체어석 12석을 포함해 조성",
  },
  "ticketlink-arena": {
    name: "티켓링크 라이브 아레나(핸드볼경기장)",
    short: "라이브 아레나",
    seats: "5,003석(이동석 2,100·고정석 2,903), 보조경기장 250석",
    gate: "동2문",
    gateNote: "차량 진입 후 가장 가까운 관람 동선",
    parkingLot: "P6",
    parkingLotInfo: "P6 (06:00~23:00), 220대",
    parkingLotShortHours: "06:00~23:00",
    disabledSpaces: 3,
    disabledZone: "티켓링크 라이브아레나",
    subway: "5호선 올림픽공원역 3번 출구",
    subwayStation: "olympic-park",
    bus: "지선 3212·3214·3316·3413·4213 / 간선 371 / 공항버스 606 / 경기 30-5",
    wheelchairSeats: "공식 안내에 좌석 수 미표기",
    caption: "별도 안내 없음",
    accessibleNote: "리모델링 후 재개관, 객석 배치가 공연별로 달라 휠체어석은 공연별 확인 필요",
  },
};

/* ---------- 3. 장애인 주차구역 (공단 주차장 이용 안내 기준) ---------- */
OLPARK.disabledParking = [
  { zone: "남2문 대형주차장 P1A", spaces: 6 },
  { zone: "남2문 대형주차장 P1B", spaces: 6 },
  { zone: "올림픽홀", spaces: 5 },
  { zone: "테니스장", spaces: 10 },
  { zone: "수영장", spaces: 7 },
  { zone: "체조경기장", spaces: 10 },
  { zone: "티켓링크 라이브아레나", spaces: 3 },
  { zone: "역도경기장(우리금융아트홀)", spaces: 6 },
  { zone: "남3문", spaces: 6 },
  { zone: "남4문", spaces: 12 },
  { zone: "서1문", spaces: 3 },
  { zone: "서2문", spaces: 11 },
];
OLPARK.disabledParkingTotal = OLPARK.disabledParking.reduce((s, z) => s + z.spaces, 0);

/* ---------- 4. 주차 요금·할인 ---------- */
OLPARK.parking = {
  fee: "소형 10분당 600원 / 대형 10분당 1,200원",
  free: "10분 이내 출차 시 무료",
  boothHours: "주차매표소 07:00~22:00 (22:00~08:00 콜센터 원격 운영)",
  booths: "북2문·동2문·남2문·남3문·남4문 5개소",
  totalCapacity: "2,800여 대",
  discount: [
    { who: "장애인", rate: "50%", proof: "복지카드" },
    { who: "국가유공자·보훈대상자", rate: "50%", proof: "유공자증" },
    { who: "경차", rate: "50%", proof: "차량등록증" },
    { who: "저공해·친환경 자동차", rate: "50%", proof: "친환경차 표지" },
    { who: "다둥이(2자녀 이상)", rate: "50%", proof: "다둥이카드(모바일 포함)" },
  ],
  notListed: "임산부·고령자(경로) 할인",
  inquiry: "주차사무실 02-2180-3697 / 공원 대표 02-410-1114",
};

/* ---------- 5. 무상 대여 (안내센터) ---------- */
OLPARK.rental = {
  hours: "09:00~19:00 (휴게시간 12:00~13:00)",
  closed: "설·추석 명절 연휴",
  rule: "성인 신분증을 맡기고 최대 3시간 이용 (미성년자는 보호자 동반)",
  lateNote: "16시 이후 대여 시에는 당일 안내센터 운영시간 내 반납",
  centers: [
    {
      id: "peace",
      name: "평화의광장 안내센터",
      near: "세계평화의문 인근 · 8호선 몽촌토성역 방향",
      tel: "02-2180-3564~5",
      wheelchairs: 3,
      strollers: 4,
      nursing: true,
      extras: "전자레인지 1대, 물품보관함·보조배터리(유료)",
    },
    {
      id: "mannam",
      name: "만남의광장 안내센터",
      near: "5호선 올림픽공원역 인접 · 동1문",
      tel: "02-2180-3566",
      wheelchairs: 3,
      strollers: 0,
      nursing: false,
      extras: "보조배터리(유료)",
    },
  ],
  strollerNote: "유모차는 평화의광장 안내센터와 동1문 안내센터에서 무료 대여(열린관광 무장애 정보: 4대, 24개월 미만, 신분증 지참)",
  countCaveat: "2025년 4월 공단 상담 답변은 '공원 전체 휠체어 3대'로 안내 — 센터별 대수는 방문 전 전화 확인 필요",
};

/* ---------- 6. 수유실 (운영 중지 실시간 경고) ---------- */
OLPARK.nursing = {
  stopped: {
    place: "만남의광장 안내센터 수유실",
    reason: "2023년 10월 건물 내 음식점 화재로 안내센터가 피해를 입어 2024년 6월까지 복구. 수유실 내부 집기 교체가 화재보상 협의 지연으로 남아 운영 중지 상태",
    checked: "공단 고객의 소리 답변 2025-03-03",
    alternativeHint: "안내센터 내·외부에 이용 안내문이 게시되어 있음",
  },
  available: [
    { place: "평화의광장 안내센터 수유실", note: "휴게시간 12:00~13:00 제외 운영", indoor: true },
    { place: "한성백제박물관 수유실", note: "박물관 1층, 실내 이동 동선", indoor: true },
    { place: "올림픽공원역 수유실", note: "5호선·9호선 역사 내, 지하철 이용 시 접근 편리", indoor: true },
  ],
};

/* ---------- 7. 실내 대체 체육활동 (올림픽수영장 강좌 정보) ---------- */
OLPARK.indoorPrograms = [
  {
    place: "올림픽수영장",
    program: "아쿠아로빅",
    schedule: "주1회 토 10:00~10:50 / 주2회 화·목 14:00·20:00·21:00 / 주3회 월·수·금 12:00~12:50",
    fee: "35,000원(주1) / 70,000원(주2) / 90,000원(주3)",
    target: "중학생 이상 (12:00~12:50 여성 전용 시간 있음)",
    why: "관절 충격이 적어 고령자·관절이 불편한 동반자에게 적합",
    badge: "고령자 동반 추천",
  },
  {
    place: "올림픽수영장",
    program: "실버반(월 자유수영)",
    schedule: "월~금 13:00~13:50 · 14:00~14:50 · 15:00~15:50 · 17:00~17:50",
    fee: "45,000원",
    target: "만 65세 이상 (할인 적용 제외)",
    why: "고령자 전용 시간대로 부담이 적음",
    badge: "고령자 동반 추천",
  },
  {
    place: "올림픽수영장",
    program: "일일 자유수영",
    schedule: "월~금 13:00·18:00·19:00·21:00 / 토·일·공휴일 1부 09:00~12:50, 2부 14:00~17:50",
    fee: "비회원 성인 7,000원 / 초중고생 6,000원",
    target: "초등학생 이상 (키 140cm 미만 입장 제한)",
    why: "예약 없이 당일 이용, 비 오는 날 대체 활동으로 활용",
    badge: "당일 이용 가능",
  },
  {
    place: "올림픽공원스포츠센터",
    program: "헬스·로드사이클 등 생활체육 강좌",
    schedule: "강좌별 상이 (스포츠센터 강좌정보 데이터로 연계)",
    fee: "강좌별 상이",
    target: "성인",
    why: "실내에서 기상 영향 없이 운동 가능",
    badge: "실내 활동",
  },
];

/* ---------- 8. 기상 조건 시뮬레이터 ---------- */
OLPARK.weather = {
  clear: {
    label: "맑음",
    icon: "☀️",
    advice: "야외 산책로와 광장 이용에 적합합니다. 다만 자외선이 강한 시간대에는 그늘 동선을 권장합니다.",
    outdoor: true,
    tips: ["평화의광장 → 88마당 산책로는 그늘 구간이 짧아 모자·양산을 준비하세요.", "공연 시작 40분 전 도착을 권장합니다."],
  },
  rain: {
    label: "비",
    icon: "🌧️",
    advice: "야외 산책보다 실내 관람·실내 체육으로 전환하는 편이 안전합니다. 바닥 재질별 미끄럼 정보는 공개 데이터에 없습니다.",
    outdoor: false,
    tips: [
      "지하철 3번 출구 → 공연장까지 지붕 구간이 짧아 우산이 필요합니다.",
      "우천 시 주차장 만차가 빨리 진행됩니다(P5 181대, P2 380대, P7 94대).",
      "바퀴가 미끄러지지 않도록 휠체어 타이어 상태를 확인하세요.",
    ],
  },
  heat: {
    label: "폭염",
    icon: "🥵",
    advice: "낮 시간 야외 이동을 줄이고 실내 활동으로 대체하는 것이 좋습니다. 물·그늘 휴식 지점은 현장 확인이 필요합니다.",
    outdoor: false,
    tips: ["올림픽수영장 아쿠아로빅·자유수영이 체온 조절에 유리합니다.", "공연 시작 전 실내 대기 공간에서 쉬는 동선을 권장합니다."],
  },
  cold: {
    label: "한파",
    icon: "🥶",
    advice: "실외 대기 시간을 줄이는 것이 핵심입니다. 도착 시각을 늦추고 실내 대기 동선을 이용하세요.",
    outdoor: false,
    tips: ["공연 시작 20분 전 도착으로 대기 시간을 줄이세요.", "안내센터(09:00~19:00)에서 몸을 녹인 뒤 이동할 수 있습니다."],
  },
};

/* ---------- 9. 교통수단 ---------- */
OLPARK.transit = {
  subway: [
    { id: "olympic-park", name: "올림픽공원역(5호선·9호선)", note: "3번 출구 — 공연장·만남의광장 방향" },
    { id: "mongchontoseong", name: "몽촌토성역(8호선)", note: "평화의광장·세계평화의문 방향" },
  ],
  car: "자가용 — 주차매표소 5개소(북2문·동2문·남2문·남3문·남4문), 07:00~22:00",
  bus: "버스 — 공연장별 노선이 다릅니다(공연장 안내 참조)",
};

/* ---------- 10. 이용자 조건 ---------- */
OLPARK.personas = [
  { id: "wheelchair", label: "휠체어 이용", icon: "♿", short: "휠체어" },
  { id: "senior", label: "고령자 동반", icon: "🧓", short: "고령자" },
  { id: "stroller", label: "영유아·유모차 동반", icon: "👶", short: "유모차" },
  { id: "pregnant", label: "임산부 동반", icon: "🤰", short: "임산부" },
];

/* ---------- 11. 제보 시설 분류 ---------- */
OLPARK.facilityTypes = [
  { id: "nursing", label: "수유실" },
  { id: "ramp", label: "경사로·턱" },
  { id: "sign", label: "안내표지" },
  { id: "parking", label: "장애인 주차구역" },
  { id: "toilet", label: "화장실" },
  { id: "rental", label: "휠체어·유모차 대여" },
  { id: "etc", label: "기타" },
];

/* ---------- 12. 현장 확인 필요(미확인) 항목 ---------- */
OLPARK.unverified = [
  "보행로·경사로의 경사도(각도)와 단차 높이 — 공개 데이터 없음",
  "안내센터별 휠체어·유모차 실제 보유 대수 — 안내 기준과 상담 답변이 다름",
  "공연장별 휠체어석 위치·잔여 좌석 — 공연별 배치가 달라 예매처 확인 필요",
  "수유실·수유 공간의 현재 운영 상태 — 마지막 공식 답변 2025-03-03",
  "장애인 주차구역 실시간 잔여 면수 — 미제공",
  "엘리베이터·에스컬레이터 운행 상태 — 미제공",
];

OLPARK.sources = [
  {
    name: "한국체육산업개발(주) 올림픽공원 공연정보",
    id: "3037877",
    type: "오픈API(XML)",
    cycle: "실시간",
    url: "https://www.data.go.kr/data/3037877/openapi.do",
  },
  {
    name: "한국체육산업개발(주) 올림픽공원 대관정보",
    id: "15015212",
    type: "파일/오픈API",
    cycle: "수시",
    url: "https://www.data.go.kr",
  },
  {
    name: "한국체육산업개발(주) 자주 묻는 질문정보",
    id: "15089962",
    type: "파일(CSV)",
    cycle: "연간",
    url: "https://www.data.go.kr/data/15089962/fileData.do",
  },
  {
    name: "한국체육산업개발(주) 스포츠센터 강좌정보",
    id: "15147992",
    type: "파일/오픈API",
    cycle: "수시",
    url: "https://www.data.go.kr",
  },
  {
    name: "한국체육산업개발(주) 올림픽공원 차량입출차·공연·날씨 연계 데이터",
    id: "15164822",
    type: "연계 데이터(7,803건)",
    cycle: "수시",
    url: "https://www.data.go.kr",
  },
  {
    name: "서울올림픽기념국민체육진흥공단 올림픽공원 편의시설 정보",
    id: "15089799",
    type: "파일(위경도 포함)",
    cycle: "수시",
    url: "https://www.data.go.kr",
  },
  {
    name: "한국관광공사 열린관광 모두의 여행 무장애 정보",
    id: "access.visitkorea.or.kr",
    type: "오픈API",
    cycle: "수시",
    url: "https://access.visitkorea.or.kr",
  },
];
