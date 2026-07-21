// 悪問報告の送信先設定(任意)。
//
// 既定は null = 送信なし(従来どおり、この端末の localStorage にのみ保存)。
// 公開運用で報告を運営者に届けたい場合、このファイルを編集して
// window.REPORT_CHANNEL に以下のいずれかの形のオブジェクトを設定する。
// (このファイル自体が存在しない/読み込みに失敗しても、アプリは従来どおり動作する)
//
// 詳しい設定手順はリポジトリのREADMEを参照。
//
// ---- 方式1: Googleフォーム(サーバ不要・推奨) ----
// window.REPORT_CHANNEL = {
//   type: "google-form",
//   action: "https://docs.google.com/forms/d/e/<フォームID>/formResponse",
//   fields: {
//     qid:  "entry.111111111", // 問題ID
//     q:    "entry.222222222", // 設問文
//     cats: "entry.333333333", // 分類(選択された分類を " / " で連結した文字列)
//     note: "entry.444444444"  // 自由記述
//   }
// };
//
// ---- 方式2: 自前サーバへJSON POST ----
// window.REPORT_CHANNEL = {
//   type: "http",
//   url: "https://example.com/api/reports"
// };

window.REPORT_CHANNEL = {
  type: "google-form",
  action: "https://docs.google.com/forms/d/e/1FAIpQLSfjcC1EnguEIRiPtNzlNV3c0WctY3xYHoDGJI4i_fEQpcrB1w/formResponse",
  fields: {
    qid:  "entry.279291089",  // 問題ID
    q:    "entry.2125470673", // 設問
    cats: "entry.1601832371", // 分類(該当箇所を含む)
    note: "entry.19150715"    // 自由記述(出典を含む)
  }
};
