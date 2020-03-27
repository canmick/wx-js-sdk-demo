import service from "./index.js";

export async function getSignature(url) {
  return service({
    url: "/getSignature",
    method: "post",
    data: { url }
  });
}
