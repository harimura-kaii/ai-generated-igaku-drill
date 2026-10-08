// 科目(subject) → 単元(unit) → 分類ツリー(nodes) → リーフ の登録レジストリ。
//
// 科目 = 解剖生理 など(将来: 薬理 等)。範囲選択は科目内で単元を横断できる。
// 単元 = 神経系・循環器系 など(旧「系統」)。1つの単元が taxonomy(または nodes)と questions を持つ。
// リーフ = 出題・苦手集計の最小単位。id は科目内で一意("<unitId>::<リーフ名>")。
//
// 登録方法:
//   window.QuizBank.registerUnit("anatomy", { id, name, order, taxonomy|nodes, questions })
//   後方互換: window.QuizBank.register(unit) は unit.subject||"anatomy" に登録する。
window.QuizBank = (function () {
  var SUBJECT_META = {
    anatomy: { name: "解剖生理", order: 1 },
  };
  var subjects = {}; // id -> {id,name,order,units:[]}

  function ensureSubject(id) {
    if (!subjects[id]) {
      var meta = SUBJECT_META[id] || { name: id, order: 99 };
      subjects[id] = { id: id, name: meta.name, order: meta.order, units: [] };
    }
    return subjects[id];
  }

  // legacy taxonomy([{c1,groups:[{c2,leaves:[名]}]}]) を再帰nodesへ正規化
  function toNodes(unit) {
    if (unit.nodes) return unit.nodes;
    if (unit.taxonomy) {
      return unit.taxonomy.map(function (c1) {
        return {
          name: c1.c1,
          children: (c1.groups || []).map(function (c2) {
            return {
              name: c2.c2,
              children: (c2.leaves || []).map(function (nm) {
                return { name: nm, leaf: unit.id + "::" + nm };
              }),
            };
          }),
        };
      });
    }
    return [];
  }

  return {
    registerUnit: function (subjectId, unit) {
      var subj = ensureSubject(subjectId);
      unit.nodes = toNodes(unit);
      // 遅延読み込み(2026-10〜): unit.qindex = { リーフ名: [[問題番号...], "正解の番号を並べた文字列", 本文ファイルの番号] } と
      // unit.chunkBase(本文ファイルの置き場)を持つ単元は、最初は番号・リーフ・正解だけの軽い控えを作る。
      // 本文(設問・選択肢・解説)はリーフごとの小さなファイルに分かれていて、出題を始めるときに
      // ensureLoaded() が必要なぶんだけ読み込み、fill() が控えに書き足す。
      if (unit.qindex && !unit.questions) {
        var stubs = [];
        Object.keys(unit.qindex).forEach(function (leaf) {
          var e = unit.qindex[leaf], ids = e[0], ans = e[1], src = unit.chunkBase + e[2] + ".js?v=" + e[3];
          ids.forEach(function (id, k) { stubs.push({ id: id, leaf: leaf, ans: +ans.charAt(k), _src: src }); });
        });
        unit.questions = stubs;
      }
      var counts = {};
      (unit.questions || []).forEach(function (q) {
        counts[q.leaf] = (counts[q.leaf] || 0) + 1;
      });
      unit._counts = counts;        // リーフ名 -> 問題数
      unit._total = (unit.questions || []).length;
      subj.units.push(unit);
      function ord(u) { return (u.order == null ? 99 : u.order); }
      subj.units.sort(function (a, b) { return ord(a) - ord(b); });
    },
    register: function (unit) {
      this.registerUnit(unit.subject || "anatomy", unit);
    },
    subjects: function () {
      return Object.keys(subjects)
        .map(function (k) { return subjects[k]; })
        .sort(function (a, b) { return a.order - b.order; });
    },
    getSubject: function (id) { return subjects[id]; },

    // ---- 遅延読み込み ----
    // 本文ファイル(data/q/<単元>-<番号>.js)が呼ぶ。控えのオブジェクトに本文を書き足す(参照は変えない)。
    fill: function (unitId, questions) {
      var unit = this.get(unitId);
      if (!unit) return;
      var byId = {};
      unit.questions.forEach(function (q) { byId[q.id] = q; });
      questions.forEach(function (q) {
        var t = byId[q.id];
        if (!t) return;
        for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) t[k] = q[k];
      });
    },
    // 渡した問題のうち、本文が未読み込みのものがあれば、その本文ファイルを読み込む。
    // 全部そろったら done()、読み込めないファイルがあれば fail()。
    ensureLoaded: function (questions, done, fail) {
      var srcs = [], pending = 0, failed = false;
      questions.forEach(function (q) {
        if (q.q === undefined && q._src && srcs.indexOf(q._src) < 0) srcs.push(q._src);
      });
      function settle() {
        if (failed || pending > 0) return;
        if (questions.some(function (q) { return q.q === undefined; })) { failed = true; if (fail) fail(); return; }
        done();
      }
      srcs.forEach(function (src) {
        pending++;
        var s = document.createElement("script");
        s.src = src;
        s.onload = function () { pending--; settle(); };
        s.onerror = function () {
          pending--;
          if (s.parentNode) s.parentNode.removeChild(s);
          if (!failed) { failed = true; if (fail) fail(); }
        };
        document.head.appendChild(s);
      });
      settle();
    },

    // ---- 後方互換(旧API) ----
    all: function () { var s = this.subjects()[0]; return s ? s.units : []; },
    get: function (id) {
      for (var k in subjects) {
        var u = subjects[k].units.filter(function (x) { return x.id === id; })[0];
        if (u) return u;
      }
      return null;
    },
  };
})();
