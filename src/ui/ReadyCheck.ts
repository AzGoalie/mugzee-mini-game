export const createReadyCheck = (onReady: () => void) => {
  const panel = document.getElementById("ready-check")!;
  const button = document.getElementById("ready-button")!;
  panel.hidden = false;
  const onClick = () => {
    panel.hidden = true;
    button.blur();
    onReady();
  };
  button.addEventListener("click", onClick, { once: true });
  button.focus({ preventScroll: true });
  return {
    destroy: () => {
      panel.hidden = true;
      button.removeEventListener("click", onClick);
    },
  };
};
