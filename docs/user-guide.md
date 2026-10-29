# Using MergeTip

MergeTip lets you tip open-source contributors in sats for work they did on GitHub: a review, a
merged pull request, triage, docs. You tip with a comment (`/tip @alice 2100`) or the ⚡ button of
the browser extension. MergeTip checks the person really contributed to that thread, then your own
wallet pays their Lightning address. MergeTip never holds anyone's sats.

- [Wallets: what to use for receiving and sending](#wallets)
- [Receiving tips](#receiving-tips)
- [Sending tips](#sending-tips)
- [The `/tip` command](#the-tip-command)
- [The browser extension](#the-browser-extension)
- [What the bot replies](#what-the-bot-replies)
- [Troubleshooting](#troubleshooting)

## Wallets

MergeTip uses two different wallet features, and a wallet may support one, both or neither:

| You want to | Your wallet needs | Why |
| --- | --- | --- |
| **Receive** tips | A **Lightning address** (`you@wallet.com`) whose invoices pass MergeTip's checks | Tips are paid to that address |
| **Send** tips | **Nostr Wallet Connect** (NWC, NIP-47) with permission to pay invoices | MergeTip asks your wallet to pay each verified tip, within limits you set |

### For receiving

Use a wallet that gives you a Lightning address. When you save one, MergeTip asks it for a
1-sat test invoice (nothing is paid) and only accepts it if the invoice passes the same checks as
a real payment: right amount, right network, and a description hash that matches the address's
own metadata (LUD-06). So the settings page tells you straight away if an address won't work.

| Wallet | Address looks like | Status |
| --- | --- | --- |
| **Cake Wallet** | `name@cake.cash` | ✅ Tested: received tips |
| **Coinos** | `name@coinos.io` | ✅ Tested: invoices pass the checks |
| **MergeTip's in-browser wallet** (Breez SDK) | `name@breez.tips` | ✅ Tested: created and verified. Made for you on the claim and receive pages |
| **Bull Bitcoin** (Bull wallet) | depends on the wallet | ⚪ Not tested. If it gives you a Lightning address, save it: MergeTip will tell you if it's incompatible |
| **Primal** | `name@primal.net` | ❌ Not compatible for receiving: its invoices don't commit to the address's metadata, so MergeTip refuses them. Primal still works for **sending** |

Custodial wallets (Coinos, Primal, and others) hold your sats for you; self-custodial wallets
(Cake Wallet, the in-browser Breez wallet, Alby Hub) keep the keys on your device. MergeTip works
with both; choose what you are comfortable with.

### For sending

Use a wallet that supports **Nostr Wallet Connect**. You create a "connection" in the wallet (it
is often under *Settings → Nostr Wallet Connect*, *Connected apps* or *Apps*), give it a budget,
and paste the `nostr+walletconnect://…` string into MergeTip. Treat that string like a password.

| Wallet | Status | Notes |
| --- | --- | --- |
| **Coinos** | ✅ Tested: paid tips | For very small tips (tens of sats), Coinos may refuse to pay a routing fee of even 1 sat; tip a larger amount or raise its fee limit if it lets you |
| **Primal** | ✅ Tested: paid tips | A connection has stopped answering after use; if tips stay "pending", delete the connection in Primal, create a new one and reconnect |
| **Alby Hub** | ✅ Connection tested | Self-custodial node; needs a channel (funding) before it can pay. MergeTip's **Connect with Alby** button creates a pay-only, budgeted connection |
| Others with NWC | ⚪ Not tested | Should work if they support `pay_invoice`. Check with the [connection probe](running-locally.md#check-a-wallet-connection) first |

When creating the connection, allow only **paying invoices** if the wallet lets you choose, and
set a **budget** (e.g. 5,000–50,000 sats a month). MergeTip's own limits apply on top.

## Receiving tips

You don't need anything set up to be tipped: if someone tips you before you have a Lightning
address, the tip waits for you as a **pledge**.

1. **Sign in** at MergeTip with your GitHub account.
2. Go to **Settings → Receiving** and paste your Lightning address, then **Save address**. Or
   click **Create a wallet in this browser**: write down the 12 words on paper (they are the only
   way to recover the wallet), confirm 3 of them, choose a PIN, and MergeTip links the new
   `@breez.tips` address to your account. The words never leave your browser.
3. That's it: tips to you are now **paid instantly**, and the bot posts a receipt in the thread.

**Claiming a pledge.** If you were tipped before setting up, the bot mentions you with a claim
link (and emails you when it knows your address). Open it within **30 days**, sign in with the
GitHub account that was tipped, then paste a Lightning address or create a wallet, and click
**Claim**. Nothing is charged to the sender until you claim; unclaimed pledges expire.

**Email notices.** MergeTip emails you about pledges and expiry reminders (at most one email a
day). Turn them off under **Settings → Receiving**; GitHub mentions always happen.

To receive, your GitHub account must be at least **30 days old** (an anti-abuse rule).

## Sending tips

1. **Install the GitHub App** on the repositories where you want to tip (the **Install GitHub
   App** button on the MergeTip home page). The bot can only see comments in those repositories.
2. **Sign in** with GitHub.
3. **Settings → Sending wallet**: paste your wallet's NWC connection string and click **Connect
   wallet**, or use **Connect with Alby** for an Alby Hub. MergeTip checks it can reach the wallet
   and that the connection can pay invoices.
4. **Settings → Limits and safety**, set:
   - **Most per tip** and **Most per day** (the daily limit resets at midnight UTC);
   - **Confirm tips above** (default 50,000 sats, at least 1,000): bigger tips wait until you
     confirm them in MergeTip, so a hijacked GitHub account alone can't send them;
   - optionally **Also require an emailed code** for those confirmations.

   Lowering a limit applies at once. Raising one, or turning codes off, needs a GitHub sign-in in
   the last 15 minutes; MergeTip will ask you to sign in again.
5. Tip with a comment or the extension. Your **Dashboard** shows what you sent and received,
   what's pending, and today's budget.

**Large tips.** Above your confirmation threshold the bot posts a confirm link. Open it, check the
amount, receiver and thread, enter the emailed code if you enabled codes, and click **Confirm and
send** within **1 hour**, or the tip is cancelled.

**Disconnecting.** **Settings → Sending wallet → Disconnect wallet** stops MergeTip using it.
To be certain, also revoke the connection in your wallet. **Settings → Account → Delete my
account** removes your wallet connection, address and email.

## The `/tip` command

```
/tip @<username> <amount>[k] [sats] [on-merge] [for <note>]
```

| Example | Meaning |
| --- | --- |
| `/tip @alice 2100` | Tip alice 2,100 sats now |
| `/tip @alice 2.1k for the review` | The same, with a public note |
| `/tip @bob 5000 on-merge` | Tip bob 5,000 sats when this pull request is merged (cancelled if it's closed unmerged) |
| `/tip @alice 500 @bob 500` | Not valid: one receiver per command. Put each tip on its own line |

- Amounts are whole sats; `k` means thousands (`2.1k` = 2,100).
- The note after `for` is public and at most 140 characters.
- Up to 5 tips per comment, 20 tips per hour, and 3 tips to the same person per thread.
- Commands inside code blocks or quoted replies are ignored, and so are edited comments.

**Who can be tipped.** The person must exist, not be you or a bot, and have contributed to the
thread: reviewed or committed to the pull request (co-authors count), or opened or commented on
the issue. `on-merge` tips go to the pull request's author or committers.

## The browser extension

The extension adds **⚡ Tip** buttons on GitHub: next to the pull request or issue title (for the
author) and next to each commenter and reviewer. Clicking one opens a small tip form: amount
(21 / 210 / 2,100 / custom), *now* or *when merged*, a note, the receiver's status ("Paid
instantly" or "Will be pledged") and your budget for today. **Send ⚡** posts the `/tip` comment
for you.

Install it from the Chrome Web Store or Firefox Add-ons when published. Until then, load a build:
Chrome, Brave and other Chromium browsers via `chrome://extensions` → **Developer mode** →
**Load unpacked**; Firefox via `about:debugging` → **This Firefox** → **Load Temporary Add-on**.
Then click any ⚡ button → **Connect MergeTip**, and approve on the page that opens.

The extension can post tips and read your limits. It never sees your wallet connection and can't
confirm large tips. Disconnect it from its popup; deleting your MergeTip account revokes it.

## What the bot replies

The bot reacts 👀 when it sees a command, then 🚀 or 😕, and keeps one comment per thread up to date.

| Situation | Reply (example) |
| --- | --- |
| Paid | ⚡ @maintainer tipped @alice **2,100 sats** for the review · payment `a1b2…` |
| Receiver has no address yet | ⚡ @newdev, @maintainer sent you **5,000 sats**. Claim within 30 days → Claim your sats |
| Waiting for merge | ⏳ @maintainer will tip @bob **5,000 sats** when this PR is merged |
| Above your threshold | 🔐 @maintainer, this **80,000 sats** tip to @alice is above your 50,000 sats confirmation limit. Confirm within 1 hour → … |
| Your wallet isn't connected | 🔌 @maintainer, connect your wallet to send this **500 sats** tip to `alice` → Connect wallet (held for 24 h) |
| Failed | 😕 with the reason and what to do (see below) |

## Troubleshooting

| Message or symptom | What it means | What to do |
| --- | --- | --- |
| "That Lightning address can't receive tips safely" (when saving) | The address's test invoice failed MergeTip's checks (e.g. Primal addresses) | Use an address from another wallet (see [Wallets](#for-receiving)) |
| "@receiver's Lightning address couldn't accept this payment, so nothing was sent" | The receiver's address handed out an invoice MergeTip won't pay | The receiver should save a compatible address; then tip again |
| "your wallet wouldn't pay the routing fee…" | Your wallet's fee limit is below the route's fee, common for very small tips | Tip a larger amount, or raise the wallet's fee limit |
| "your wallet's budget is used up" / "doesn't have enough sats" | The NWC connection's budget or your balance ran out | Raise the budget in your wallet or top it up, then tip again |
| "MergeTip isn't allowed to pay from your wallet any more" | The connection was revoked or lost permission | Reconnect your wallet in Settings |
| Tip stays **pending** for minutes | Your wallet didn't answer the payment request | Check the wallet's history for the payment. If the wallet seems stuck, recreate its connection. MergeTip never pays a tip twice: it waits for the wallet to confirm |
| "We could not reach your wallet" (when connecting) | MergeTip got no answer from the wallet over its relay | Check the wallet is online, or create a new connection; the [probe](running-locally.md#check-a-wallet-connection) tells you if the wallet answers at all |
| "hasn't contributed to this thread yet" | The receiver didn't review, commit or comment there | Tip them on a thread they worked on |
| Sign in shows a GitHub 404 | The MergeTip GitHub App is private (self-hosted instances) | The App's owner must make it public |
