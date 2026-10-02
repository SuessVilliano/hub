// Emergency compatibility shim for the current production bundle.
// Remove after the corrected script.js is confirmed deployed.
if (typeof Element !== "undefined" && !Element.prototype.forEach) {
  Object.defineProperty(Element.prototype, "forEach", {
    value: function(callback, thisArg) { callback.call(thisArg, this, 0, [this]); },
    configurable: true,
    writable: true
  });
}

// Applied Innovations Hub — HighLevel production integration
window.AIH_HIGHLEVEL = {
  bookingUrl: "https://api.leadconnectorhq.com/widget/booking/fXIMmcl2IcRjvFLvsRsN",
  clientPortalUrl: "https://portal.appliedinnovationshub.com/",
  locationId: "thcdjhHs4LK5wMuaybU6",
  chatWidgetId: "6abed893f1b243568ac766d8",
  projectFormUrl: "",
  interestFormUrl: "",
  useNativeChat: true
};
