# Part 2 – AbleSpace Product Analysis: "Take Data" Screen

## Overview

The **Take Data** screen in the AbleSpace Caseload tab is the primary interface for therapists and clinicians to record session data for their clients. It surfaces measurement tools, goal tracking, and data collection in a structured workflow.

---

## Workflow Description (as I understand it)

### 1. Accessing the Screen
The clinician navigates to the **Caseload** tab from the main navigation. They select a specific student/client from their caseload list. Within that client's profile, they tap or click **"Take Data"** to enter the data collection session.

### 2. Session Setup
Before collecting data, the clinician typically:
- Selects the **session date** (defaults to today)
- Confirms the **client / student** being worked with
- Reviews the active **goals** assigned to this client

### 3. Goal Selection
The screen lists the client's active IEP goals or therapy objectives. Each goal shows:
- The **goal description**
- The **measurement type** (e.g., percentage correct, frequency, duration, trial-by-trial)
- **Historical performance** or a progress indicator

The clinician selects which goals to collect data on for this session.

### 4. Data Entry
Depending on the measurement type for each goal, the interface presents:
- **Trial-by-trial entry**: + / − buttons for correct/incorrect responses
- **Percentage fields**: Direct numeric input
- **Frequency counters**: Tap to increment
- **Duration timers**: Start/stop timer built into the UI
- **Notes field**: For qualitative observations

### 5. Saving & Completing the Session
Once all target goals have data entered, the clinician taps **Save** or **Complete Session**. The data is stored and reflected in:
- The client's progress graphs
- Session notes / reports
- Goal mastery calculations

---

## Identified UX/UI Issues & Improvement Suggestions

### 🔴 Critical Issues

**1. No auto-save / draft recovery**
If a clinician accidentally closes the app or navigates away mid-session, all entered data is lost. This is a significant pain point in a clinical setting where interruptions are frequent.
- **Suggestion**: Auto-save every entry to local storage or the server as a draft. Show a "Resume session" prompt if an incomplete session exists.

**2. Slow trial entry on touch devices**
Tapping small +/− buttons for many trials is tedious, especially for high-frequency behaviours.
- **Suggestion**: Larger tap targets (min 48×48px per WCAG), haptic feedback on mobile, and optionally a **big tap mode** that uses the full screen as a single tap target.

**3. No offline support**
Clinicians often work in schools or facilities with poor connectivity. A lack of offline capability means data can't be collected without internet.
- **Suggestion**: Implement a Service Worker + IndexedDB offline queue that syncs when connectivity is restored. Show a clear "Offline – data will sync" indicator.

---

### 🟡 Moderate Issues

**4. Goal list is not prioritised**
When a client has many goals, the list is flat with no visual hierarchy. Clinicians have to scroll through all goals to find the ones relevant to today's session.
- **Suggestion**: Allow clinicians to **pin goals** for a session, or have a "today's targets" section that pre-populates based on frequency/schedule settings.

**5. No session timer**
Clinicians need to track total session duration for billing and compliance, but there's no built-in timer.
- **Suggestion**: Add a subtle session timer at the top of the screen that starts automatically when the session is opened.

**6. Difficulty distinguishing goal types at a glance**
Different goal types (percentage, frequency, duration) look visually similar, requiring the clinician to read each goal's description to know how to enter data.
- **Suggestion**: Use distinct colour-coded icons for each measurement type (e.g., 📊 percentage, 🔢 frequency, ⏱️ duration) so the data entry mode is immediately obvious.

**7. No quick notes shortcut**
Adding qualitative notes requires navigating to a separate notes field, breaking the flow of trial-by-trial data entry.
- **Suggestion**: Add a floating **"Add note"** button that opens a quick-entry overlay without leaving the current goal.

---

### 🟢 Enhancement Suggestions

**8. Session summary before save**
Before finalising, show a read-only summary: goals covered, trials per goal, performance percentages, and session duration. This lets clinicians spot-check entries before committing.

**9. Smart default answers**
If a clinician enters 8/10 correct for the first 3 sessions, pre-populate the prompt with 8 as a suggested value (while still allowing free entry). Reduces cognitive load.

**10. Progress sparkline on goal cards**
Display a tiny 5-session sparkline chart next to each goal on the data entry screen so the clinician immediately sees the trend without switching to a separate graph view.

**11. Keyboard & accessibility improvements**
For clinicians using tablets with keyboards, the data entry flow should be fully navigable with Tab/Enter. Ensure all interactive elements have visible focus rings and ARIA labels for screen readers.

**12. Batch goal completion**
If a clinician runs the same program for multiple students back-to-back (group sessions), allow entering data for multiple clients in a single session view.

---

## Summary

The Take Data screen clearly solves the right problem and its core flow is logical. The biggest improvements would come from **offline support**, **auto-save**, and **better touch ergonomics** for trial-by-trial entry — the scenarios where clinicians are most likely to encounter friction in real practice.
