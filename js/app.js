/* ============================================================
   올팍프리(OLPARK FREE) — 시제품 동작 로직
   - 조건·목적·교통·날씨 → 규칙 기반 맞춤 안내문 생성
   - 현장 제보 저장(localStorage) → 관리자 인사이트 집계
   ============================================================ */
(function () {
  "use strict";

  var state = {
    personas: [],
    purpose: null,
    perfId: null,
    transit: null,
    station: null,
    weather: "clear",
    generatedAt: null,
  };

  var REPORTS_KEY = "olpark-free-reports-v1";
  var reports = loadReports();

  /* ---------------- 유틸 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function has(p) { return state.personas.indexOf(p) !== -1; }
  function personaLabels() {
    return OLPARK.personas.filter(function (p) { return has(p.id); }).map(function (p) { return p.label; });
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function nowStamp() {
    var d = new Date();
    function p(n) { return n < 10 ? "0" + n : "" + n; }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function loadReports() {
    try {
      var raw = window.localStorage.getItem(REPORTS_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveReports() {
    try { window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); }
    catch (e) { /* 저장이 막힌 환경(사생활 보호 모드 등)에서는 화면에만 유지 */ }
  }

  /* ---------------- 렌더: 조건 칩 ---------------- */
  function renderPersonaChips() {
    var box = $("#personaChips");
    box.innerHTML = OLPARK.personas.map(function (p) {
      return '<button type="button" class="chip" data-persona="' + p.id + '" aria-pressed="false">' +
        '<span aria-hidden="true">' + p.icon + "</span> " + esc(p.label) + "</button>";
    }).join("");
    var rbox = $("#reportPersonaChips");
    rbox.innerHTML = OLPARK.personas.map(function (p) {
      return '<button type="button" class="chip" data-rpersona="' + p.id + '" aria-pressed="false">' +
        '<span aria-hidden="true">' + p.icon + "</span> " + esc(p.short) + "</button>";
    }).join("");
  }

  /* ---------------- 렌더: 공연 목록 ---------------- */
  function renderPerfList() {
    var box = $("#perfList");
    box.innerHTML = OLPARK.performances.map(function (pf) {
      var v = OLPARK.venues[pf.venueId];
      return '<button type="button" class="perf" role="radio" aria-checked="false" data-perf="' + pf.id + '">' +
        '<span class="perf__title">' + esc(pf.title) + "</span>" +
        '<span class="perf__meta">' + esc(v.name) + " · " + esc(pf.period) + "</span>" +
        '<span class="perf__meta">' + esc(pf.times) + "</span>" +
        '<span class="perf__tags"><span>' + esc(pf.age) + "</span><span>관람 " + esc(pf.runtime) + "</span><span>문의 " + esc(pf.tel) + "</span></span>" +
        "</button>";
    }).join("");
  }

  function renderStationChips() {
    var box = $("#stationChips");
    box.innerHTML = OLPARK.transit.subway.map(function (s) {
      return '<button type="button" class="chip" data-station="' + s.id + '" aria-pressed="false">' +
        esc(s.name) + "</button>";
    }).join("");
  }

  /* ---------------- 상호작용 ---------------- */
  function bind() {
    $("#personaChips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-persona]");
      if (!b) return;
      var id = b.getAttribute("data-persona");
      var i = state.personas.indexOf(id);
      if (i === -1) state.personas.push(id); else state.personas.splice(i, 1);
      b.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      updatePersonaHint();
    });

    $("#purposeChips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-purpose]");
      if (!b) return;
      var v = b.getAttribute("data-purpose");
      state.purpose = state.purpose === v ? null : v;
      syncGroup("#purposeChips", "[data-purpose]", "data-purpose", state.purpose);
      $("#showPicker").hidden = state.purpose !== "show";
      if (state.purpose === "show" && !state.perfId) {
        state.perfId = OLPARK.performances[0].id;
        syncGroup("#perfList", "[data-perf]", "data-perf", state.perfId, "aria-checked");
      }
    });

    $("#perfList").addEventListener("click", function (e) {
      var b = e.target.closest("[data-perf]");
      if (!b) return;
      state.perfId = b.getAttribute("data-perf");
      syncGroup("#perfList", "[data-perf]", "data-perf", state.perfId, "aria-checked");
    });

    $("#transitChips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-transit]");
      if (!b) return;
      state.transit = b.getAttribute("data-transit");
      syncGroup("#transitChips", "[data-transit]", "data-transit", state.transit);
      $("#stationPicker").hidden = state.transit !== "subway";
      if (state.transit === "subway" && !state.station) {
        state.station = OLPARK.transit.subway[0].id;
        syncGroup("#stationChips", "[data-station]", "data-station", state.station);
      }
    });

    $("#stationChips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-station]");
      if (!b) return;
      state.station = b.getAttribute("data-station");
      syncGroup("#stationChips", "[data-station]", "data-station", state.station);
    });

    $("#weatherChips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-weather]");
      if (!b) return;
      state.weather = b.getAttribute("data-weather");
      syncGroup("#weatherChips", "[data-weather]", "data-weather", state.weather);
    });

    $("#generateBtn").addEventListener("click", function () {
      if (!state.purpose) {
        $("#guideResult").innerHTML = '<div class="empty"><p><strong>방문 목적을 먼저 선택해 주세요.</strong></p><p class="muted">공연 관람·산책·실내 체육활동 중 하나를 고르면 안내문이 달라집니다.</p></div>';
        $("#s2").scrollIntoView({ block: "center" });
        return;
      }
      if (!state.transit) {
        state.transit = "subway";
        state.station = state.station || OLPARK.transit.subway[0].id;
        syncGroup("#transitChips", "[data-transit]", "data-transit", state.transit);
        syncGroup("#stationChips", "[data-station]", "data-station", state.station);
      }
      state.generatedAt = nowStamp();
      renderGuide();
      $("#guideResult").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("#guideResult").addEventListener("click", function (e) {
      var act = e.target.closest("[data-action]");
      if (!act) return;
      var a = act.getAttribute("data-action");
      if (a === "print") window.print();
      if (a === "report") { showTab("report"); window.scrollTo({ top: 0, behavior: "smooth" }); }
      if (a === "copy") copyGuide(act);
    });

    $("#bigTextBtn").addEventListener("click", function () {
      var on = document.documentElement.classList.toggle("big");
      this.setAttribute("aria-pressed", on ? "true" : "false");
    });

    $$(".tabs button").forEach(function (t) {
      t.addEventListener("click", function () { showTab(t.getAttribute("data-panel")); });
    });
  }

  function syncGroup(containerSel, itemSel, attr, value, pressedAttr) {
    $$(containerSel + " " + itemSel).forEach(function (b) {
      var on = b.getAttribute(attr) === value;
      b.setAttribute(pressedAttr || "aria-pressed", on ? "true" : "false");
    });
  }

  function updatePersonaHint() {
    var labels = personaLabels();
    $("#personaHint").textContent = labels.length
      ? "선택: " + labels.join(" · ") + " — 이 조건에 맞춰 주차 할인·대여·수유실·실내 대안이 달라집니다."
      : "조건을 고르면 주차 할인·대여·동선 안내가 함께 바뀝니다.";
  }

  function showTab(name) {
    ["guide", "report", "admin"].forEach(function (n) {
      var panel = document.getElementById("panel-" + n);
      var tab = document.getElementById("tab-" + n);
      var on = n === name;
      panel.hidden = !on;
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (name === "admin") renderAdmin();
    if (name === "report") renderReports();
  }

  /* ---------------- 안내문 생성 ---------------- */
  function currentPerf() {
    if (!state.perfId) return null;
    return OLPARK.performances.filter(function (p) { return p.id === state.perfId; })[0] || null;
  }
  function currentVenue() {
    var pf = currentPerf();
    return pf ? OLPARK.venues[pf.venueId] : null;
  }

  function disabledSpacesFor(venue) {
    if (!venue) return null;
    return OLPARK.disabledParking.filter(function (z) { return z.zone === venue.disabledZone; })[0] || null;
  }

  function renderGuide() {
    var pf = currentPerf();
    var venue = currentVenue();
    var w = OLPARK.weather[state.weather];
    var labels = personaLabels();
    var out = [];

    /* 헤더 */
    out.push(
      '<div class="guide-head">' +
        "<h2>방문 안내문</h2>" +
        "<p>" + esc(labels.length ? labels.join(" · ") + " 조건" : "조건 미선택(일반 기준)") +
          " · " + esc(purposeLabel()) + (pf ? " · " + esc(pf.title) : "") + "</p>" +
          '<p class="small">' + esc(state.generatedAt) + " 생성 · 올팍프리 시제품</p>" +
          '<div class="tags">' +
            (labels.length ? labels.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("") : "<span>일반 방문</span>") +
            "<span>" + esc(w.icon + " " + w.label) + "</span>" +
            "<span>" + esc(transitLabel()) + "</span>" +
          "</div>" +
      "</div>" +
      '<div class="result-actions">' +
        '<button type="button" data-action="print">🖨️ 인쇄·PDF 저장</button>' +
        '<button type="button" data-action="copy">📋 안내문 복사</button>' +
        '<button type="button" data-action="report">🚩 불편 제보하기</button>' +
      "</div>"
    );

    out.push(cardRoute(venue, pf));
    out.push(cardRental());
    out.push(cardNursing());
    out.push(cardWeather(w, venue));
    out.push(cardTime(pf, venue));
    out.push(cardUnknown(venue));
    out.push(cardChecklist(venue, pf));

    out.push(
      '<div class="gcard gcard--info">' +
        '<h3><span class="ico" aria-hidden="true">📚</span> 이 안내문에 쓴 데이터</h3>' +
        '<ul class="small">' +
          "<li>한국체육산업개발(주) 올림픽공원 공연정보(3037877) — 공연 일정·장소</li>" +
          "<li>공연장별 시설·교통 안내(공단 홈페이지 장소안내) — 진입문·주차장·요금·버스 노선</li>" +
          "<li>올림픽공원 주차장 이용 안내(2025-12-09) — 장애인 주차구역 면수·할인 대상</li>" +
          "<li>자주 묻는 질문정보(15089962)·고객의 소리 답변 — 휠체어 대여·수유실 상태</li>" +
          "<li>스포츠센터 강좌정보(15147992)·올림픽수영장 요금안내 — 실내 대체 활동</li>" +
        "</ul>" +
        '<p class="muted small">공개되지 않은 값은 만들지 않고 ‘현장 확인 필요’로 표시했습니다.</p>' +
      "</div>"
    );

    $("#guideResult").innerHTML = out.join("");
  }

  function purposeLabel() {
    return { show: "공연 관람", walk: "산책", indoor: "실내 체육활동" }[state.purpose] || "목적 미선택";
  }
  function transitLabel() {
    if (state.transit === "subway") {
      var st = OLPARK.transit.subway.filter(function (s) { return s.id === state.station; })[0];
      return "지하철" + (st ? " · " + st.name : "");
    }
    return { car: "자가용", bus: "버스" }[state.transit] || "교통수단 미선택";
  }

  /* 1) 진입·주차 카드 */
  function cardRoute(venue, pf) {
    var rows = [];
    var notices = [];
    var cls = "gcard";

    if (state.transit === "subway") {
      var st = OLPARK.transit.subway.filter(function (s) { return s.id === state.station; })[0];
      rows.push(["하차 역", esc(st.name) + " — " + esc(st.note)]);
      if (venue) rows.push(["공연장 안내 출구", esc(venue.subway)]);
      if (state.station === "mongchontoseong") {
        rows.push(["도보 동선", "평화의광장(세계평화의문) 방향 — 안내센터·수유실이 광장 입구에 있음"]);
        notices.push("8호선 몽촌토성역 쪽은 평화의광장·안내센터 접근에 유리하고, 공연장(동2문·남2문)까지는 공원 안을 가로질러 이동해야 합니다.");
      } else {
        notices.push("5호선·9호선 올림픽공원역 3번 출구는 만남의광장과 공연장 방향입니다.");
      }
      notices.push("역사 엘리베이터·에스컬레이터 위치와 운행 상태는 이 시제품에 연계된 데이터가 없습니다. <span class=\"badge badge--unknown\">현장 확인 필요</span>");
      if (has("wheelchair")) notices.push("역에서 공연장까지 단차·경사 정보가 공개되어 있지 않아, 도착 후 무장애 동선을 안내센터(02-2180-3564~5)에 문의하는 편이 안전합니다.");
    } else if (state.transit === "car") {
      if (venue) {
        rows.push(["추천 진입문", esc(venue.gate) + " — " + esc(venue.gateNote)]);
        rows.push(["가까운 주차장", esc(venue.parkingLotInfo)]);
        var zone = disabledSpacesFor(venue);
        if (zone) {
          rows.push(["장애인 주차구역", "<strong>" + esc(zone.zone) + " " + zone.spaces + "면</strong> (공원 전체 12개 지점 " + OLPARK.disabledParkingTotal + "면)"]);
        }
      } else {
        rows.push(["주차장", "공원 내 5개 매표소(북2문·동2문·남2문·남3문·남4문) · 전체 " + esc(OLPARK.parking.totalCapacity)]);
        rows.push(["장애인 주차구역", "공원 전체 12개 지점 " + OLPARK.disabledParkingTotal + "면"]);
      }
      rows.push(["요금", esc(OLPARK.parking.fee) + " · " + esc(OLPARK.parking.free)]);
      rows.push(["매표소 운영", esc(OLPARK.parking.boothHours)]);
      if (pf && venue && venue.parkingLotShortHours) {
        var close = venue.parkingLotShortHours.split("~")[1];
        notices.push(esc(venue.parkingLot) + " 운영시간은 " + esc(venue.parkingLotShortHours) + "입니다. 공연이 늦게 끝나는 날에는 출차 시간을 확인하세요.");
        if (close === "22:00") notices.push("22:00 이후에는 콜센터 원격 운영으로 전환됩니다.");
      }
      notices.push(discountNote());
    } else {
      rows.push(["버스", venue ? esc(venue.bus) : esc(OLPARK.transit.bus)]);
      rows.push(["하차 위치", "공원 정문·광장별 정류장 위치는 공개 데이터에 없습니다. <span class=\"badge badge--unknown\">현장 확인 필요</span>"]);
      notices.push("버스는 저상버스 운행 여부가 노선별로 달라, 휠체어·유모차 동반 시 저상버스 배차를 확인하는 편이 좋습니다.");
    }

    if (has("stroller")) notices.push("유모차 동반 시 엘리베이터가 있는 출입 동선이 필요합니다. 공원 내 엘리베이터 위치 데이터는 아직 공개되지 않았습니다.");
    if (has("pregnant")) notices.push("임산부 동반 시 이동 거리를 줄이는 것이 좋습니다. 가장 가까운 진입문·주차장 기준으로 안내했습니다.");

    return '<div class="' + cls + '">' +
      '<h3><span class="ico" aria-hidden="true">🚪</span> 진입문 · 주차 <span class="badge badge--data">공식 안내 확인</span></h3>' +
      '<dl>' + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>" +
      notices.map(function (n) { return '<div class="callout">' + n + "</div>"; }).join("") +
      "</div>";
  }

  function discountNote() {
    var parts = [];
    if (has("wheelchair")) {
      parts.push("<strong>장애인 50% 할인 대상</strong>입니다. 복지카드를 매표소에 제시하세요. <span class=\"badge badge--ok\">할인 적용</span>");
    }
    if (has("senior")) {
      parts.push("고령자(경로) 할인은 공단이 안내하는 50% 할인 대상에 <strong>없습니다</strong>. 일반 요금이 적용됩니다. <span class=\"badge badge--no\">할인 미적용</span> 국가유공자·보훈대상자라면 유공자증으로 50% 할인됩니다.");
    }
    if (has("pregnant")) {
      parts.push("임산부 할인은 공단 안내 기준 50% 할인 대상에 <strong>명시되어 있지 않습니다</strong>. <span class=\"badge badge--no\">할인 미적용</span> 현장에서 적용 여부를 확인하려면 주차사무실(" + esc(OLPARK.parking.inquiry.split(" / ")[0]) + ")에 문의하세요.");
    }
    if (has("stroller")) {
      parts.push("2자녀 이상 가정은 다둥이카드(모바일 포함)로 50% 할인됩니다. <span class=\"badge badge--ok\">해당 시 할인</span>");
    }
    if (!parts.length) {
      parts.push("50% 할인 대상: 장애인 · 국가유공자·보훈대상자 · 경차 · 저공해·친환경차 · 다둥이(2자녀 이상). 증빙은 복지카드·유공자증·다둥이카드 등입니다.");
    }
    return parts.map(function (p) { return '<div class="callout">' + p + "</div>"; }).join("");
  }

  /* 2) 대여 카드 */
  function cardRental() {
    var rows = [];
    var notes = [];
    var centers = OLPARK.rental.centers;

    centers.forEach(function (c) {
      var items = [];
      if (has("wheelchair") || has("senior")) items.push("휠체어 " + c.wheelchairs + "대");
      if (has("stroller")) items.push(c.strollers ? "유모차 " + c.strollers + "대" : "유모차 없음");
      if (!items.length) items.push("휠체어 " + c.wheelchairs + "대" + (c.nursing ? " · 수유실" : ""));
      rows.push([esc(c.name), items.join(" · ") + "<br><span class=\"muted small\">" + esc(c.near) + " · " + esc(c.tel) + "</span>"]);
    });

    rows.push(["운영시간", esc(OLPARK.rental.hours) + " (휴무: " + esc(OLPARK.rental.closed) + ")"]);
    rows.push(["이용 규칙", esc(OLPARK.rental.rule)]);
    rows.push(["반납", esc(OLPARK.rental.lateNote)]);

    if (has("wheelchair") || has("senior")) {
      notes.push("휠체어 대여는 성인 신분증을 맡기고 최대 3시간입니다. 대수가 적어 오전 방문이 유리합니다. <span class=\"badge badge--unknown\">대수 변동 가능</span>");
    }
    if (has("stroller")) {
      notes.push(esc(OLPARK.rental.strollerNote));
      notes.push("만남의광장 안내센터에는 유모차 대여가 없습니다. 평화의광장 또는 동1문 안내센터를 이용하세요.");
    }
    if (has("pregnant")) {
      notes.push("임산부 동반 시 안내센터(09:00~19:00, 휴게 12:00~13:00)에서 잠시 쉬어 가는 동선을 권장합니다. 무료 대여 물품은 신분증이 필요합니다.");
    }
    notes.push('<span class="badge badge--unknown">현장 확인 필요</span> ' + esc(OLPARK.rental.countCaveat));

    return '<div class="gcard">' +
      '<h3><span class="ico" aria-hidden="true">♿</span> 휠체어 · 유모차 무상 대여</h3>' +
      '<dl>' + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>" +
      notes.map(function (n) { return '<div class="callout">' + n + "</div>"; }).join("") +
      "</div>";
  }

  /* 3) 수유실 카드 */
  function cardNursing() {
    var relevant = has("stroller") || has("pregnant");
    var stopped = OLPARK.nursing.stopped;
    var alt = OLPARK.nursing.available.map(function (a) {
      return "<li><strong>" + esc(a.place) + "</strong> — " + esc(a.note) + "</li>";
    }).join("");

    var head = relevant
      ? '<h3><span class="ico" aria-hidden="true">⚠️</span> 수유실 운영 중지 — 대체 장소를 확인하세요 <span class="badge badge--stop">운영 중지</span></h3>'
      : '<h3><span class="ico" aria-hidden="true">ℹ️</span> 수유실 현재 상태 <span class="badge badge--stop">1곳 운영 중지</span></h3>';

    var body =
      '<p><strong>' + esc(stopped.place) + "</strong>는 현재 운영이 중지되어 있습니다. " + esc(stopped.reason) + " <span class=\"badge badge--data\">" + esc(stopped.checked) + "</span></p>" +
      '<p class="small muted">' + esc(stopped.alternativeHint) + "</p>" +
      "<p><strong>대체 수유실</strong></p><ul>" + alt + "</ul>";

    if (!relevant) {
      body += '<p class="small muted">영유아·임산부 동반 조건을 선택하면 이 경고가 안내문 맨 앞으로 배치됩니다.</p>';
    }

    return '<div class="gcard ' + (relevant ? "gcard--alert" : "gcard--info") + '">' + head + body + "</div>";
  }

  /* 4) 날씨·실내 대안 카드 */
  function cardWeather(w, venue) {
    var tips = w.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var progs = OLPARK.indoorPrograms.slice();

    if (has("senior")) progs.sort(function (a, b) { return (b.badge === "고령자 동반 추천") - (a.badge === "고령자 동반 추천"); });

    var showProgs = !w.outdoor || state.purpose === "indoor";
    var progHtml = showProgs
      ? "<h3>실내 대체 활동</h3><ul>" + progs.map(function (p) {
          var caveat = "";
          if (has("wheelchair") && p.place === "올림픽수영장") caveat = ' <span class="badge badge--unknown">수영장 무장애 접근 현장 확인 필요</span>';
          if (has("stroller") && p.program === "일일 자유수영") caveat = ' <span class="badge badge--no">미취학 아동 입장 제한</span>';
          return "<li><strong>" + esc(p.place) + " · " + esc(p.program) + "</strong> <span class=\"badge badge--data\">" + esc(p.badge) + "</span><br>" +
            '<span class="small">' + esc(p.schedule) + " / " + esc(p.fee) + " / " + esc(p.target) + "</span><br>" +
            '<span class="small muted">' + esc(p.why) + "</span>" + caveat + "</li>";
        }).join("") + "</ul>"
      : '<p class="small muted">맑은 날에는 야외 산책로를 우선 권장합니다. 실내 활동 목록은 ‘실내 체육활동’을 목적으로 선택하면 표시됩니다.</p>';

    var indoorTip = "";
    if (state.purpose === "show" && !w.outdoor && venue) {
      indoorTip = '<div class="callout">비·폭염·한파에는 공연 시작 전 실내 대기 공간에서 쉬는 동선을 권장합니다. ' +
        esc(venue.short) + " 좌석 배치와 대기 공간 위치는 공연별로 다릅니다.</div>";
    }

    return '<div class="gcard ' + (w.outdoor ? "" : "gcard--warn") + '">' +
      "<h3><span class=\"ico\" aria-hidden=\"true\">" + w.icon + "</span> " + esc(w.label) + " — 이동·활동 권고</h3>" +
      "<p>" + esc(w.advice) + "</p><ul>" + tips + "</ul>" + indoorTip + progHtml +
      "</div>";
  }

  /* 5) 시간·혼잡 카드 */
  function cardTime(pf, venue) {
    var items = [];
    if (pf && venue) {
      items.push("<strong>" + esc(pf.title) + "</strong> — " + esc(pf.times) + " (관람 " + esc(pf.runtime) + ")");
      items.push("공연 시작 <strong>40분 전 도착</strong>을 권장합니다. 매표·검표·좌석 이동에 시간이 걸립니다.");
      items.push("공연 종료 직후 20~30분은 출차·지하철 승강장이 혼잡합니다. 휠체어·유모차 동반 시 종료 후 10분 정도 자리에서 기다린 뒤 이동하는 편이 편합니다.");
      if (venue.parkingLotShortHours) items.push(esc(venue.parkingLot) + " 운영시간 " + esc(venue.parkingLotShortHours) + " — 공연이 늦게 끝나면 출차 시간을 확인하세요.");
      items.push("문의 " + esc(pf.tel));
    } else if (state.purpose === "indoor") {
      items.push("실내 활동은 오전 시간대가 비교적 한산합니다. 수영장 자유수영은 지정 시간대만 이용할 수 있습니다.");
      items.push("주말·공연 행사 시간대에는 주차 혼잡이 발생할 수 있어 대중교통 이용을 권장합니다.");
    } else {
      items.push("산책은 오전 9~11시가 비교적 한산합니다. 주말·공연 행사 시간대에는 주차장이 빠르게 찹니다.");
      items.push("공연이 있는 날 저녁에는 광장·주차장이 혼잡합니다. 산책로는 공연장과 떨어진 평화의광장 쪽이 한산합니다.");
    }
    items.push('주차 입출차 실적 데이터(연계 데이터 7,803건)로 시간대별 혼잡을 계산하는 기능은 실서비스 단계에서 붙입니다. 시제품은 규칙 기반 안내입니다. <span class="badge badge--unknown">실시간 혼잡도 미연계</span>');

    return '<div class="gcard gcard--info">' +
      '<h3><span class="ico" aria-hidden="true">⏱️</span> 도착·출차 시간과 혼잡</h3>' +
      "<ul>" + items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
  }

  /* 6) 현장 확인 필요 카드 */
  function cardUnknown(venue) {
    var list = OLPARK.unverified.slice();
    if (venue && venue.wheelchairSeats) list.push(venue.short + " 휠체어석: " + venue.wheelchairSeats + " — 공연별 좌석 배치 확인 필요");
    return '<div class="gcard">' +
      '<h3><span class="ico" aria-hidden="true">🔎</span> 현장 확인이 필요한 항목 <span class="badge badge--unknown">미확인</span></h3>' +
      '<p class="small muted">공개된 공공데이터에 없는 값은 추정하지 않았습니다. 방문 전 전화(공원 대표 02-410-1114)로 확인하거나, 현장에서 안내센터에 문의하세요.</p>' +
      "<ul>" + list.map(function (u) { return "<li>" + esc(u) + "</li>"; }).join("") + "</ul></div>";
  }

  /* 7) 체크리스트 */
  function cardChecklist(venue, pf) {
    var items = [];
    items.push("신분증 (휠체어·유모차 대여 시 필수)");
    if (has("wheelchair")) items.push("복지카드 — 주차 50% 할인 증빙");
    if (has("senior")) items.push("유공자증이 있다면 지참 — 경로 할인은 없지만 유공자 할인은 있습니다");
    if (has("stroller")) items.push("기저귀·분유 — 만남의광장 수유실은 운영 중지, 대체 수유실 확인");
    if (has("pregnant")) items.push("가까운 진입문·주차장 위치 저장, 휴식 시간 확보");
    if (state.transit === "car") items.push("출차 예정 시간 확인 (" + (venue ? esc(venue.parkingLot) + " " + esc(venue.parkingLotShortHours) : "매표소 07:00~22:00") + ")");
    if (state.transit === "subway") items.push("하차 역 출구 확인 (" + esc(OLPARK.transit.subway.filter(function (s) { return s.id === state.station; })[0].name) + ")");
    if (pf) items.push("공연 시작 40분 전 도착 · 문의 " + esc(pf.tel));
    if (!OLPARK.weather[state.weather].outdoor) items.push("우산·여분 양말 또는 더위·추위 대비 용품");

    return '<div class="gcard">' +
      '<h3><span class="ico" aria-hidden="true">✅</span> 출발 전 체크리스트</h3>' +
      '<ul class="checklist">' + items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
  }

  function copyGuide(btn) {
    var text = $("#guideResult").innerText.replace(/\n{3,}/g, "\n\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "✅ 복사됨";
        setTimeout(function () { btn.textContent = "📋 안내문 복사"; }, 1800);
      }, function () { fallbackCopy(text, btn); });
    } else {
      fallbackCopy(text, btn);
    }
  }
  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); btn.textContent = "✅ 복사됨"; }
    catch (e) { btn.textContent = "복사 실패 — 인쇄를 이용하세요"; }
    document.body.removeChild(ta);
    setTimeout(function () { btn.textContent = "📋 안내문 복사"; }, 1800);
  }

  /* ---------------- 제보 ---------------- */
  function bindReportForm() {
    var sel = $("#rFacility");
    sel.innerHTML = OLPARK.facilityTypes.map(function (f) {
      return '<option value="' + f.id + '">' + esc(f.label) + "</option>";
    }).join("");

    $("#reportPersonaChips").addEventListener("click", function (e) {
      var b = e.target.closest("[data-rpersona]");
      if (!b) return;
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    });

    $("#reportForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var facility = $("#rFacility").value;
      var place = $("#rPlace").value.trim();
      var memo = $("#rMemo").value.trim();
      var severity = Number($("#rSeverity").value);
      var conds = $$("#reportPersonaChips .chip[aria-pressed='true']").map(function (b) { return b.getAttribute("data-rpersona"); });

      if (!place) {
        $("#reportMsg").textContent = "불편을 겪은 위치를 적어 주세요.";
        $("#rPlace").focus();
        return;
      }
      reports.push({
        id: "r" + Date.now(),
        facility: facility,
        place: place,
        memo: memo,
        severity: severity,
        conditions: conds,
        at: nowStamp(),
        sample: false,
      });
      saveReports();
      $("#reportForm").reset();
      $$("#reportPersonaChips .chip").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      $("#reportMsg").textContent = "제보가 등록되었습니다. 관리자 인사이트 탭에서 집계를 볼 수 있습니다.";
      renderReports();
      renderAdmin();
    });
  }

  function facilityLabel(id) {
    var f = OLPARK.facilityTypes.filter(function (x) { return x.id === id; })[0];
    return f ? f.label : id;
  }

  function renderReports() {
    $("#reportCount").textContent = reports.length + "건";
    var list = $("#reportList");
    if (!reports.length) {
      list.innerHTML = '<li class="empty-note">아직 접수된 제보가 없습니다. ‘장벽 제보’에서 첫 제보를 남겨 보세요.</li>';
      return;
    }
    list.innerHTML = reports.slice().reverse().map(function (r) {
      var conds = r.conditions.map(function (c) {
        var p = OLPARK.personas.filter(function (x) { return x.id === c; })[0];
        return p ? p.short : c;
      });
      return '<li class="report-item">' +
        '<div class="report-item__top"><span class="report-item__facility">' + esc(facilityLabel(r.facility)) + "</span>" +
        '<span class="sev sev--' + r.severity + '">' + ({ 3: "높음", 2: "보통", 1: "낮음" }[r.severity]) + "</span></div>" +
        '<div class="report-item__meta">' + esc(r.place) + " · " + esc(r.at) +
          (conds.length ? " · " + esc(conds.join("·")) : "") +
          (r.sample ? ' · <span class="badge badge--data">예시</span>' : "") + "</div>" +
        (r.memo ? "<p>" + esc(r.memo) + "</p>" : "") +
        "</li>";
    }).join("");
  }

  /* ---------------- 관리자 인사이트 ---------------- */
  function renderAdmin() {
    var total = reports.length;
    var byFacility = {};
    OLPARK.facilityTypes.forEach(function (f) { byFacility[f.id] = { count: 0, score: 0, places: {} }; });

    reports.forEach(function (r) {
      var f = byFacility[r.facility] || (byFacility[r.facility] = { count: 0, score: 0, places: {} });
      f.count += 1;
      f.score += r.severity * (1 + 0.5 * (r.conditions ? r.conditions.length : 0));
      f.places[r.place] = (f.places[r.place] || 0) + 1;
    });

    var vuln = reports.filter(function (r) { return r.conditions && r.conditions.length; }).length;
    var high = reports.filter(function (r) { return r.severity === 3; }).length;
    var topFacility = Object.keys(byFacility).sort(function (a, b) { return byFacility[b].count - byFacility[a].count; })[0];

    $("#kpis").innerHTML = [
      ["총 제보", total + "건"],
      ["불편 정도 ‘높음’", high + "건"],
      ["취약 조건 동반", total ? Math.round((vuln / total) * 100) + "%" : "—"],
      ["최다 시설", total ? facilityLabel(topFacility) : "—"],
    ].map(function (k) {
      return '<div class="kpi"><span class="kpi__label">' + k[0] + '</span><span class="kpi__value">' + esc(k[1]) + "</span></div>";
    }).join("");

    var maxCount = Math.max.apply(null, Object.keys(byFacility).map(function (k) { return byFacility[k].count; }).concat([1]));
    $("#facilityChart").innerHTML = OLPARK.facilityTypes.map(function (f) {
      var d = byFacility[f.id];
      var pct = Math.round((d.count / maxCount) * 100);
      return '<div class="bar-row"><span>' + esc(f.label) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="bar-value">' + d.count + "</span></div>";
    }).join("");

    var ranked = Object.keys(byFacility)
      .filter(function (k) { return byFacility[k].count > 0; })
      .sort(function (a, b) { return byFacility[b].score - byFacility[a].score; });

    var tbody = $("#priorityTable").querySelector("tbody");
    if (!ranked.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">제보가 쌓이면 시설별 개선 우선순위가 계산됩니다.</td></tr>';
    } else {
      tbody.innerHTML = ranked.map(function (k, i) {
        var d = byFacility[k];
        var place = Object.keys(d.places).sort(function (a, b) { return d.places[b] - d.places[a]; })[0];
        return "<tr><td>" + (i + 1) + "</td><td>" + esc(facilityLabel(k)) + "</td><td>" + d.count +
          "</td><td>" + d.score.toFixed(1) + "</td><td>" + esc(place) + "</td></tr>";
      }).join("");
    }
  }

  function csvDownload() {
    var head = ["접수시각", "시설", "위치", "불편정도", "제보자조건", "내용", "구분"];
    var rows = reports.map(function (r) {
      return [r.at, facilityLabel(r.facility), r.place, r.severity, r.conditions.join("/"), (r.memo || "").replace(/\n/g, " "), r.sample ? "예시" : "실제"];
    });
    var csv = [head].concat(rows).map(function (row) {
      return row.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");
    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "olpark-free-reports.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function seedSamples() {
    var demos = [
      { f: "nursing", p: "만남의광장 안내센터", s: 3, c: ["stroller"], m: "수유실 안내문은 있는데 실제로 문이 잠겨 있었어요. 대체 장소까지 걸어서 10분 넘게 걸렸습니다." },
      { f: "ramp", p: "동2문 → 공연장 진입로", s: 3, c: ["wheelchair"], m: "보도 턱이 높아 휠체어로 혼자 넘기 어려웠습니다. 경사로 위치 안내가 없습니다." },
      { f: "parking", p: "P5 주차장", s: 2, c: ["wheelchair"], m: "장애인 구역 10면이 공연 시작 1시간 전에 모두 찼습니다." },
      { f: "sign", p: "평화의광장", s: 2, c: ["senior", "stroller"], m: "안내센터 방향 표지가 작아 어르신이 한 번 지나쳤습니다." },
      { f: "toilet", p: "올림픽홀 1층", s: 2, c: ["wheelchair"], m: "장애인 화장실 문이 무거워 휠체어로 열기 어려웠습니다." },
      { f: "rental", p: "평화의광장 안내센터", s: 1, c: ["stroller"], m: "유모차 대여 가능 시간을 몰라 헛걸음할 뻔했습니다." },
    ];
    demos.forEach(function (d, i) {
      reports.push({
        id: "sample" + i,
        facility: d.f,
        place: d.p,
        memo: d.m,
        severity: d.s,
        conditions: d.c,
        at: "예시 데이터",
        sample: true,
      });
    });
    saveReports();
    renderReports();
    renderAdmin();
  }

  /* ---------------- 초기화 ---------------- */
  function init() {
    renderPersonaChips();
    renderPerfList();
    renderStationChips();
    bind();
    bindReportForm();
    $("#csvBtn").addEventListener("click", csvDownload);

    // 관리자 화면에 예시 데이터 버튼 추가
    var adminCard = $("#priorityTable").closest(".card");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ghost-btn";
    btn.textContent = "예시 제보 6건 불러오기";
    btn.style.marginTop = "0.8rem";
    btn.addEventListener("click", seedSamples);
    adminCard.appendChild(btn);

    // 출처 목록
    $("#sourceList").innerHTML = OLPARK.sources.map(function (s) {
      return "<li><strong>" + esc(s.name) + "</strong> — 식별자 " + esc(s.id) + " · " + esc(s.type) + " · 갱신 " + esc(s.cycle) +
        ' · <a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">포털에서 보기</a></li>';
    }).join("");

    renderReports();
    renderAdmin();
    updatePersonaHint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
