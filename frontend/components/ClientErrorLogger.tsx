"use client";

import { useEffect } from "react";

export default function ClientErrorLogger() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      try {
        console.error("ClientErrorLogger: error event:", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
      } catch (e) {
        console.error("ClientErrorLogger: failed to log error event", e);
      }
    }

    function onUnhandledRejection(ev: PromiseRejectionEvent) {
      try {
        console.error("ClientErrorLogger: unhandledrejection:", ev.reason, ev);
      } catch (e) {
        console.error("ClientErrorLogger: failed to log unhandledrejection", e);
      }
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection as EventListener);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection as EventListener);
    };
  }, []);

  return null;
}
