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
