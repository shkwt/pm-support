// スクロールに応じて要素をふわっと表示（要件定義書：スクロールアニメーション）
// リロードのたびに再生されると煩わしいため、同一タブでは初回表示時のみ再生する
document.addEventListener("DOMContentLoaded", function () {
  const targets = document.querySelectorAll(".reveal");

  // 2回目以降の表示（リロード・ページ内遷移）ではアニメーションせず即表示
  let alreadyPlayed = false;
  try {
    alreadyPlayed = sessionStorage.getItem("revealPlayed") === "1";
    sessionStorage.setItem("revealPlayed", "1");
  } catch (e) {
    /* プライベートモード等でsessionStorageが使えない場合は毎回再生にフォールバック */
  }

  // IntersectionObserver 非対応環境では全て表示しておく
  if (alreadyPlayed || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
});

// お問い合わせフォーム送信（Google Apps Script 経由でGmailに通知）
// GAS_URL には gas/contact-form.gs をデプロイして発行されるURLを貼り付ける
document.addEventListener("DOMContentLoaded", function () {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxLBVRBE077uh5eoqB3occ6MnzyCBG1y6BmLglZd7vNndqqex7lYhrfGZ8DcKU_gUG2/exec"; // 例: https://script.google.com/macros/s/XXXX/exec

  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.add("is-visible");
    status.classList.toggle("is-error", isError);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!GAS_URL) {
      showStatus("送信先が未設定です。恐れ入りますが、メールで直接ご連絡ください。", true);
      return;
    }

    button.disabled = true;
    button.textContent = "送信中…";
    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: new URLSearchParams(new FormData(form)),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      showStatus("送信しました。2営業日以内にご返信いたします。", false);
    } catch (err) {
      showStatus("送信に失敗しました。お手数ですが、時間をおいて再度お試しください。", true);
    } finally {
      button.disabled = false;
      button.textContent = "送信する";
    }
  });
});

// 「無料相談する」ボタンを押したら、お問い合わせフォームへ即座に移動する
document.addEventListener("DOMContentLoaded", function () {
  const contact = document.getElementById("contact");
  if (!contact) return;

  document.querySelectorAll('a[href="#contact"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      // 健康診断セクションのボタン経由なら問い合わせ種別を切り替える(メール件名で区別できる)
      const inquiryType = document.getElementById("inquiry-type");
      if (inquiryType) {
        inquiryType.value = link.closest("#checkup")
          ? "プロジェクト健康診断"
          : link.closest("#ai-pmo")
            ? "AIアシストPMOの構築"
            : "通常の無料相談";
      }
      // アニメーションなしで即ジャンプ
      contact.scrollIntoView({ behavior: "auto", block: "start" });
      history.replaceState(null, "", "#contact");
    });
  });
});
