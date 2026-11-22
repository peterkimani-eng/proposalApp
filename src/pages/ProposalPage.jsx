import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/apiClient";
import { DodgeButton } from "../components/DodgeButton";
import { ProposalCelebration } from "./ProposalCelebration";
import styles from "./ProposalPage.module.css";
import { usePageSeo } from "../hooks/usePageSeo";


const isInvalid = status === "invalid" || status === "error";



const DODGE_TAUNTS = [
  "",
  "Oops, that button seems shy!",
  "Wrong button—try the pink one.",
  "It really doesn't want to be clicked.",
  "Resistance is futile!",
];

export const ProposalPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const linkToken = searchParams.get("token");

  // 5 states: "loading" | "invalid" | "ask" | "plan_date" | "confirmed"
  const [viewState, setViewState] = useState("loading");
  const [proposal, setProposal] = useState(null);
  const [dodgeAttempts, setDodgeAttempts] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [partnerNote, setPartnerNote] = useState("");
  const [error, setError] = useState("");

  usePageSeo({
  title: proposal?.title
    ? `${proposal.title} — A Special Question`
    : isInvalid
      ? "Proposal Not Found"
      : "You Received a Special Invite",
  description:
    proposal?.subtitle ||
    "Open this interactive invite to see the question waiting for you.",
  noindex: isInvalid,
  });

  useEffect(() => {
    let active = true;

    const loadProposal = async () => {
      if (!slug || !linkToken) {
        if (active) setViewState("invalid");
        return;
      }

      try {
        const data = await apiRequest(`/api/proposals/${slug}`, {
          token: linkToken,
        });

        if (!active) return;

        const loaded = data.proposal;
        setProposal(loaded);

        if (Array.isArray(loaded.dateOptions) && loaded.dateOptions.length > 0) {
          setSelectedActivity(loaded.chosenDateActivity || loaded.dateOptions[0]);
        }
        if (loaded.partnerNote) {
          setPartnerNote(loaded.partnerNote);
        }

        if (loaded.status === "accepted" && loaded.chosenDateActivity) {
          setViewState("confirmed");
        } else if (loaded.status === "accepted") {
          setViewState("plan_date");
        } else {
          setViewState("ask");
        }
      } catch {
        if (active) setViewState("invalid");
      }
    };

    loadProposal();
    return () => {
      active = false;
    };
  }, [slug, linkToken]);

  const handleAccept = async () => {
    setError("");
    const previousProposal = proposal;

    // Optimistic transition to date planning
    setProposal((prev) => (prev ? { ...prev, status: "accepted" } : prev));
    setViewState("plan_date");

    try {
      const data = await apiRequest(`/api/proposals/${slug}/accept`, {
        method: "POST",
        token: linkToken,
      });
      if (data?.proposal) {
        setProposal(data.proposal);
      }
    } catch (err) {
      // Roll back cleanly on failure
      setProposal(previousProposal);
      setViewState("ask");
      setError(err.message || "Could not record your answer. Please try again.");
    }
  };

  const handleDateSubmit = async (event) => {
    event.preventDefault();
    if (!selectedActivity) return;

    setError("");
    const previousProposal = proposal;
    const trimmedNote = partnerNote.trim();

    // Optimistic transition to confirmed summary
    setProposal((prev) =>
      prev
        ? {
            ...prev,
            chosenDateActivity: selectedActivity,
            partnerNote: trimmedNote,
          }
        : prev
    );
    setViewState("confirmed");

    try {
      const data = await apiRequest(`/api/proposals/${slug}/date`, {
        method: "POST",
        token: linkToken,
        body: {
          chosenDateActivity: selectedActivity,
          partnerNote: trimmedNote,
        },
      });
      if (data?.proposal) {
        setProposal(data.proposal);
      }
    } catch (err) {
      // Roll back to date selection on failure
      setProposal(previousProposal);
      setViewState("plan_date");
      setError(err.message || "Could not save your date plan. Please try again.");
    }
  };

  if (viewState === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.subtitle}>Opening your invitation...</p>
        </div>
      </div>
    );
  }

  if (viewState === "invalid") {
    return (
      <div className={styles.page}>
        <div className={`${styles.card} ${styles.invalidCard}`}>
          <span className={styles.eyebrow}>Invalid Link</span>
          <h1 className={styles.title}>This invitation isn&apos;t available</h1>
          <p className={styles.subtitle}>
            The link may be incomplete, expired, or mistyped. Double-check the full URL sent to you.
          </p>
        </div>
      </div>
    );
  }

  const creatorLabel = proposal?.creatorName || "Someone special";
  const tauntText =
    DODGE_TAUNTS[Math.min(dodgeAttempts, DODGE_TAUNTS.length - 1)];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {error && <p className={styles.errorBanner}>{error}</p>}

        {viewState === "ask" && (
          <>
            <span className={styles.eyebrow}>For {proposal.partnerName}</span>
            <h1 className={styles.title}>Will you go on a date with me?</h1>
            <p className={styles.subtitle}>
              {creatorLabel} put together a special invitation just for you.
            </p>

            <p className={styles.dodgeHint}>{tauntText}</p>

            <div className={styles.buttonArena}>
              <button
                type="button"
                onClick={handleAccept}
                className={styles.yesBtn}
              >
                Yes!
              </button>

              <DodgeButton
                mode={proposal.dodgeMode}
                onAttemptDodge={setDodgeAttempts}
              />
            </div>
          </>
        )}

        {viewState === "plan_date" && (
          <>
            <span className={styles.eyebrow}>It&apos;s a Date!</span>
            <h1 className={styles.title}>Pick our adventure</h1>
            <p className={styles.subtitle}>
              Choose what sounds best to you and leave a quick note if you&apos;d like.
            </p>

            <form onSubmit={handleDateSubmit} className={styles.form}>
              <div className={styles.optionsGrid}>
                {(proposal.dateOptions || []).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedActivity(option)}
                    className={`${styles.optionBtn} ${
                      selectedActivity === option ? styles.optionSelected : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="partnerNote">
                  Note for {creatorLabel} (optional)
                </label>
                <textarea
                  id="partnerNote"
                  rows={3}
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder="Friday evening works great!"
                  className={styles.textarea}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedActivity}
                className={styles.submitBtn}
              >
                Lock In Date Plan
              </button>
            </form>
          </>
        )}

        {viewState === "confirmed" && (
          <>
            <span className={styles.eyebrow}>Confirmed</span>
            <h1 className={styles.title}>You&apos;re all set, {proposal.partnerName}!</h1>
            <p className={styles.subtitle}>
              Your response has been saved for {creatorLabel}.
            </p>
            <ProposalCelebration/>
            <div className={styles.summaryBox}>
              <div>
                <strong>Chosen Activity:</strong> {proposal.chosenDateActivity}
              </div>
              {proposal.partnerNote && (
                <div>
                  <strong>Your Note:</strong> {proposal.partnerNote}
                </div>
              )}
              {proposal.closingNote && (
                <div className={styles.closingNote}>
                  &ldquo;{proposal.closingNote}&rdquo;
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};