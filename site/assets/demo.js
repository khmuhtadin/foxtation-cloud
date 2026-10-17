// Hold-to-dictate replay in the hero, and the Copy buttons. Nothing is recorded.

const examples = [
  {
    app: "Slack · #ops",
    target: "Slack",
    lang: "id",
    heard: "eh jadi besok meeting jam tiga, eh maksudnya jam empat, di kantor ya",
    cut: [0, 4, 5, 6, 7],
    typed: "Jadi besok meeting jam 4, di kantor ya.",
  },
  {
    app: "Mail · Re: launch",
    target: "Mail",
    lang: "en",
    heard: "um so I think we should uh ship it on monday, no wait, tuesday",
    cut: [0, 6, 10, 11, 12],
    typed: "So I think we should ship it on Tuesday.",
  },
];

const $ = (id) => document.getElementById(id);
const pill = $("demo-pill");
const label = $("demo-label");
const meta = $("demo-meta");
const typed = $("demo-typed");
const heard = $("demo-heard");
const hold = $("demo-hold");

let next = 1;
let state = "pasted";
let example, words, shown, started, timer;

// Lays out every word up front, hidden, so the caption keeps its height while
// words appear. Runs of cut words share one <del> so the strike is unbroken.
function layOutHeard() {
  heard.textContent = "";
  heard.removeAttribute("data-cut");
  heard.lang = example.lang;
  const spans = [];
  let del = null;
  example.heard.split(" ").forEach((word, i) => {
    const cut = example.cut.includes(i);
    if (!cut) del = null;
    if (i) (del ?? heard).append(" ");
    if (cut && !del) del = heard.appendChild(document.createElement("del"));
    const span = document.createElement("span");
    span.textContent = word;
    span.style.visibility = "hidden";
    (del ?? heard).append(span);
    spans.push(span);
  });
  return spans;
}

function start() {
  if (state !== "pasted") return;
  state = "listening";
  example = examples[next];
  next = (next + 1) % examples.length;
  words = layOutHeard();
  shown = 0;
  started = Date.now();

  $("demo-app").textContent = example.app;
  typed.textContent = "";
  typed.lang = example.lang;
  pill.dataset.state = "listening";
  label.textContent = "Listening";
  meta.textContent = "0:00";
  hold.dataset.held = "";
  timer = setInterval(tick, 100);
}

function tick() {
  const seconds = Math.floor((Date.now() - started) / 1000);
  meta.textContent = "0:" + String(seconds).padStart(2, "0");
  // A word about every quarter second, like someone talking.
  while (shown < words.length && shown < (Date.now() - started) / 260) {
    words[shown++].style.visibility = "";
  }
}

function stop() {
  if (state !== "listening") return;
  state = "cleaning";
  clearInterval(timer);
  delete hold.dataset.held;
  // Let go early and the replay still finishes the sentence.
  for (const word of words) word.style.visibility = "";
  pill.dataset.state = "cleaning";
  label.textContent = "Cleaning up for";
  meta.textContent = example.target;

  setTimeout(() => {
    heard.dataset.cut = "";
    typed.textContent = example.typed;
    pill.dataset.state = "pasted";
    label.textContent = "Pasted";
    meta.textContent = "· " + example.typed.split(" ").length + " words";
    state = "pasted";
  }, 500);
}

hold.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  hold.setPointerCapture(e.pointerId);
  start();
});
hold.addEventListener("pointerup", stop);
hold.addEventListener("pointercancel", stop);
hold.addEventListener("contextmenu", (e) => e.preventDefault());
hold.addEventListener("keydown", (e) => {
  if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); }
});
hold.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "Enter") stop();
});

// The real shortcut: right Option.
addEventListener("keydown", (e) => { if (e.code === "AltRight" && !e.repeat) start(); });
addEventListener("keyup", (e) => { if (e.code === "AltRight") stop(); });
addEventListener("blur", stop);

const copyStatus = $("copy-status");
for (const button of document.querySelectorAll(".copy")) {
  let reset;
  button.addEventListener("click", async () => {
    const code = button.previousElementSibling;
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = "Copied";
      copyStatus.textContent = "Copied to the clipboard.";
    } catch {
      // No clipboard access: select the command so ⌘C works.
      getSelection().selectAllChildren(code);
      button.textContent = "Selected";
      copyStatus.textContent = "Selected. Press Command-C to copy.";
    }
    clearTimeout(reset);
    reset = setTimeout(() => {
      button.textContent = "Copy";
      copyStatus.textContent = "";
    }, 1500);
  });
}
