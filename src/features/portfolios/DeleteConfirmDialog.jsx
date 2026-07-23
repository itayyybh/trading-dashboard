import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { C, space } from "../../ui/theme";

// Calm, intentional confirmation shown only when a portfolio actually holds
// trades (empty ones delete straight away). Because deletion is a soft delete,
// the tone is reassuring, not alarming: it goes to Recently Deleted and can be
// restored. `mode` switches copy between the soft delete and the irreversible
// "delete forever" from the trash.
export default function DeleteConfirmDialog({ portfolio, tradeCount, mode = "soft", onConfirm, onClose }) {
  const [pending, setPending] = useState(false);
  const forever = mode === "forever";

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
    } catch (e) {
      setPending(false);
      throw e;
    }
  }

  return (
    <Modal width={440} onClose={onClose} labelledBy="portfolio-delete-title">
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: space.lg }}>
        <div>
          <h2 id="portfolio-delete-title" style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            {forever ? "Delete forever?" : "Delete this portfolio?"}
          </h2>
          <p style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.6, margin: "10px 0 0" }}>
            {forever ? (
              <>
                <Strong>{portfolio.name}</Strong> and its {tradeCount === 1 ? "1 trade" : `${tradeCount} trades`} will be
                permanently deleted. This can’t be undone.
              </>
            ) : (
              <>
                <Strong>{portfolio.name}</Strong> holds{" "}
                <Strong>{tradeCount === 1 ? "1 trade" : `${tradeCount} trades`}</Strong>. It and its analytics will move
                to Recently Deleted, where you can restore it anytime.
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirm} disabled={pending}>
            {pending ? "…" : forever ? "Delete forever" : "Move to Recently Deleted"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Strong({ children }) {
  return <span style={{ color: C.text, fontWeight: 700 }}>{children}</span>;
}
