import Link from "next/link";
export const metadata = { title: "Privacy & playback" };
export default function Privacy() {
  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/">
          <img src="/icon.svg" alt="" width="38" height="38" />
          WatchNest
        </Link>
        <Link className="button-secondary" href="/">
          Back home
        </Link>
      </header>
      <main id="main-content" className="shell" style={{ maxWidth: 850 }}>
        <p className="eyebrow">Private family beta</p>
        <h1>Privacy & playback</h1>
        <div className="panel" style={{ marginTop: 30 }}>
          <h2>Your family’s library</h2>
          <p>
            WatchNest provides a library of individual videos approved by a
            parent or caregiver. Each child can access only their assigned
            library through WatchNest. Children cannot search the open YouTube
            catalog here.
          </p>
          <h2>YouTube is the video provider</h2>
          <p>
            Videos play through YouTube’s official embedded player. YouTube
            controls branding, links, ads, menus, fullscreen behavior, and some
            recommendation surfaces. Those surfaces can lead outside WatchNest.
            “Approved only” describes WatchNest’s library and navigation; it is
            not a guarantee that every YouTube-controlled click path is
            contained.
          </p>
          <p>
            WatchNest uses the privacy-enhanced YouTube player where possible.
            This does not mean YouTube collects no data. YouTube and Google’s
            own terms and privacy rules apply to their services.
          </p>
          <p>
            <a
              href="https://www.youtube.com/t/terms"
              style={{ textDecoration: "underline" }}
            >
              YouTube Terms of Service
            </a>{" "}
            ·{" "}
            <a
              href="https://policies.google.com/privacy"
              style={{ textDecoration: "underline" }}
            >
              Google Privacy Policy
            </a>
          </p>
          <h2>What WatchNest stores</h2>
          <p>
            Parent account information, child display names and chosen avatars,
            approved video metadata, assignments, collections, requests, and
            settings are stored to operate your household library. Child
            passcodes are stored as salted hashes. Session credentials stay in
            protected cookies.
          </p>
          <p>
            For videos explicitly verified as not Made for Kids, WatchNest keeps
            only a raw player position for up to 29 days to support resume. This
            functional bookmark is not watch time or proof of viewing. A
            player-ended event clears it. No watch durations, percentages,
            completion rates, most-watched reports or viewing histories are
            collected or reported. Made for Kids videos and videos with unknown
            status have no resume tracking. The Parent Dashboard reports
            WatchNest approvals, assignments and requests only.
          </p>
          <h2>Parent control</h2>
          <p>
            Parents can revoke video access, change child passcodes, and resolve
            child requests. Requests stay in the family’s Parent Inbox; they do
            not return open YouTube results to a child. Private viewing
            information is not publicly shared. WatchNest does not use
            advertising profiles or third-party analytics SDKs.
          </p>
          <h2>Shared devices</h2>
          <p>
            Keep the parent password private. Sign out of Parent Mode before
            giving a shared device to a child. Use a separate passcode for each
            child when sibling libraries need to stay private. A profile without
            a passcode requires a parent to sign in on that device to open it.
          </p>
          <h2>Data questions</h2>
          <p>
            This beta is operated for the invited caregiver’s private family
            use. The Parent dashboard is the starting point for reviewing and
            managing family data. For account deletion or export, contact the
            beta operator through the existing private support channel. No
            public support form collects children’s information.
          </p>
        </div>
      </main>
    </>
  );
}
