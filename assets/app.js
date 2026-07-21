/* 出題アプリ v4 (schema=2)
 * 科目 → 範囲選択(単元横断・再帰ツリー) → 出題 → 結果/苦手分野
 * 追加: 戻る/進むの履歴ナビ、クラスタ別進捗(解答率・正答率)+リセット、
 *       解答表示モード(1問ずつ / 最後にまとめて)、制限時間(なし/1問/セット)、
 *       出題中のメタ表示on/off、設定は歯車パネル、開始/設定は固定バー。
 * 保存: localStorage(qb3:<科目>:results / :reports)。各問の最新結果のみ。
 */
(function () {
  "use strict";

  var DIFFS = ["基礎", "標準", "応用", "国試"];
  var LETTERS = ["A", "B", "C", "D", "E"];
  var LIMIT_OPTS = [10, 20, 30, 50, 0]; // 0 = 無制限
  var PERQ_SECS = [30, 45, 60, 90, 120];
  var PERSET_MINS = [5, 10, 15, 20, 30];
  var INDENT = 18;
  var app = document.getElementById("app");

  // ---------- localStorage ----------
  var storageWarned = false;
  function lsGet(key, def) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }
  function K(subj, name) { return "qb3:" + subj + ":" + name; }
  function getResults(subj) { return lsGet(K(subj, "results"), {}); }
  function setResults(subj, m) {
    if (!lsSet(K(subj, "results"), m) && !storageWarned) {
      storageWarned = true;
      alert("成績をこの端末に保存できませんでした(プライベートモード等でストレージが使用不可の可能性があります)。今回の記録は残りません。");
    }
  }
  function getReports(subj) { return lsGet(K(subj, "reports"), []); }
  function setReports(subj, a) { lsSet(K(subj, "reports"), a); }
  // 進捗復元コード用: 各問で実際に選んだ選択肢(0-4)を記録する(results は correct/wrong のみで選択肢を保持しないため)。
  // 既存のresultsとは別バケツに保持し、旧データとの後方互換を壊さない。
  function getChoices(subj) { return lsGet(K(subj, "choices"), {}); }
  function setChoices(subj, m) { lsSet(K(subj, "choices"), m); }

  // ---------- 状態 ----------
  var state = {
    subject: null,
    flatQuestions: [], qLeafMap: {}, leafInfo: {}, unitNodes: [],
    setup: null, collapsed: {}, settingsOpen: false,
    pool: [], session: null,
    timerId: null,
    history: [], hidx: -1,
    revivalCodeShown: false, // このページ訪問中に一度でも「コードを表示」したか(離脱警告の判定に使う)
  };

  function clear() { while (app.firstChild) app.removeChild(app.firstChild); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function mkCheck(checked) { var c = document.createElement("input"); c.type = "checkbox"; c.checked = !!checked; return c; }
  function clearTimer() { if (state.timerId) { clearInterval(state.timerId); state.timerId = null; } }

  // ---------- 履歴ナビ(戻る/進む) ----------
  function historyEntry() { return state.history[state.hidx] || null; }
  function shouldConfirmDiscard(next) {
    var cur = historyEntry();
    return !!(state.session && state.session.active && cur && cur.view === "quiz" && next && next.view !== "quiz");
  }
  function abandonSessionTo(entry) {
    clearTimer();
    state.session = null; state.pool = [];
    state.history = [entry]; state.hidx = 0;
    renderCurrent();
  }
  function confirmDiscard() {
    return confirm("演習中です。回答済みの成績は保存されていますが、残りの問題は破棄されます。移動しますか？");
  }
  function navTo(entry) {
    if (shouldConfirmDiscard(entry)) {
      if (!confirmDiscard()) return;
      abandonSessionTo(entry); return;
    }
    state.history = state.history.slice(0, state.hidx + 1);
    state.history.push(entry); state.hidx++;
    renderCurrent();
  }
  function back() {
    if (state.hidx <= 0) return;
    var next = state.history[state.hidx - 1];
    if (shouldConfirmDiscard(next)) {
      if (!confirmDiscard()) return;
      abandonSessionTo(next); return;
    }
    state.hidx--; renderCurrent();
  }
  function forward() {
    if (state.hidx >= state.history.length - 1) return;
    var next = state.history[state.hidx + 1];
    if (shouldConfirmDiscard(next)) {
      if (!confirmDiscard()) return;
      abandonSessionTo(next); return;
    }
    state.hidx++; renderCurrent();
  }
  function updateHistButtons() {
    var b = document.getElementById("nav-back"), f = document.getElementById("nav-forward");
    if (b) b.disabled = state.hidx <= 0;
    if (f) f.disabled = state.hidx >= state.history.length - 1;
  }
  function renderCurrent() {
    clearTimer();
    document.body.classList.remove("has-fixedbar");
    updateHistButtons();
    var e = state.history[state.hidx] || { view: "subjects" };
    if (e.view === "subjects") renderSubjects();
    else if (e.view === "range") renderRange();
    else if (e.view === "quiz") renderQuizAt(e.idx);
    else if (e.view === "review") renderReview();
    else if (e.view === "done") renderDone();
    else if (e.view === "stats") renderStats();
  }

  // ---------- 科目の展開 ----------
  function initSubject(subject) {
    state.subject = subject;
    state.flatQuestions = []; state.qLeafMap = {}; state.leafInfo = {}; state.unitNodes = [];
    (subject.units || []).forEach(function (unit) {
      var uNode = { name: unit.name, children: unit.nodes || [], _unit: true, unitId: unit.id, unitTotal: unit._total || 0 };
      state.unitNodes.push(uNode);
      (function walk(node) {
        if (node.leaf) {
          var cnt = (unit._counts && unit._counts[node.name]) || 0;
          state.leafInfo[node.leaf] = { name: node.name, unitId: unit.id, unitName: unit.name, count: cnt };
          return;
        }
        (node.children || []).forEach(walk);
      })(uNode);
      (unit.questions || []).forEach(function (q) {
        q._unitId = unit.id; q._leafId = unit.id + "::" + q.leaf;
        state.flatQuestions.push(q); state.qLeafMap[q.id] = q._leafId;
      });
    });
    state.unitNodes.forEach(aggregate);
    initSetup(); initCollapsed();
  }
  function aggregate(node) {
    if (node.leaf) {
      var c = (state.leafInfo[node.leaf] || {}).count || 0;
      node._leafIds = [node.leaf]; node._selIds = c > 0 ? [node.leaf] : []; node._count = c; return;
    }
    var leafIds = [], selIds = [], count = 0;
    (node.children || []).forEach(function (ch) {
      aggregate(ch); leafIds = leafIds.concat(ch._leafIds); selIds = selIds.concat(ch._selIds); count += ch._count;
    });
    node._leafIds = leafIds; node._selIds = selIds; node._count = count;
  }
  function initSetup() {
    var leaves = {};
    Object.keys(state.leafInfo).forEach(function (id) { if (state.leafInfo[id].count > 0) leaves[id] = true; });
    var diffs = {}; DIFFS.forEach(function (d) { diffs[d] = true; });
    state.setup = {
      leaves: leaves, diffs: diffs,
      st: { unanswered: true, wrong: true, correct: false },
      shuffle: true, hideWhy: true, limit: 20,
      reveal: "each",          // 'each'=1問ずつ / 'end'=最後にまとめて
      timeMode: "none",        // 'none' / 'perQ' / 'perSet'
      perQSec: 60, perSetMin: 10,
      showMeta: true,          // 出題中に分類・難易度を表示
    };
  }
  function initCollapsed() {
    state.collapsed = {};
    state.unitNodes.forEach(function (uNode, ui) {
      var ukey = "u" + ui;
      if (uNode.unitTotal === 0) { state.collapsed[ukey] = true; return; }
      (function walk(node, key) {
        if (node.leaf) return;
        var allLeaves = (node.children || []).length > 0 && node.children.every(function (c) { return !!c.leaf; });
        if (!node._unit && allLeaves) state.collapsed[key] = true;
        (node.children || []).forEach(function (c, i) { walk(c, key + "/" + i); });
      })(uNode, ukey);
    });
  }

  // 各リーフの進捗(解答済み数・正答数)を results から算出
  function leafProgress() {
    var res = getResults(state.subject.id);
    var byLeaf = {}; // leafId -> {ans, correct}
    Object.keys(res).forEach(function (qid) {
      var leafId = state.qLeafMap[qid]; if (!leafId) return;
      if (!byLeaf[leafId]) byLeaf[leafId] = { ans: 0, correct: 0 };
      byLeaf[leafId].ans += 1; if (res[qid] === "correct") byLeaf[leafId].correct += 1;
    });
    return byLeaf;
  }

  // ============ 科目選択 ============
  function renderSubjects() {
    clear();
    document.body.classList.remove("has-fixedbar");
    var subjects = (window.QuizBank && window.QuizBank.subjects()) || [];
    var h = el("div", "card");
    h.appendChild(el("h1", null, "科目を選ぶ"));
    h.appendChild(el("p", "muted", "科目を選んで、その中から出題範囲(単元・分類)をしぼります。範囲は単元をまたいで選べます。"));
    if (!subjects.length) h.appendChild(el("p", "warn", "問題データが読み込まれていません。"));
    var list = el("div", "syslist");
    subjects.forEach(function (subj) {
      var total = 0, ready = 0;
      (subj.units || []).forEach(function (u) { total += (u._total || 0); if (u._total > 0) ready++; });
      var c = el("button", "sysitem");
      c.appendChild(el("div", "sysname", subj.name));
      c.appendChild(el("div", "sysdesc", (subj.units || []).length + "単元中 " + ready + "単元 収録済み(残りは順次追加)"));
      var meta = el("div", "sysmeta");
      meta.appendChild(el("span", "pill", total + "問"));
      meta.appendChild(el("span", "pill pill-new", "5択・難易度4段階"));
      c.appendChild(meta);
      c.onclick = function () { initSubject(subj); navTo({ view: "range" }); };
      list.appendChild(c);
    });
    h.appendChild(list); app.appendChild(h);
  }

  // ============ 範囲選択 ============
  function renderRange() {
    clear();
    var subject = state.subject;
    if (!subject) { renderSubjects(); return; }
    if (!state.setup) initSubject(subject);
    document.body.classList.add("has-fixedbar");

    var card = el("div", "card rangecard");
    var head = el("div", "row between wrap treehead");
    var htitle = el("div", "row gap");
    htitle.appendChild(el("h1", "nomargin", subject.name));
    htitle.appendChild(el("span", "muted small", "出題範囲を選ぶ"));
    head.appendChild(htitle);
    var treeBtns = el("div", "row gap wrap");
    var bExpand = el("button", "mini", "全て展開");
    var bCollapse = el("button", "mini", "全て折りたたむ");
    var bAll = el("button", "mini", "全選択");
    var bNone = el("button", "mini", "全解除");
    [bExpand, bCollapse, bAll, bNone].forEach(function (b) { treeBtns.appendChild(b); });
    head.appendChild(treeBtns); card.appendChild(head);

    var tree = el("div", "tree"); card.appendChild(tree);
    var prog = leafProgress();

    function nodeProgress(node) {
      var ans = 0, cor = 0;
      node._leafIds.forEach(function (id) { var p = prog[id]; if (p) { ans += p.ans; cor += p.correct; } });
      return { ans: ans, correct: cor, total: node._count };
    }
    function progChip(pr) {
      if (pr.total === 0 || pr.ans === 0) return null;
      var pct = Math.round((pr.correct / pr.ans) * 100);
      var wrap = el("span", "prog");
      var bar = el("span", "progbar");
      var fill = el("span", "progfill " + (pct < 50 ? "low" : pct < 80 ? "mid" : "high"));
      fill.style.width = Math.round((pr.ans / pr.total) * 100) + "%";
      bar.appendChild(fill); wrap.appendChild(bar);
      wrap.appendChild(el("span", "progtxt", "解答" + pr.ans + "/" + pr.total + "・正答" + pct + "%"));
      return wrap;
    }
    function resetBtn(node, isLeaf) {
      var b = el("button", "resetbtn", "↺");
      b.title = "この範囲の成績をリセット";
      b.onclick = function (e) {
        e.stopPropagation(); e.preventDefault();
        var ids = isLeaf ? [node.leaf] : node._leafIds;
        if (!confirm("この範囲の成績(解答履歴・正答率)を消去します。よろしいですか？")) return;
        var res = getResults(subject.id);
        var choices = getChoices(subject.id);
        Object.keys(res).forEach(function (qid) {
          if (ids.indexOf(state.qLeafMap[qid]) >= 0) { delete res[qid]; delete choices[qid]; }
        });
        setResults(subject.id, res);
        setChoices(subject.id, choices);
        buildTree(); refresh();
      };
      return b;
    }

    function buildTree() {
      while (tree.firstChild) tree.removeChild(tree.firstChild);
      prog = leafProgress();
      state.unitNodes.forEach(function (uNode, ui) { tree.appendChild(buildNode(uNode, "u" + ui, 0)); });
    }
    function buildNode(node, key, depth) {
      var wrap = el("div", "tnode");
      if (node.leaf) { wrap.appendChild(leafRow(node, depth)); return wrap; }
      var collapsed = !!state.collapsed[key];
      var row = el("div", "trow" + (node._unit ? " trow-unit" : " trow-branch"));
      row.style.paddingLeft = (6 + depth * INDENT) + "px";
      var chev = el("button", "chev" + (collapsed ? " closed" : ""), "▾");
      chev.setAttribute("aria-label", "開閉"); chev.setAttribute("aria-expanded", String(!collapsed));
      chev.onclick = function (e) { e.stopPropagation(); state.collapsed[key] = !collapsed; buildTree(); };
      row.appendChild(chev);

      var chosen = node._selIds.filter(function (id) { return state.setup.leaves[id]; }).length;
      var cb = mkCheck(false);
      if (node._selIds.length === 0) cb.disabled = true;
      cb.checked = node._selIds.length > 0 && chosen === node._selIds.length;
      cb.indeterminate = chosen > 0 && chosen < node._selIds.length;
      cb.onclick = function (e) { e.stopPropagation(); };
      cb.onchange = function () { node._selIds.forEach(function (id) { state.setup.leaves[id] = cb.checked; }); buildTree(); refresh(); };
      row.appendChild(cb);

      var name = el("span", "tlabel", node.name);
      name.onclick = function () { state.collapsed[key] = !collapsed; buildTree(); };
      row.appendChild(name);

      var meta = el("span", "tmeta");
      if (node._count > 0) {
        meta.appendChild(el("span", "tcount", node._count + "問"));
        var pc = progChip(nodeProgress(node)); if (pc) meta.appendChild(pc);
        var sel = el("span", "tsel" + (chosen === node._selIds.length ? " full" : chosen === 0 ? " none" : ""),
          chosen === node._selIds.length ? "全選択" : chosen + "/" + node._selIds.length);
        meta.appendChild(sel);
      } else { meta.appendChild(el("span", "tprep", "準備中")); }
      row.appendChild(meta);

      if (node._selIds.length > 0) {
        var actions = el("span", "rowactions");
        var only = el("button", "onlybtn", "これだけ");
        only.title = "他を全て外し、ここだけを出題範囲にする";
        only.onclick = function (e) {
          e.stopPropagation();
          Object.keys(state.setup.leaves).forEach(function (k) { state.setup.leaves[k] = false; });
          node._selIds.forEach(function (id) { state.setup.leaves[id] = true; });
          buildTree(); refresh();
        };
        actions.appendChild(only);
        if (nodeProgress(node).ans > 0) actions.appendChild(resetBtn(node, false));
        row.appendChild(actions);
      }
      wrap.appendChild(row);
      if (!collapsed) {
        var body = el("div", "tbody");
        node.children.forEach(function (ch, i) { body.appendChild(buildNode(ch, key + "/" + i, depth + 1)); });
        wrap.appendChild(body);
      }
      return wrap;
    }
    function leafRow(node, depth) {
      var info = state.leafInfo[node.leaf] || { count: 0 };
      var avail = info.count > 0;
      var row = el(avail ? "label" : "div", "trow trow-leaf" + (avail ? "" : " leaf-empty"));
      row.style.paddingLeft = (6 + depth * INDENT) + "px";
      var cb = mkCheck(!!state.setup.leaves[node.leaf]);
      if (!avail) cb.disabled = true;
      cb.onchange = function () { state.setup.leaves[node.leaf] = cb.checked; buildTree(); refresh(); };
      row.appendChild(cb);
      row.appendChild(el("span", "tlabel", node.name));
      var meta = el("span", "tmeta");
      if (avail) {
        meta.appendChild(el("span", "tcount", info.count + "問"));
        var p = prog[node.leaf];
        if (p) { var pc = progChip({ ans: p.ans, correct: p.correct, total: info.count }); if (pc) meta.appendChild(pc); }
      } else meta.appendChild(el("span", "tprep", "準備中"));
      row.appendChild(meta);
      if (avail && prog[node.leaf]) {
        var actions = el("span", "rowactions");
        actions.appendChild(resetBtn(node, true));
        row.appendChild(actions);
      }
      return row;
    }

    bExpand.onclick = function () { state.collapsed = {}; buildTree(); };
    bCollapse.onclick = function () {
      state.collapsed = {};
      state.unitNodes.forEach(function (uNode, ui) {
        (function walk(node, key) {
          if (node.leaf) return; state.collapsed[key] = true;
          (node.children || []).forEach(function (c, i) { walk(c, key + "/" + i); });
        })(uNode, "u" + ui);
      });
      buildTree();
    };
    bAll.onclick = function () {
      Object.keys(state.leafInfo).forEach(function (id) { if (state.leafInfo[id].count > 0) state.setup.leaves[id] = true; });
      buildTree(); refresh();
    };
    bNone.onclick = function () { Object.keys(state.setup.leaves).forEach(function (k) { state.setup.leaves[k] = false; }); buildTree(); refresh(); };

    app.appendChild(card);

    // 固定バー(スクロールしても動かない)
    var bar = el("div", "fixedbar");
    var info = el("div", "barinfo"); bar.appendChild(info);
    var right = el("div", "row gap");
    var gear = el("button", "gearbtn", "⚙ 設定");
    gear.onclick = function () { state.settingsOpen = true; renderSettings(); };
    right.appendChild(gear);
    var startBtn = el("button", "primary big", "この範囲で開始");
    right.appendChild(startBtn);
    bar.appendChild(right);
    app.appendChild(bar);
    var hint = el("div", "muted small barhint2"); bar.appendChild(hint);

    var settingsHost = el("div", "settings-host"); app.appendChild(settingsHost);

    function buildPool() {
      var setup = state.setup, res = getResults(subject.id);
      return state.flatQuestions.filter(function (q) {
        if (!setup.leaves[q._leafId]) return false;
        if (!setup.diffs[q.diff]) return false;
        var status = res[q.id] ? res[q.id] : "unanswered";
        return !!setup.st[status];
      });
    }
    function refresh() {
      var setup = state.setup, pool = buildPool(), matched = pool.length;
      var willAsk = setup.limit === 0 ? matched : Math.min(matched, setup.limit);
      if (matched === 0) {
        info.innerHTML = "<b>0</b> 問";
        var anyLeaf = Object.keys(setup.leaves).some(function (k) { return setup.leaves[k]; });
        var anySt = Object.keys(setup.st).some(function (k) { return setup.st[k]; });
        var msg = "条件に合う問題がありません。";
        if (!anyLeaf) msg += " 分類が選ばれていません。";
        else if (!DIFFS.some(function (d) { return setup.diffs[d]; })) msg += " 難易度が未選択です(設定)。";
        else if (!anySt) msg += " 回答状況が未選択です(設定)。";
        else if (!setup.st.correct) msg += " 「正答」を除外中です(設定)。含めると復習済みも出題できます。";
        hint.textContent = msg;
      } else {
        info.innerHTML = "該当 <b>" + matched + "</b> 問" +
          (setup.limit !== 0 && matched > setup.limit ? "(このうち <b>" + willAsk + "</b> 問)" : "");
        hint.textContent = "";
      }
      startBtn.disabled = willAsk === 0;
    }
    startBtn.onclick = function () {
      var setup = state.setup, pool = buildPool();
      if (setup.shuffle) pool = shuffle(pool.slice());
      if (setup.limit !== 0) pool = pool.slice(0, setup.limit);
      state.pool = pool;
      state.session = {
        total: pool.length, answers: new Array(pool.length),
        qDeadlines: new Array(pool.length),
        reveal: setup.reveal, showMeta: setup.showMeta,
        timeMode: setup.timeMode, perQSec: setup.perQSec,
        deadline: setup.timeMode === "perSet" ? Date.now() + setup.perSetMin * 60000 : 0,
        hideWhy: setup.hideWhy, active: true,
      };
      navTo({ view: "quiz", idx: 0 });
    };

    function renderSettings() {
      settingsHost.innerHTML = "";
      if (!state.settingsOpen) return;
      var overlay = el("div", "settings-overlay");
      overlay.onclick = function (e) { if (e.target === overlay) { state.settingsOpen = false; renderSettings(); } };
      var panel = el("div", "settings-panel");
      var ph = el("div", "row between");
      ph.appendChild(el("h2", "nomargin", "出題の設定"));
      var close = el("button", "iconbtn", "✕");
      close.onclick = function () { state.settingsOpen = false; renderSettings(); };
      ph.appendChild(close); panel.appendChild(ph);
      var setup = state.setup;

      panel.appendChild(el("h3", null, "難易度"));
      var diffWrap = el("div", "row gap wrap");
      DIFFS.forEach(function (d) {
        var cb = mkCheck(!!setup.diffs[d]);
        cb.onchange = function () { setup.diffs[d] = cb.checked; refresh(); };
        var lab = el("label", "chip"); lab.appendChild(cb); lab.appendChild(el("span", null, d)); diffWrap.appendChild(lab);
      });
      panel.appendChild(diffWrap);

      panel.appendChild(el("h3", null, "回答状況"));
      var stWrap = el("div", "row gap wrap");
      [["unanswered", "未回答"], ["wrong", "誤答"], ["correct", "正答"]].forEach(function (p) {
        var cb = mkCheck(!!setup.st[p[0]]);
        cb.onchange = function () { setup.st[p[0]] = cb.checked; refresh(); };
        var lab = el("label", "chip"); lab.appendChild(cb); lab.appendChild(el("span", null, p[1])); stWrap.appendChild(lab);
      });
      panel.appendChild(stWrap);

      panel.appendChild(el("h3", null, "出題数・順番"));
      var optRow = el("div", "row gap wrap");
      var limitWrap = el("label", "chip selchip"); limitWrap.appendChild(el("span", null, "出題数"));
      var limitSel = el("select", "minisel");
      LIMIT_OPTS.forEach(function (n) {
        var op = el("option", null, n === 0 ? "無制限" : n + "問"); op.value = String(n);
        if (n === setup.limit) op.selected = true; limitSel.appendChild(op);
      });
      limitSel.onchange = function () { setup.limit = parseInt(limitSel.value, 10); refresh(); };
      limitWrap.appendChild(limitSel); optRow.appendChild(limitWrap);
      var shuffleCb = mkCheck(setup.shuffle);
      shuffleCb.onchange = function () { setup.shuffle = shuffleCb.checked; };
      var shLab = el("label", "chip"); shLab.appendChild(shuffleCb); shLab.appendChild(el("span", null, "シャッフル")); optRow.appendChild(shLab);
      panel.appendChild(optRow);

      panel.appendChild(el("h3", null, "解答の表示"));
      var revWrap = el("div", "row gap wrap");
      revWrap.appendChild(radio("reveal", "each", "1問ずつ答え合わせ", setup.reveal === "each", function () { setup.reveal = "each"; }));
      revWrap.appendChild(radio("reveal", "end", "最後にまとめて採点", setup.reveal === "end", function () { setup.reveal = "end"; }));
      panel.appendChild(revWrap);

      panel.appendChild(el("h3", null, "制限時間"));
      var timeWrap = el("div", "col gap");
      var trow = el("div", "row gap wrap");
      trow.appendChild(radio("timeMode", "none", "なし", setup.timeMode === "none", function () { setup.timeMode = "none"; renderSettings(); }));
      trow.appendChild(radio("timeMode", "perQ", "1問ごと", setup.timeMode === "perQ", function () { setup.timeMode = "perQ"; renderSettings(); }));
      trow.appendChild(radio("timeMode", "perSet", "セット全体", setup.timeMode === "perSet", function () { setup.timeMode = "perSet"; renderSettings(); }));
      timeWrap.appendChild(trow);
      if (setup.timeMode === "perQ") {
        var qs = el("label", "chip selchip"); qs.appendChild(el("span", null, "1問あたり"));
        var qsel = el("select", "minisel");
        PERQ_SECS.forEach(function (n) { var op = el("option", null, n + "秒"); op.value = String(n); if (n === setup.perQSec) op.selected = true; qsel.appendChild(op); });
        qsel.onchange = function () { setup.perQSec = parseInt(qsel.value, 10); };
        qs.appendChild(qsel); timeWrap.appendChild(qs);
      } else if (setup.timeMode === "perSet") {
        var ss = el("label", "chip selchip"); ss.appendChild(el("span", null, "セット全体"));
        var ssel = el("select", "minisel");
        PERSET_MINS.forEach(function (n) { var op = el("option", null, n + "分"); op.value = String(n); if (n === setup.perSetMin) op.selected = true; ssel.appendChild(op); });
        ssel.onchange = function () { setup.perSetMin = parseInt(ssel.value, 10); };
        ss.appendChild(ssel); timeWrap.appendChild(ss);
      }
      panel.appendChild(timeWrap);

      panel.appendChild(el("h3", null, "表示"));
      var dispWrap = el("div", "col gap");
      var meta = mkCheck(setup.showMeta);
      meta.onchange = function () { setup.showMeta = meta.checked; };
      var mLab = el("label", "chip"); mLab.appendChild(meta); mLab.appendChild(el("span", null, "出題中に分類・難易度を表示")); dispWrap.appendChild(mLab);
      var hw = mkCheck(setup.hideWhy);
      hw.onchange = function () { setup.hideWhy = hw.checked; };
      var hwLab = el("label", "chip"); hwLab.appendChild(hw); hwLab.appendChild(el("span", null, "選択肢ごとの解説・参考文献を既定で隠す")); dispWrap.appendChild(hwLab);
      panel.appendChild(dispWrap);

      var done = el("button", "primary", "閉じる");
      done.onclick = function () { state.settingsOpen = false; renderSettings(); };
      panel.appendChild(el("div", "row end settings-foot")).appendChild(done);
      overlay.appendChild(panel); settingsHost.appendChild(overlay);
    }
    function radio(group, val, label, checked, onpick) {
      var lab = el("label", "chip radio" + (checked ? " picked" : ""));
      var r = document.createElement("input"); r.type = "radio"; r.name = "set-" + group; r.checked = checked;
      r.onchange = function () { if (r.checked) { onpick(); refresh(); if (state.settingsOpen) syncRadios(group); } };
      lab.appendChild(r); lab.appendChild(el("span", null, label));
      return lab;
    }
    function syncRadios(group) {
      var nodes = settingsHost.querySelectorAll('input[name="set-' + group + '"]');
      for (var i = 0; i < nodes.length; i++) nodes[i].parentNode.classList.toggle("picked", nodes[i].checked);
    }

    buildTree(); refresh(); renderSettings();
  }

  // ============ 出題(1問) ============
  function currentAnsIdx(q) { return q.ans - 1; }
  function finishSession() {
    if (state.session) state.session.active = false;
    navTo({ view: state.session && state.session.reveal === "end" ? "review" : "done" });
  }

  function recordAnswer(i, chosen, timedOut) {
    var q = state.pool[i], correct = chosen != null && chosen === currentAnsIdx(q);
    state.session.answers[i] = { chosen: chosen, correct: correct, timedOut: !!timedOut };
    var results = getResults(state.subject.id);
    results[q.id] = correct ? "correct" : "wrong";
    setResults(state.subject.id, results);
    // 実際に選んだ選択肢を記録(タイムアウト=chosen null の場合は「選んだ」とは言えないので記録しない。
    // → 進捗復元コードの対象からは自然に外れる)
    if (chosen != null) {
      var choices = getChoices(state.subject.id);
      choices[q.id] = chosen;
      setChoices(state.subject.id, choices);
    }
  }

  function renderQuizAt(i) {
    clearTimer(); clear();
    document.body.classList.remove("has-fixedbar");
    if (i >= state.pool.length) { finishSession(); return; }
    // セット制限時間の失効チェック
    if (state.session.timeMode === "perSet" && state.session.deadline && Date.now() >= state.session.deadline) {
      finishSession(); return;
    }
    var q = state.pool[i], sess = state.session, ans = sess.answers[i];
    var reveal = sess.reveal, answered = !!ans;

    var card = el("div", "card quizcard");
    var hdr = el("div", "quizhdr");
    var left = el("div", "row gap wrap");
    left.appendChild(el("span", "qprog", (i + 1) + " / " + state.pool.length));
    if (sess.showMeta) {
      var info = state.leafInfo[q._leafId];
      if (info && info.unitName) left.appendChild(el("span", "pill pill-unit", info.unitName));
      left.appendChild(el("span", "pill", q.leaf));
      left.appendChild(el("span", "pill pill-diff diff-" + q.diff, q.diff));
    }
    hdr.appendChild(left);
    var right = el("div", "row gap");
    var showTimer = sess.timeMode === "perSet" || (sess.timeMode === "perQ" && !answered);
    var timerEl = null;
    if (showTimer) { timerEl = el("span", "timer", ""); right.appendChild(timerEl); }
    var quit = el("button", "ghost mini", "中断して結果へ");
    quit.onclick = function () { finishSession(); };
    right.appendChild(quit);
    hdr.appendChild(right);
    card.appendChild(hdr);

    var pbar = el("div", "pbar"); var pfill = el("div", "pfill");
    pfill.style.width = Math.round((i / state.pool.length) * 100) + "%"; pbar.appendChild(pfill); card.appendChild(pbar);

    card.appendChild(el("div", "qtext", q.q));

    var ansIdx = currentAnsIdx(q);
    var choicesWrap = el("div", "choices");
    var detail = el("div", "detail hidden");
    q.choices.forEach(function (text, ci) {
      var b = el("button", "choice");
      b.appendChild(el("span", "clabel", LETTERS[ci]));
      b.appendChild(el("span", "ctext", text));
      if (answered) {
        b.disabled = true;
        if (reveal === "each") {
          if (ci === ansIdx) b.classList.add("correct");
          if (ci === ans.chosen && !ans.correct) b.classList.add("wrong");
        } else { // end: 選択のみ強調(正誤は伏せる)
          if (ci === ans.chosen) b.classList.add("chosen");
        }
      } else {
        b.onclick = function () { onPick(i, ci); };
      }
      choicesWrap.appendChild(b);
    });
    card.appendChild(choicesWrap);
    card.appendChild(detail);
    app.appendChild(card);

    // 解答済み表示
    if (answered && reveal === "each") {
      buildDetail(q, ansIdx, detail, ans.correct);
    } else {
      // ナビ(未回答 or endモード)
      var nav = el("div", "row gap end navnext");
      if (i > 0) { var prev = el("button", "ghost", "← 前の問題"); prev.onclick = function () { back(); }; nav.appendChild(prev); }
      if (answered) {
        var nx = el("button", "primary", i + 1 >= state.pool.length ? "採点して結果へ" : "次の問題 →");
        nx.onclick = function () { if (i + 1 >= state.pool.length) finishSession(); else navTo({ view: "quiz", idx: i + 1 }); };
        nav.appendChild(nx);
      }
      card.appendChild(nav);
    }

    // タイマー起動
    if (sess.timeMode === "perSet" && sess.deadline) {
      startTimer(timerEl, function () { return Math.max(0, Math.round((sess.deadline - Date.now()) / 1000)); }, function () { finishSession(); });
    } else if (sess.timeMode === "perQ" && !answered) {
      var qDeadline = sess.qDeadlines[i];
      if (!qDeadline) {
        qDeadline = Date.now() + sess.perQSec * 1000;
        sess.qDeadlines[i] = qDeadline;
      }
      startTimer(timerEl, function () { return Math.max(0, Math.round((qDeadline - Date.now()) / 1000)); }, function () {
        // タイムアウト = 誤答扱い
        recordAnswer(i, null, true);
        if (reveal === "each") renderQuizAt(i);
        else if (i + 1 >= state.pool.length) finishSession();
        else navTo({ view: "quiz", idx: i + 1 });
      });
    }

    function onPick(idx, ci) {
      recordAnswer(idx, ci, false);
      if (reveal === "each") { renderQuizAt(idx); }
      else { if (idx + 1 >= state.pool.length) finishSession(); else navTo({ view: "quiz", idx: idx + 1 }); }
    }
  }

  function startTimer(elm, remainFn, onZero) {
    clearTimer();
    function tick() {
      var r = remainFn();
      if (elm) {
        var mm = Math.floor(r / 60), ss = r % 60;
        elm.textContent = "⏱ " + (mm > 0 ? mm + ":" + (ss < 10 ? "0" : "") + ss : r + "秒");
        elm.classList.toggle("urgent", r <= 10);
      }
      if (r <= 0) { clearTimer(); onZero(); return false; }
      return true;
    }
    if (tick()) state.timerId = setInterval(tick, 250);
  }

  function buildDetail(q, ansIdx, detail, correct) {
    detail.className = "detail";
    while (detail.firstChild) detail.removeChild(detail.firstChild);
    detail.appendChild(el("div", "verdict " + (correct ? "ok" : "ng"), correct ? "正解" : "不正解"));

    var exp = el("div", "expbox");
    exp.appendChild(el("div", "exphd", "解説"));
    exp.appendChild(el("div", "expbody", q.exp || ""));
    detail.appendChild(exp);

    var hasWhy = q.why && q.why.length, hasRef = q.refs && q.refs.length;
    if (hasWhy || hasRef) {
      var more = el("div", "more " + (state.session && state.session.hideWhy ? "hidden" : ""));
      if (hasWhy) {
        var wb = el("div", "whybox");
        wb.appendChild(el("div", "exphd", "選択肢ごとの解説"));
        q.choices.forEach(function (c, i) {
          var row = el("div", "whyrow" + (i === ansIdx ? " whyok" : ""));
          row.appendChild(el("span", "clabel sm", LETTERS[i]));
          row.appendChild(el("span", null, q.why[i] || ""));
          wb.appendChild(row);
        });
        more.appendChild(wb);
      }
      if (hasRef) {
        var rb = el("div", "refbox");
        rb.appendChild(el("div", "exphd", "参考文献"));
        q.refs.forEach(function (r) { rb.appendChild(el("div", "refitem", r)); });
        more.appendChild(rb);
      }
      var toggle = el("button", "linktoggle",
        (state.session && state.session.hideWhy) ? "選択肢ごとの解説・参考文献を表示" : "選択肢ごとの解説・参考文献を隠す");
      toggle.onclick = function () {
        more.classList.toggle("hidden");
        toggle.textContent = more.classList.contains("hidden") ? "選択肢ごとの解説・参考文献を表示" : "選択肢ごとの解説・参考文献を隠す";
      };
      detail.appendChild(toggle); detail.appendChild(more);
    }

    detail.appendChild(renderReportForm(q));

    var idx = state.pool.indexOf(q);
    var nav = el("div", "row gap end navnext");
    if (idx > 0) { var prev = el("button", "ghost", "← 前の問題"); prev.onclick = function () { back(); }; nav.appendChild(prev); }
    var next = el("button", "primary", idx + 1 >= state.pool.length ? "結果を見る" : "次の問題 →");
    next.onclick = function () { if (idx + 1 >= state.pool.length) finishSession(); else navTo({ view: "quiz", idx: idx + 1 }); };
    nav.appendChild(next);
    detail.appendChild(nav);
  }

  var REPORT_CATS = [
    "①事実誤り(解説や正解が誤っている)",
    "②選択肢が曖昧で複数正解になりうる",
    "③設問文が不明瞭",
    "④解説が不適切(該当箇所で対象を指定)",
    "⑤日本語用語が不適切",
    "⑥既存の問題集・過去問と酷似している(版権の懸念)",
    "⑦難易度が不適切(難しすぎる)",
    "⑧難易度が不適切(簡単すぎる)",
    "⑨知識がなくても正解できてしまう(選択肢の長さ・言い回しなど)"
  ];
  // ⑥をチェックした時だけ「似ている出典」欄を出すための目印。
  // 配列末尾の位置で判定すると分類を追加するたびに壊れるため、文字列の先頭記号で同定する。
  var REPORT_CAT_COPYRIGHT_PREFIX = "⑥";
  var REPORT_TARGETS = ["設問文", "解説全体", "A", "B", "C", "D", "E"];

  // ---------- 報告の送信(任意: report-config.js で window.REPORT_CHANNEL を設定した場合のみ) ----------
  function reportChannel() {
    return (typeof window !== "undefined" && window.REPORT_CHANNEL) || null;
  }
  // Googleフォームは項目数を4つ(qid/q/cats/note)のまま保つため、
  // targets(該当箇所)はcats文字列の末尾に、source(類似出典)はnote文字列の先頭に畳み込んで送る。
  function foldCatsForForm(report) {
    var s = (report.cats || []).join(" / ");
    if (report.targets && report.targets.length) {
      s += (s ? " / " : "") + "該当: " + report.targets.join("・");
    }
    return s;
  }
  function foldNoteForForm(report) {
    var n = report.note || "";
    if (report.source) n = "【出典】" + report.source + "\n" + n;
    return n;
  }
  // report をチャンネルへ送信し、成否を cb(ok) で返す。REPORT_CHANNEL 未設定なら即 cb(false)。
  function sendReportRemote(report, cb) {
    var ch = reportChannel();
    if (!ch) { cb(false); return; }
    try {
      if (ch.type === "google-form" && ch.action) {
        var fd = new FormData();
        var f = ch.fields || {};
        if (f.qid) fd.append(f.qid, report.qid || "");
        if (f.q) fd.append(f.q, report.q || "");
        if (f.cats) fd.append(f.cats, foldCatsForForm(report));
        if (f.note) fd.append(f.note, foldNoteForForm(report));
        fetch(ch.action, { method: "POST", mode: "no-cors", body: fd })
          .then(function () { cb(true); })   // no-corsは応答本文を読めないため、fetchが解決した時点で送信成功とみなす
          .catch(function () { cb(false); });
      } else if (ch.type === "http" && ch.url) {
        fetch(ch.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
        }).then(function (res) { cb(!!res.ok); })
          .catch(function () { cb(false); });
      } else {
        cb(false);
      }
    } catch (e) { cb(false); }
  }
  // 保存済みreports配列中の該当エントリ(ts+qidで同定)にsentフラグを立てて保存
  function markReportSent(subjId, report) {
    var list = getReports(subjId);
    for (var i = 0; i < list.length; i++) {
      if (list[i].ts === report.ts && list[i].qid === report.qid) {
        list[i].sent = true;
        list[i].sentTs = new Date().toISOString();
        break;
      }
    }
    setReports(subjId, list);
  }

  function renderReportForm(q) {
    var box = el("details", "reportbox");
    box.appendChild(el("summary", null, "この問題・解説を報告する"));
    var body = el("div", "reportbody");
    var checks = [];
    REPORT_CATS.forEach(function (label) {
      var cb = mkCheck(false);
      var lab = el("label", "rrow"); lab.appendChild(cb); lab.appendChild(el("span", null, label));
      body.appendChild(lab); checks.push({ cb: cb, label: label });
    });

    // 該当箇所(任意・複数選択可): どの設問文/解説/選択肢についての報告かを指定する
    var targetsWrap = el("div", "rtargetwrap");
    targetsWrap.appendChild(el("div", "muted small", "該当箇所(任意・複数選択可):"));
    var targetRow = el("div", "row gap wrap rtargetrow");
    var targetChecks = [];
    REPORT_TARGETS.forEach(function (label) {
      var cb = mkCheck(false);
      var lab = el("label", "rtarget"); lab.appendChild(cb); lab.appendChild(el("span", null, label));
      targetRow.appendChild(lab); targetChecks.push({ cb: cb, label: label });
    });
    targetsWrap.appendChild(targetRow);
    body.appendChild(targetsWrap);

    // ⑥(酷似・版権の懸念)チェック時のみ表示する類似出典の入力欄
    var sourceWrap = el("div", "rsourcewrap hidden");
    sourceWrap.appendChild(el("div", "muted small", "似ている出典(書名・年度・問題番号など、分かる範囲で):"));
    var sourceInput = el("input", "rsource");
    sourceInput.type = "text";
    sourceInput.placeholder = "例: ○○問題集 2023年版 第12問";
    sourceWrap.appendChild(sourceInput);
    body.appendChild(sourceWrap);
    // ⑥(酷似・版権)のチェックボックスを先頭記号で特定する(末尾位置に依存しない)
    var copyrightEntry = null;
    for (var ci = 0; ci < checks.length; ci++) {
      if (checks[ci].label.indexOf(REPORT_CAT_COPYRIGHT_PREFIX) === 0) { copyrightEntry = checks[ci]; break; }
    }
    if (copyrightEntry) {
      copyrightEntry.cb.onchange = function () {
        sourceWrap.classList.toggle("hidden", !copyrightEntry.cb.checked);
      };
    }

    var ta = el("textarea", "rnote"); ta.placeholder = "自由記述(任意): 具体的な問題点をご記入ください。";
    body.appendChild(ta);
    // 送信先が設定されている場合、報告は外部(Googleフォーム等)へ送られる。
    // 利用者が「端末内に保存されるだけ」と誤解して個人情報を書いてしまわないよう明示する。
    if (reportChannel()) {
      body.appendChild(el("p", "muted small",
        "※ 報告内容は運営者へ送信されます。氏名・連絡先などの個人情報は書かないでください。"));
    }
    var msg = el("div", "muted small");
    var send = el("button", "mini", reportChannel() ? "報告を送信" : "報告を保存");
    send.onclick = function () {
      var cats = checks.filter(function (c) { return c.cb.checked; }).map(function (c) { return c.label; });
      var targets = targetChecks.filter(function (t) { return t.cb.checked; }).map(function (t) { return t.label; });
      var source = sourceInput.value.trim();
      var note = ta.value.trim();
      if (!cats.length && !note) { msg.textContent = "分類か記述のいずれかを入力してください。"; return; }
      var reports = getReports(state.subject.id);
      var report = { qid: q.id, q: q.q, cats: cats, targets: targets, source: source, note: note, ts: new Date().toISOString() };
      reports.push(report);
      setReports(state.subject.id, reports); // ローカル保存は送信の成否に関わらず必ず行う
      send.disabled = true;
      var ch = reportChannel();
      if (!ch) { msg.textContent = "この端末に保存しました。"; return; }
      msg.textContent = "送信中...";
      var subjId = state.subject.id;
      sendReportRemote(report, function (ok) {
        if (ok) {
          markReportSent(subjId, report);
          msg.textContent = "報告を送信しました。ご協力ありがとうございます。";
        } else {
          msg.textContent = "この端末に保存しました(送信は失敗。後でまとめて送信できます)。";
        }
      });
    };
    body.appendChild(send); body.appendChild(msg);
    box.appendChild(body); return box;
  }

  function sessionScore() {
    var s = state.session, ansd = 0, cor = 0, wrong = [];
    (s.answers || []).forEach(function (a, i) {
      if (!a) return; ansd++;
      if (a.correct) cor++; else wrong.push({ q: state.pool[i], leaf: state.pool[i].leaf, chosen: a.chosen, timedOut: a.timedOut });
    });
    var total = state.pool.length;
    return { answered: ansd, correct: cor, wrong: wrong, total: total, unanswered: Math.max(0, total - ansd) };
  }

  // ============ まとめて採点(レビュー) ============
  function renderReview() {
    clearTimer(); clear();
    document.body.classList.remove("has-fixedbar");
    var sc = sessionScore();
    var card = el("div", "card");
    card.appendChild(el("h1", null, "採点結果"));
    scoreBlock(card, sc);
    card.appendChild(el("h2", null, "各問の確認"));
    var list = el("div", "reviewlist");
    state.pool.forEach(function (q, i) {
      var a = state.session.answers[i];
      var item = el("div", "reviewitem");
      var head = el("div", "row gap wrap reviewhd");
      head.appendChild(el("span", "qprog", (i + 1)));
      var ok = a && a.correct;
      head.appendChild(el("span", "verdict-mini " + (a ? (ok ? "ok" : "ng") : "skip"), a ? (ok ? "正解" : (a.timedOut ? "時間切れ" : "不正解")) : "未回答"));
      head.appendChild(el("span", "pill", q.leaf));
      item.appendChild(head);
      item.appendChild(el("div", "qtext small", q.q));
      var ansIdx = currentAnsIdx(q);
      q.choices.forEach(function (t, ci) {
        var r = el("div", "revchoice");
        var lb = el("span", "clabel sm" + (ci === ansIdx ? " ok" : (a && ci === a.chosen && !ok ? " ng" : "")), LETTERS[ci]);
        r.appendChild(lb); r.appendChild(el("span", null, t));
        if (ci === ansIdx) r.appendChild(el("span", "tag-correct", "正解"));
        if (a && ci === a.chosen) r.appendChild(el("span", "tag-you", "あなた"));
        item.appendChild(r);
      });
      var exp = el("div", "expbox");
      exp.appendChild(el("div", "exphd", "解説"));
      exp.appendChild(el("div", "expbody", q.exp || ""));
      item.appendChild(exp);
      item.appendChild(renderReportForm(q));
      list.appendChild(item);
    });
    card.appendChild(list);
    doneButtons(card);
    app.appendChild(card);
  }

  // ============ 終了(1問ずつモード) ============
  function renderDone() {
    clearTimer(); clear();
    document.body.classList.remove("has-fixedbar");
    var sc = sessionScore();
    var card = el("div", "card");
    card.appendChild(el("h1", null, "おつかれさまでした"));
    if (sc.total > 0) {
      scoreBlock(card, sc);
      if (sc.answered === 0) card.appendChild(el("p", "muted", "未回答のまま終了しました。"));
      if (sc.wrong.length) {
        card.appendChild(el("h2", null, "間違えた問題(" + sc.wrong.length + ")"));
        var byLeaf = {};
        sc.wrong.forEach(function (w) { byLeaf[w.leaf] = (byLeaf[w.leaf] || 0) + 1; });
        var chips = el("div", "row gap wrap");
        Object.keys(byLeaf).sort(function (a, b) { return byLeaf[b] - byLeaf[a]; }).forEach(function (leaf) {
          chips.appendChild(el("span", "pill pill-weak", leaf + " ×" + byLeaf[leaf]));
        });
        card.appendChild(chips);
      } else if (sc.answered > 0 && sc.unanswered === 0) card.appendChild(el("p", "muted", "全問正解です。"));
    } else card.appendChild(el("p", "muted", "この条件の問題を解き終えました。"));
    doneButtons(card);
    app.appendChild(card);
  }

  function scoreBlock(card, sc) {
    var pct = sc.total ? Math.round((sc.correct / sc.total) * 100) : 0;
    var sum = el("div", "resultsum"); var big = el("div", "resultbig");
    big.appendChild(el("span", "resultpct " + (pct < 50 ? "low" : pct < 80 ? "mid" : "high"), pct + "%"));
    big.appendChild(el("span", "resultfrac", sc.correct + " / " + sc.total + " 問正解"));
    sum.appendChild(big);
    sum.appendChild(el("div", "resultanswered", "回答 " + sc.answered + " / " + sc.total + " 問" + (sc.unanswered ? "（未回答 " + sc.unanswered + " 問）" : "")));
    card.appendChild(sum);
  }
  function doneButtons(card) {
    var row = el("div", "row gap wrap donebtns");
    var again = el("button", "primary", "範囲を変えて続ける");
    again.onclick = function () { navTo({ view: "range" }); };
    var stats = el("button", "ghost", "苦手分野を見る");
    stats.onclick = function () { navTo({ view: "stats" }); };
    row.appendChild(again); row.appendChild(stats); card.appendChild(row);
  }

  // ============ 苦手分野 ============
  function computeLeafStats(subject) {
    var res = getResults(subject.id), m = {};
    Object.keys(res).forEach(function (qid) {
      var leafId = state.qLeafMap[qid]; if (!leafId) return;
      if (!m[leafId]) m[leafId] = { correct: 0, total: 0 };
      m[leafId].total += 1; if (res[qid] === "correct") m[leafId].correct += 1;
    });
    return m;
  }
  function renderStats() {
    clearTimer(); clear();
    document.body.classList.remove("has-fixedbar");
    var subject = state.subject || (window.QuizBank && window.QuizBank.subjects()[0]);
    if (!subject) { renderSubjects(); return; }
    if (subject !== state.subject) initSubject(subject);
    var ls = computeLeafStats(subject);
    var rows = Object.keys(ls).map(function (leafId) {
      var o = ls[leafId], info = state.leafInfo[leafId] || { name: leafId, unitName: "" };
      return { name: info.name, unit: info.unitName, correct: o.correct, total: o.total, rate: o.total ? o.correct / o.total : 0 };
    });
    rows.sort(function (a, b) { return a.rate - b.rate || b.total - a.total; });

    var card = el("div", "card");
    card.appendChild(el("h1", null, subject.name + "：苦手分野"));
    card.appendChild(el("p", "muted", "リーフ(小分類)単位の正答率。各問の最新の結果で集計し、低い順に表示します。"));
    if (!rows.length) card.appendChild(el("p", "muted", "まだ記録がありません。問題を解くとここに集計されます。"));
    else {
      var table = el("div", "stattable");
      rows.forEach(function (r) {
        var line = el("div", "statrow"); var pct = Math.round(r.rate * 100);
        var lab = el("span", "stleaf");
        lab.appendChild(el("span", "stleaf-name", r.name));
        if (r.unit) lab.appendChild(el("span", "stleaf-unit", r.unit));
        line.appendChild(lab);
        var bar = el("div", "stbar"); var fill = el("div", "stfill " + (pct < 50 ? "low" : pct < 80 ? "mid" : "high"));
        fill.style.width = pct + "%"; bar.appendChild(fill); line.appendChild(bar);
        line.appendChild(el("span", "stpct", pct + "% (" + r.correct + "/" + r.total + ")"));
        table.appendChild(line);
      });
      card.appendChild(table);
    }
    var reports = getReports(subject.id);
    var tools = el("div", "row gap wrap toolrow");
    var exp = el("button", "mini", "報告を書き出す(" + reports.length + ")");
    exp.disabled = !reports.length;
    exp.onclick = function () { downloadJSON(subject.id + "_reports.json", reports); };
    tools.appendChild(exp);
    if (reportChannel()) {
      var unsent = reports.filter(function (r) { return r.sent !== true; });
      var sendBtn = el("button", "mini", "未送信の報告を送信(" + unsent.length + ")");
      sendBtn.disabled = !unsent.length;
      sendBtn.onclick = function () {
        sendBtn.disabled = true;
        var okN = 0, ngN = 0, subjId = subject.id;
        (function sendNext(i) {
          if (i >= unsent.length) {
            alert("送信完了: 成功 " + okN + " 件 / 失敗 " + ngN + " 件");
            renderStats();
            return;
          }
          sendBtn.textContent = "送信中...(" + (i + 1) + "/" + unsent.length + ")";
          sendReportRemote(unsent[i], function (ok) {
            if (ok) { okN++; markReportSent(subjId, unsent[i]); } else { ngN++; }
            sendNext(i + 1);
          });
        })(0);
      };
      tools.appendChild(sendBtn);
    }
    var resetStats = el("button", "mini danger", "全成績をリセット");
    resetStats.onclick = function () {
      if (confirm("この科目の成績(正答率・回答状況)を全て消去します。報告内容は消えません。よろしいですか？")) {
        setResults(subject.id, {}); setChoices(subject.id, {}); renderStats();
      }
    };
    tools.appendChild(resetStats); card.appendChild(tools);

    card.appendChild(renderRevivalCodeCard(subject));

    var back = el("button", "ghost", "← 範囲選択へ");
    back.onclick = function () { navTo({ view: "range" }); };
    card.appendChild(back); app.appendChild(card);
  }

  // ============ 進捗復元コード(「ふっかつのじゅもん」型) ============
  // localStorageの回答データ(results×choices)から復元コードを生成/取り込みするUI。
  // エンコード/デコードの実処理は assets/revival-code.js (window.RevivalCode) に分離。
  function extractAnsweredEntries(subjId) {
    var res = getResults(subjId), choices = getChoices(subjId);
    var entries = [];
    Object.keys(res).forEach(function (qid) {
      var ci = choices[qid];
      if (ci == null) return; // 選択肢が記録されていない(タイムアウト・旧データ等)は対象外
      var idNum = parseInt(qid, 10);
      if (!isFinite(idNum) || idNum < 0 || idNum > 0xFFFF) return;
      if (ci < 0 || ci > 4) return;
      entries.push({ id: idNum, choiceIndex: ci });
    });
    return entries;
  }

  function renderRevivalCodeCard(subject) {
    var wrap = el("div", "revivalbox");
    wrap.appendChild(el("h2", null, "進捗コード"));
    wrap.appendChild(el("p", "muted small",
      "この端末の回答記録を短いコードにして、別の端末に持ち運べます。localStorageは端末間で共有されないための機能です。"));

    if (!window.RevivalCode) {
      wrap.appendChild(el("p", "warn small", "進捗コード機能を読み込めませんでした(assets/revival-code.js)。"));
      return wrap;
    }

    // ---- コードを表示 ----
    var showSec = el("div", "revivalsec");
    var showBtn = el("button", "mini", "コードを表示");
    var showOut = el("div", "revivalout hidden");
    var showBox = el("textarea", "revivalcode");
    showBox.readOnly = true; showBox.rows = 3;
    var showRow = el("div", "row gap wrap");
    var copyBtn = el("button", "mini", "コピー");
    var showMsg = el("span", "muted small");
    showRow.appendChild(copyBtn); showRow.appendChild(showMsg);
    showOut.appendChild(showBox); showOut.appendChild(showRow);
    showBtn.onclick = function () {
      var entries = extractAnsweredEntries(subject.id);
      var code = window.RevivalCode.encode(entries);
      showBox.value = code;
      showOut.classList.remove("hidden");
      showMsg.textContent = entries.length + "問ぶんのコードを生成しました。";
      state.revivalCodeShown = true; // 表示した=離脱警告の対象から外す
    };
    copyBtn.onclick = function () {
      var text = showBox.value;
      if (!text) return;
      var done = function () { showMsg.textContent = "コピーしました。"; };
      var fail = function () { showBox.select(); showMsg.textContent = "自動コピーに失敗しました。選択状態にしたので手動でコピーしてください。"; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        try { showBox.select(); document.execCommand("copy"); done(); } catch (e) { fail(); }
      }
    };
    showSec.appendChild(showBtn); showSec.appendChild(showOut);
    wrap.appendChild(showSec);

    // ---- コードを取り込む ----
    var loadSec = el("div", "revivalsec");
    var loadLabel = el("div", "muted small", "他の端末で表示したコードを貼り付けて取り込む:");
    var loadInput = el("textarea", "revivalcode"); loadInput.rows = 2;
    loadInput.placeholder = "例: a1B2c-D3e4f-...";
    var loadBtn = el("button", "mini", "取り込む");
    var loadOut = el("div", "revivalpreview hidden");
    loadSec.appendChild(loadLabel); loadSec.appendChild(loadInput); loadSec.appendChild(loadBtn); loadSec.appendChild(loadOut);
    wrap.appendChild(loadSec);

    loadBtn.onclick = function () {
      loadOut.innerHTML = ""; loadOut.classList.remove("hidden");
      var res = window.RevivalCode.decode(loadInput.value);
      if (!res.ok) {
        loadOut.appendChild(el("p", "warn small", "コードが壊れているか、書き間違いがあるようです。(" + res.error + ")"));
        return;
      }
      if (!res.entries.length) {
        loadOut.appendChild(el("p", "muted small", "このコードには回答データが含まれていません(0問)。"));
        return;
      }
      // 現在の科目の問題IDと突き合わせてプレビューを作る
      var qsById = {};
      state.flatQuestions.forEach(function (q) { qsById[q.id] = q; });
      var existing = getResults(subject.id);
      var known = 0, unknown = 0, overlap = 0, fresh = 0;
      res.entries.forEach(function (e) {
        if (!qsById[e.id]) { unknown++; return; }
        known++;
        if (existing.hasOwnProperty(String(e.id)) || existing.hasOwnProperty(e.id)) overlap++; else fresh++;
      });
      loadOut.appendChild(el("p", "small",
        "このコードには " + res.entries.length + " 問ぶんの回答が含まれています。" +
        "うち現在の科目「" + subject.name + "」に該当するのは " + known + " 問" +
        (unknown ? "(" + unknown + "問は該当する問題が見つからないため無視されます)" : "") + "。" +
        "新規 " + fresh + " 問 / 既存の回答と重複 " + overlap + " 問。"));

      if (known === 0) {
        loadOut.appendChild(el("p", "muted small", "取り込める問題がありません。"));
        return;
      }

      var modeWrap = el("div", "col gap");
      var modeGroupNodes = [];
      var modeKeep = mkRadioChip("revival-mode", "既存の回答を優先する(重複分はスキップ)", true, modeGroupNodes);
      var modeOverwrite = mkRadioChip("revival-mode", "取り込み側を優先する(重複分は上書き)", false, modeGroupNodes);
      modeWrap.appendChild(modeKeep.label); modeWrap.appendChild(modeOverwrite.label);
      loadOut.appendChild(modeWrap);

      var applyBtn = el("button", "primary mini", "この内容で取り込む");
      var applyRow = el("div", "row gap wrap"); applyRow.appendChild(applyBtn);
      loadOut.appendChild(applyRow);

      applyBtn.onclick = function () {
        var mode = modeOverwrite.input.checked ? "overwrite" : "keep";
        var results = getResults(subject.id);
        var choices = getChoices(subject.id);
        var applied = 0, skipped = 0;
        res.entries.forEach(function (e) {
          var q = qsById[e.id];
          if (!q) { skipped++; return; }
          var already = results.hasOwnProperty(String(e.id)) || results.hasOwnProperty(e.id);
          if (already && mode === "keep") { skipped++; return; }
          var correct = e.choiceIndex === currentAnsIdx(q);
          results[q.id] = correct ? "correct" : "wrong";
          choices[q.id] = e.choiceIndex;
          applied++;
        });
        setResults(subject.id, results);
        setChoices(subject.id, choices);
        applyBtn.disabled = true;
        // renderStats()は画面全体を再描画するため、直前にtextContentへ書いても即座に消えてしまう。
        // 既存の送信完了通知(sendBtn)と同様にalertで確実に結果を伝えてから再描画する。
        alert("取り込みが完了しました: " + applied + "問を取り込みました(" + skipped + "問はスキップ)。");
        renderStats();
      };
    };

    wrap.appendChild(el("p", "muted small revivalnote",
      "※ このコードは本人確認のためのものではなく、自己申告レベルの識別に過ぎません。" +
      "コードの内容は工夫すれば書き換えることも可能です。試験の記録や成績証明としては使わないでください。"));
    return wrap;
  }

  // ラジオ入力1つ分(chip見た目)を作る。同じgroupNodes配列を共有するもの同士で
  // 選択時に .picked クラスを排他的に切り替える。
  function mkRadioChip(name, label, checked, groupNodes) {
    var lab = el("label", "chip radio" + (checked ? " picked" : ""));
    var r = document.createElement("input"); r.type = "radio"; r.name = name; r.checked = checked;
    r.onchange = function () {
      groupNodes.forEach(function (n) { n.classList.toggle("picked", n === lab); });
    };
    lab.appendChild(r); lab.appendChild(el("span", null, label));
    groupNodes.push(lab);
    return { label: lab, input: r };
  }

  function downloadJSON(name, obj) {
    try {
      var blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a"); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { alert("書き出しに失敗しました。"); }
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ---------- 離脱警告(進捗コードを未取得のまま閉じようとした場合) ----------
  // 対象: 1問以上回答済み(いずれかの科目) かつ このページ訪問中に一度も「コードを表示」していない。
  // 表示文言はブラウザ標準のものになり、カスタマイズはできない(モダンブラウザの仕様)。
  function hasAnyAnsweredQuestion() {
    if (!window.QuizBank || !window.QuizBank.subjects) return false;
    return window.QuizBank.subjects().some(function (s) {
      return Object.keys(getResults(s.id)).length > 0;
    });
  }
  window.addEventListener("beforeunload", function (e) {
    if (state.revivalCodeShown) return;
    if (!hasAnyAnsweredQuestion()) return;
    e.preventDefault();
    e.returnValue = "";
  });

  // ---------- ナビ(トップバー) ----------
  var navHome = document.getElementById("nav-home");
  var navStats = document.getElementById("nav-stats");
  var navBack = document.getElementById("nav-back");
  var navForward = document.getElementById("nav-forward");
  if (navHome) navHome.onclick = function () { navTo({ view: "subjects" }); };
  if (navStats) navStats.onclick = function () { navTo({ view: "stats" }); };
  if (navBack) navBack.onclick = back;
  if (navForward) navForward.onclick = forward;

  navTo({ view: "subjects" });
  window.__quizApp = { state: state, navTo: navTo, back: back, forward: forward };
})();
