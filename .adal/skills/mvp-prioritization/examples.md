# MVP Prioritization Examples

Here are realistic examples of how to use this skill:

---

## Example 1: B2B SaaS — Customer Feedback Tool

**User Query:**
> "I'm building a product where B2B companies can collect customer feedback and turn it into feature requests. The team is 3 engineers. What's our MVP?"

**Analysis:**
- **Core Outcome:** Turn feedback → prioritized roadmap
- **User Journey:** Collect feedback → Categorize → Vote → Roadmap

**MoSCoW Output:**

| Must Have | Should Have | Could Have | Won't Have (v1) |
|-----------|--------------|-------------|------------------|
| Embeddable feedback widget | Email notifications | Slack integration | Public roadmap |
| Dashboard to view feedback | Voting/prioritization | NPS scoring | SSO/SAML |
| Basic categorization tags | Duplicate detection | White-labeling | Advanced analytics |
| Export to CSV | Team permissions | API access | Widget customization |

**V1 Roadmap:** Weeks 1-2: Widget + basic dashboard. Week 3: Categorization + export. Week 4: Polish + launch.

---

## Example 2: Developer Tool — Local Dev Environment Manager

**User Query:**
> "I want to build a tool that helps developers manage multiple local development environments (databases, services) with one click. Should I include Docker support in v1?"

**Analysis:**
- **Core Outcome:** One-click start of full dev environment
- **Question:** Include Docker?
- **Decision:** Docker is a \"Should\" — users can set up manually in v1, but the tool should eventually auto-provision containers.

**MoSCoW Output:**

| Must Have | Should Have | Could Have | Won't Have |
|-----------|--------------|-------------|-------------|
| CLI tool (init, start, stop) | Docker Compose support | Kubernetes config | Cloud sync |
| Config file (.devenv) | Service templates | Environment cloning | Team workspaces |
| Local status dashboard | Logs aggregation | Metrics/monitoring |  |
| Start/stop all services | Database presets |  |  |

---

## Example 3: Consumer App — Habit Tracker

**User Query:**
> "Building a mobile habit tracker with social accountability features. MVP only — what's essential?"

**Analysis:**
- **Core Outcome:** Build and maintain daily habits
- **Aha Moment:** User completes first habit and sees streak

**MoSCoW Output:**

| Must Have | Should Have | Could Have | Won't Have |
|-----------|--------------|-------------|-------------|
| Create habits with reminders | Streak gamification | Social sharing | Groups/challenges |
| Daily check-in | Habit categories | Insights/charts | Widgets |
| Simple streak counter | Notifications | Dark mode | Apple Watch app |
|  |  | Motivational quotes |  |

**Scope Rationale:** Social features (groups, sharing) are post-MVP. v1 focuses purely on individual habit formation.
