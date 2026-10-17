// Copy buttons: put the command on the clipboard and say so for a moment.
document.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-copy]");
  if (!button) return;
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    button.dataset.done = "";
    status.textContent = "Copied to the clipboard.";
  } catch {
    status.textContent = "Couldn’t copy. Select the command and copy it yourself.";
  }
  clearTimeout(button.timer);
  button.timer = setTimeout(() => {
    delete button.dataset.done;
    status.textContent = "";
  }, 1500);
});
