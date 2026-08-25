/**
 * お問い合わせフォーム → Gmail 通知（Google Apps Script）
 *
 * 外部フォームサービスを使わず、自分のGoogleアカウント内で送信を完結させます。
 *
 * ■ セットアップ手順（約5分）
 * 1. https://script.google.com/ を開き、kawatashohei0101@gmail.com でログイン
 * 2. 「新しいプロジェクト」を作成し、このファイルの内容をエディタに貼り付けて保存
 * 3. 右上「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」を選択
 *    - 説明: contact-form など任意
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員
 * 4. 「デプロイ」を押し、承認画面で自分のアカウントを許可
 *    （「このアプリは確認されていません」と出たら「詳細」→「安全ではないページに移動」）
 * 5. 発行された ウェブアプリURL（https://script.google.com/macros/s/XXXX/exec）をコピーし、
 *    script.js の GAS_URL に貼り付ける
 *
 * ■ 動作確認
 * サイトをWebサーバー経由（ローカルなら http://localhost、公開後は本番URL）で開いて
 * フォームを送信すると、下記 TO_ADDRESS にメールが届きます。
 *
 * ■ コードを修正したとき
 * 「デプロイ」→「デプロイを管理」→ 鉛筆アイコン → バージョン「新バージョン」で更新
 * （URLは変わりません）
 */

var TO_ADDRESS = "kawatashohei0101@gmail.com";

function doPost(e) {
  var p = (e && e.parameter) || {};

  // ハニーポット（ボットは不可視欄を埋めてくるので黙って成功を返す）
  if (p.honey) {
    return jsonResponse_({ ok: true });
  }

  // 必須項目チェック
  var required = ["company", "address", "name", "email", "message"];
  for (var i = 0; i < required.length; i++) {
    if (!p[required[i]] || !String(p[required[i]]).trim()) {
      return jsonResponse_({ ok: false, error: "missing:" + required[i] });
    }
  }

  var inquiryType = String(p.inquiry_type || "通常の無料相談");

  var body = [
    "ホームページの無料相談フォームからお問い合わせがありました。",
    "",
    "■ ご相談種別",
    inquiryType,
    "",
    "■ 会社名",
    p.company,
    "",
    "■ 会社住所",
    p.address,
    "",
    "■ お名前",
    p.name,
    "",
    "■ メールアドレス",
    p.email,
    "",
    "■ 電話番号",
    p.tel || "（未入力）",
    "",
    "■ ご相談内容",
    p.message,
    "",
    "---",
    "受信日時: " + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm"),
  ].join("\n");

  var subjectLabel =
    inquiryType === "プロジェクト健康診断"
      ? "健康診断のご相談"
      : inquiryType === "AIアシストPMOの構築"
        ? "AIアシストPMOのご相談"
        : "無料相談のお問い合わせ";

  MailApp.sendEmail({
    to: TO_ADDRESS,
    replyTo: String(p.email),
    subject: "【ホームページ】" + subjectLabel + "（" + p.company + " " + p.name + "様）",
    body: body,
  });

  return jsonResponse_({ ok: true });
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
