// Hold-to-dictate replay in the hero, and the Copy buttons. Nothing is recorded.

const examples = [
  {
    app: "Slack · #ops",
    target: "Slack",
    heard: "eh jadi besok meeting jam tiga, eh maksudnya jam empat, di kantor ya",
    cut: [0, 4, 5, 6, 7],
    typed: "Jadi besok meeting jam 4, di kantor ya.",
  },
  {
    app: "Mail · Re: launch",
    target: "Mail",
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

function start() {
  if (state !== "pasted") return;
  state = "listening";
  example = examples[next];
  next = (next + 1) % examples.length;
  words = example.heard.split(" ");
  shown = 0;
  started = Date.now();

  $("demo-app").textContent = example.app;
  typed.textContent = "";
  heard.textContent = "";
  pill.dataset.state = "listening";
  label.textContent = "Listening";
  meta.textContent = "0:00";
  hold.setAttribute("aria-pressed", "true");
  timer = setInterval(tick, 100);
}

function tick() {
  const seconds = Math.floor((Date.now() - started) / 1000);
  meta.textContent = "0:" + String(seconds).padStart(2, "0");
  // A word about every quarter second, like someone talking.
  while (shown < words.length && shown < (Date.now() - started) / 260) {
    heard.textContent += (shown ? " " : "") + words[shown];
    shown++;
  }
}

function stop() {
  if (state !== "listening") return;
  state = "cleaning";
  clearInterval(timer);
  hold.setAttribute("aria-pressed", "false");
  // Let go early and the replay still finishes the sentence.
  heard.textContent = words.join(" ");
  pill.dataset.state = "cleaning";
  label.textContent = "Cleaning up for";
  meta.textContent = example.target;

  setTimeout(() => {
    heard.innerHTML = words
      .map((word, i) => (example.cut.includes(i) ? "<del>" + word + "</del>" : word))
      .join(" ");
    typed.textContent = example.typed;
    pill.dataset.state = "pasted";
    label.textContent = "Pasted";
    meta.textContent = "· " + example.typed.split(" ").length + " words";
    state = "pasted";
  }, 500);
}

hold.addEventListener("pointerdown", (e) => {
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

for (const button of document.querySelectorAll(".copy")) {
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.previousElementSibling.textContent);
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy"), 1500);
  });
}
