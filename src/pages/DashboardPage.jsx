import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import styles from "./DashboardPage.module.css";
import { usePageSeo } from "../hooks/usePageSeo";



const DEFAULT_DATE_OPTIONS = "Coffee Date, Sunset Walk, Dinner";

export const DashboardPage = () => {
  const { token, user, logout } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [partnerName, setPartnerName] = useState("");
  const [dodgeMode, setDodgeMode] = useState("teleport");
  const [dateOptionsInput, setDateOptionsInput] = useState(DEFAULT_DATE_OPTIONS);
  const [closingNote, setClosingNote] = useState("");

  usePageSeo({
  title: "Dashboard — Your Proposals",
  description: "Create, edit, and track responses on your custom proposal links.",
  noindex: true,
  });


  const buildShareUrl = (proposal) => {
    if (proposal.shareUrl) return proposal.shareUrl;
    if (proposal.sharePath) {
      return `${window.location.origin}${proposal.sharePath}`;
    }
    if (proposal.slug && proposal.linkToken) {
      return `${window.location.origin}/p/${proposal.slug}?token=${proposal.linkToken}`;
    }
    return "";
  };

  const fetchProposals = useCallback(async () => {
    setError("");
    try {
      const data = await apiRequest("/api/proposals", { token });
      setProposals(Array.isArray(data.proposals) ? data.proposals : []);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleCreateProposal = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedPartner = partnerName.trim();
    if (!trimmedPartner) return;

    const parsedOptions = dateOptionsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const tempId = `temp-${Date.now()}`;
    const optimisticProposal = {
      _id: tempId,
      partnerName: trimmedPartner,
      dodgeMode,
      dateOptions: parsedOptions,
      closingNote: closingNote.trim(),
      status: "pending",
      isOptimistic: true,
    };

    // Optimistically add immediately and reset form inputs
    setProposals((prev) => [optimisticProposal, ...prev]);
    setPartnerName("");
    setClosingNote("");

    try {
      const data = await apiRequest("/api/proposals", {
        method: "POST",
        token,
        body: {
          partnerName: trimmedPartner,
          dodgeMode,
          dateOptions: parsedOptions,
          closingNote: optimisticProposal.closingNote,
        },
      });

      const created = {
        ...data.proposal,
        linkToken: data.linkToken,
        sharePath: data.sharePath,
      };

      setProposals((prev) =>
        prev.map((item) => (item._id === tempId ? created : item))
      );
    } catch (err) {
      // Roll back optimistic card on failure
      setProposals((prev) => prev.filter((item) => item._id !== tempId));
      setPartnerName(trimmedPartner);
      setClosingNote(optimisticProposal.closingNote);
      setError(err.message || "Could not create proposal link");
    }
  };

  const handleCopyLink = async (proposal) => {
    const url = buildShareUrl(proposal);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(proposal._id || proposal.slug);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Failed to copy link to clipboard");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <h1 className={styles.brand}>Proposal Links</h1>
          <div className={styles.userControls}>
            <span className={styles.greeting}>
              Signed in as <strong>{user?.name || user?.username || "Creator"}</strong>
            </span>
            <button type="button" onClick={logout} className={styles.logoutBtn}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>New Proposal Link</h2>
          <p className={styles.sectionSubtitle}>
            Customize the evasive button behavior and date choices for your partner.
          </p>

          <form onSubmit={handleCreateProposal} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="partnerName">
                Partner&apos;s Name
              </label>
              <input
                id="partnerName"
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Sam"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="dodgeMode">
                &ldquo;No&rdquo; Button Mode
              </label>
              <select
                id="dodgeMode"
                value={dodgeMode}
                onChange={(e) => setDodgeMode(e.target.value)}
                className={styles.select}
              >
                <option value="teleport">Teleport (jumps away)</option>
                <option value="shrink">Shrink (gets smaller)</option>
                <option value="escalate">Escalate (changes text &amp; jumps)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="dateOptions">
                Date Options
              </label>
              <input
                id="dateOptions"
                type="text"
                required
                value={dateOptionsInput}
                onChange={(e) => setDateOptionsInput(e.target.value)}
                className={styles.input}
              />
              <span className={styles.hint}>Comma-separated activities</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="closingNote">
                Closing Note (shown after Yes)
              </label>
              <textarea
                id="closingNote"
                rows={3}
                value={closingNote}
                onChange={(e) => setClosingNote(e.target.value)}
                placeholder="You just made my week!"
                className={styles.textarea}
              />
            </div>

            <button type="submit" className={styles.primaryBtn}>
              Create Proposal Link
            </button>
          </form>
        </section>

        <section>
          <div className={styles.listHeader}>
            <h2 className={styles.sectionTitle}>Your Proposals</h2>
            <button
              type="button"
              onClick={fetchProposals}
              className={styles.refreshBtn}
            >
              Refresh
            </button>
          </div>

          {error && <p className={styles.errorBanner}>{error}</p>}

          {loading ? (
            <div className={styles.emptyState}>Loading your proposals...</div>
          ) : proposals.length === 0 ? (
            <div className={styles.emptyState}>
              No proposals yet. Create your first one on the left to generate a shareable link.
            </div>
          ) : (
            <div className={styles.proposalList}>
              {proposals.map((proposal) => {
                const id = proposal._id || proposal.slug;
                const shareUrl = buildShareUrl(proposal);
                const isAccepted = proposal.status === "accepted";

                return (
                  <article
                    key={id}
                    className={`${styles.proposalCard} ${
                      proposal.isOptimistic ? styles.optimisticCard : ""
                    }`}
                  >
                    <div className={styles.proposalTop}>
                      <h3 className={styles.partnerName}>
                        For {proposal.partnerName}
                      </h3>
                      <span
                        className={`${styles.badge} ${
                          proposal.isOptimistic
                            ? styles.badgeSaving
                            : isAccepted
                              ? styles.badgeAccepted
                              : styles.badgePending
                        }`}
                      >
                        {proposal.isOptimistic
                          ? "Creating..."
                          : isAccepted
                            ? "Accepted"
                            : "Pending"}
                      </span>
                    </div>

                    <div className={styles.metaRow}>
                      <span>Mode: {proposal.dodgeMode}</span>
                      {Array.isArray(proposal.dateOptions) && (
                        <span>Options: {proposal.dateOptions.join(", ")}</span>
                      )}
                    </div>

                    {isAccepted && (
                      <div className={styles.outcomeBox}>
                        <div>
                          <strong>Chosen Date:</strong>{" "}
                          {proposal.chosenDateActivity || "Not selected yet"}
                        </div>
                        {proposal.partnerNote && (
                          <div>
                            <strong>Partner Note:</strong> {proposal.partnerNote}
                          </div>
                        )}
                      </div>
                    )}

                    {shareUrl && (
                      <div className={styles.shareBox}>
                        <span className={styles.shareUrl}>{shareUrl}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(proposal)}
                          className={styles.copyBtn}
                        >
                          {copiedId === id ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};