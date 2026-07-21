/* 入場ゲート(注意喚起モーダル)。
 * 1セッションに1回(sessionStorage管理)、4ページ順送りの全画面確認画面を表示する。
 * タブを閉じて開き直すと再表示、アプリ内の画面遷移(navTo等)では再表示しない。
 * 依存ライブラリなし。既存app.jsとは独立して動作する(app.jsのDOM描画より先に読み込む想定)。
 *
 * UI方針(2026-07-19 コーディネーター指示による。2回の追加指示を反映済み):
 * - モーダルカードではなく画面全体を覆う全画面表示。
 * - 各ページの見出し(内部管理用ラベル)は画面に出さない。本文テキストのみを主役として中央表示。
 * - 本文がフェードイン→静止→フェードアウトしてから次ページへ(映画の著作権表示風の間合い)。
 * - ページを飛ばして進めるショートカットは作らない。ESC等での離脱も不可。
 * - 【2回目の指示】背景は黒ではなく既存UIの配色(var(--bg))に馴染む色。
 *   ボタンは演出的な中央配置ではなく画面右下に固定・色は既存primaryボタンと同じ青系。
 */
(function () {
  "use strict";

  var SS_KEY = "qb3:entrygate:seen";
  var FADE_IN_MS = 700;
  var FADE_OUT_MS = 500;
  var GAP_MS = 220; // フェードアウト後、次ページのフェードインまでの暗転の間

  // title は内部管理用のラベル(画面には出さない。コード上の目印としてのみ使う)。
  // kind:"title" のページだけは例外で、body をサイトタイトルとして大きく表示する。
  var PAGES = [
    {
      title: "タイトル表示",
      kind: "title",
      body: "医学の基礎問ドリル", // ロゴが読めない環境向けのaria-label兼フォールバック
      sub: "デモ版",
      cta: "はじめに"
    },
    {
      title: "これは何か",
      body: "このサイトは、個人が学習のために作った非公式のデモ版です。教育機関・医療機関とは一切関係ありません。",
      cta: "確認した"
    },
    {
      title: "中身はAIが作っています",
      body: "問題も解説もAIが作成しており、誤りが必ず含まれます。正確性は保証しません。学ぶときは必ず教科書や公的資料で裏を取ってください。",
      cta: "確認した"
    },
    {
      title: "医療判断には使わないでください",
      body: "医療行為・診断・治療・服薬などの判断には、絶対に使用しないでください。本サイトは医学的な助言を提供するものではありません。",
      cta: "確認した",
      emphasize: true
    },
    {
      title: "このサイトの使い方 とおことわり",
      body: "「この問題はおかしい」と思ったら、ぜひ報告してください——指摘で良くなっていくのがこのサイトの本体です。国家試験の傾向や合否については何も保証しません。予告なく内容の変更・公開停止をすることがあります。",
      cta: "はじめる"
    }
  ];

  function alreadySeen() {
    try { return sessionStorage.getItem(SS_KEY) === "1"; } catch (e) { return false; }
  }
  function markSeen() {
    try { sessionStorage.setItem(SS_KEY, "1"); } catch (e) { /* ストレージ不可でも致命的ではない */ }
  }

  function show() {
    var idx = 0;
    var transitioning = false;
    var pendingTimers = [];

    function setTimer(fn, ms) {
      var id = setTimeout(fn, ms);
      pendingTimers.push(id);
      return id;
    }
    function clearTimers() {
      pendingTimers.forEach(function (id) { clearTimeout(id); });
      pendingTimers = [];
    }

    var overlay = document.createElement("div");
    overlay.className = "entrygate-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "ご利用にあたっての注意事項");
    // 背景クリックでは閉じない(飛ばして最後まで進めるショートカットを作らない)

    // stage: 本文+ドット(中央)。btn: 画面右下固定(実用的なUIとして演出配置から分離)。
    // 両者を同じフェードクラスで揃えて開閉させる。
    var stage = document.createElement("div");
    stage.className = "entrygate-stage";
    overlay.appendChild(stage);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "entrygate-btn";
    overlay.appendChild(btn);

    function render(i) {
      var p = PAGES[i];
      while (stage.firstChild) stage.removeChild(stage.firstChild);
      stage.classList.remove("entrygate-fadeout");
      btn.classList.remove("entrygate-fadeout");

      var dots = document.createElement("div");
      dots.className = "entrygate-dots";
      dots.setAttribute("aria-hidden", "true");
      PAGES.forEach(function (_, di) {
        var d = document.createElement("span");
        d.className = "entrygate-dot" + (di === i ? " active" : "");
        dots.appendChild(d);
      });
      stage.appendChild(dots);

      if (p.kind === "title") {
        // タイトルページ: ロゴ(シンボル+ワードマーク)を大きく出し、下に副題(デモ版)を添える。
        // SVGはindex.htmlのヘッダーロゴと同じ意匠(青タイル+チェック+土台バー / 助詞「の」を小さく半透明)。
        var logo = document.createElement("div");
        logo.className = "entrygate-logo";
        logo.setAttribute("role", "img");
        logo.setAttribute("aria-label", p.body);
        logo.innerHTML =
          '<svg viewBox="0 0 250 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<g transform="translate(0 3) scale(1)">' +
              '<rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="#2563eb"/>' +
              '<path d="M12 18.5 L18 24.5 L30 12" fill="none" stroke="#fff" stroke-width="4.2" ' +
                'stroke-linecap="round" stroke-linejoin="round"/>' +
              '<rect x="10" y="29" width="20" height="3" rx="1.5" fill="#fff" opacity="0.92"/>' +
            '</g>' +
            '<text x="50" y="23" font-family="\'Hiragino Kaku Gothic ProN\',\'Yu Gothic\',\'YuGothic\',' +
              '\'Meiryo\',\'Noto Sans JP\',sans-serif" font-size="26" font-weight="700" ' +
              'letter-spacing="0.5" fill="currentColor" dominant-baseline="central">' +
              '<tspan>医学</tspan><tspan font-size="17" fill-opacity="0.45">の</tspan>' +
              '<tspan font-size="26">基礎問ドリル</tspan>' +
            '</text>' +
          '</svg>';
        stage.appendChild(logo);
        if (p.sub) {
          var s = document.createElement("div");
          s.className = "entrygate-sitesub";
          s.textContent = p.sub;
          stage.appendChild(s);
        }
      } else {
        var b = document.createElement("p");
        b.className = "entrygate-text" + (p.emphasize ? " entrygate-emphasis" : "");
        b.textContent = p.body;
        stage.appendChild(b);
      }

      btn.textContent = p.cta;
      btn.disabled = false;
      btn.onclick = function () { advance(); };

      // フェードイン開始前は不可視状態を即座に確定させ(ちらつき防止のためinlineでopacity:0)、
      // 実際のアニメーション開始はsetTimeoutで次のタスクまで遅延させる。
      // 理由: 生成直後でまだ一度も描画されていない要素に対して、DOM挿入と同一の同期処理内で
      // アニメーションクラスを付けても、ブラウザが「アニメーション前の状態」を一度も描画しないまま
      // 最終状態へ飛ばすことがある(初回描画=1ページ目で発生していた不具合)。setTimeoutで
      // 新しいタスクへ切り離すことで、2ページ目以降と同じ描画パイプラインを経由させる。
      // ※requestAnimationFrameはバックグラウンドタブで完全に停止しうるため使わない
      // (setTimeoutは既存のsetTimer経由で管理し、バックグラウンドでもいずれ発火する)。
      stage.classList.remove("entrygate-fadein");
      btn.classList.remove("entrygate-fadein");
      stage.style.opacity = "0";
      btn.style.opacity = "0";
      setTimer(function () {
        stage.style.opacity = "";
        btn.style.opacity = "";
        void stage.offsetWidth;
        stage.classList.add("entrygate-fadein");
        btn.classList.add("entrygate-fadein");
      }, 20);

      setTimer(function () { btn.focus(); }, 0);
      transitioning = false;
    }

    function advance() {
      if (transitioning) return; // フェード中の二重クリックによる状態破壊を防ぐ
      transitioning = true;
      btn.disabled = true;

      stage.classList.remove("entrygate-fadein");
      stage.classList.add("entrygate-fadeout");
      btn.classList.remove("entrygate-fadein");
      btn.classList.add("entrygate-fadeout");

      setTimer(function () {
        if (idx + 1 >= PAGES.length) {
          close();
        } else {
          idx++;
          setTimer(function () { render(idx); }, GAP_MS);
        }
      }, FADE_OUT_MS);
    }

    function trapKeydown(e) {
      // モーダル表示中は背景操作(Escでの離脱・Tabでの背景フォーカス移動)を無効化する。
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); return; }
      if (e.key === "Tab") {
        var focusables = overlay.querySelectorAll("button, [href], input, select, textarea, [tabindex]");
        if (!focusables.length) return;
        e.preventDefault();
        focusables[0].focus();
      }
    }

    function close() {
      markSeen();
      clearTimers();
      document.removeEventListener("keydown", trapKeydown, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.classList.remove("entrygate-lock");
    }

    document.addEventListener("keydown", trapKeydown, true);
    document.body.classList.add("entrygate-lock");
    document.body.appendChild(overlay);
    render(idx);
  }

  function init() {
    if (alreadySeen()) return;
    show();
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);

  // テスト/デバッグ用フック
  window.__entryGate = {
    reset: function () { try { sessionStorage.removeItem(SS_KEY); } catch (e) {} },
    seen: alreadySeen
  };
})();
