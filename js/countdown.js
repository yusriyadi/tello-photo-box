import { wait } from "./utils.js";

export async function runCountdown(element, startFrom = 3, onTick = null) {
  element.classList.remove("is-hidden");

  for (let value = startFrom; value >= 1; value -= 1) {
    element.textContent = String(value);
    if (onTick) {
      onTick(value);
    }
    await wait(1000);
  }

  element.textContent = "Go";
  await wait(450);
  element.classList.add("is-hidden");
}
