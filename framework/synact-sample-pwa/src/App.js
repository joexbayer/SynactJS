import { SynactJSCore } from "synactjs";

const { div, h1, p, button, useState } = SynactJSCore;

export function App() {
  const [count, setCount] = useState(0);

  return div(
    {
      style: {
        maxWidth: "480px",
        margin: "32px auto",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #cbd5e1",
        fontFamily: "system-ui, sans-serif"
      }
    },
    h1({}, "Synact PWA + Sync Scaffold"),
    p({}, "This default template includes PWA bootstrap and optional sync wiring."),
    p({}, "Update server URL/appId in src/sync-settings.js or in your own settings screen."),
    p({}, `Count: ${count}`),
    button(
      {
        onClick: () => setCount((value) => value + 1),
        style: {
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #10b981",
          background: "#10b981",
          color: "white",
          cursor: "pointer",
          marginRight: "8px"
        }
      },
      "Increment"
    ),
    button(
      {
        onClick: async () => {
          const syncFeature = window.__synactSyncFeature;
          if (!syncFeature) return;
          try {
            await syncFeature.sync({ direction: "both" });
            console.log("Manual sync complete.");
          } catch (error) {
            console.warn("Manual sync failed", error);
          }
        },
        style: {
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #0ea5e9",
          background: "#0ea5e9",
          color: "white",
          cursor: "pointer"
        }
      },
      "Manual Sync"
    )
  );
}
