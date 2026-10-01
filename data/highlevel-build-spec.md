# Applied Innovations Hub — HighLevel Sub-Account Build Specification

## Sub-account
Name: Applied Innovations Hub
Short name: AIH
Primary use: CRM, AI chat, Voice AI, forms, calendars, sales pipeline, automations, email/SMS, reputation, event registrations, and partner follow-up.

## Core Pipeline
Create one primary pipeline: **AIH Revenue Pipeline**

Stages:
1. New Inquiry
2. Contacted
3. Qualified
4. Discovery Scheduled
5. Discovery Completed
6. Proposal / Scope Sent
7. Decision Pending
8. Won
9. Onboarding
10. Active Project
11. Recurring / Managed
12. Lost / Not Now

Create a secondary pipeline: **AIH Partnerships + Government**
1. New Opportunity
2. Capability Match
3. Researching Requirements
4. Teaming / Subcontract Discussion
5. Bid / Proposal In Progress
6. Submitted
7. Awarded
8. Not Awarded
9. Future Follow-Up

## Contact Custom Fields

Business information:
- Company / Organization
- Website
- Industry
- Number of Employees
- Primary Location
- Current CRM
- Existing Lead Sources
- Approximate Monthly Lead Volume

AIH discovery:
- AIH Service Interest
- Primary Business Problem
- Desired Outcome
- Urgency
- Budget Range
- Current Follow-Up Process
- Missed Calls Per Week
- Existing Database Size
- Fulfillment Monthly Order Volume
- Government / Prime / Subcontractor Type
- Contract / Opportunity ID
- Preferred Contact Method

Attribution:
- Lead Source
- Lead Source Detail
- Landing Page
- Campaign
- UTM Source
- UTM Medium
- UTM Campaign
- Event Name

Qualification:
- Lead Score
- Sales Readiness
- Human Follow-Up Required
- Voice AI Summary
- Chat AI Summary

## Tags
Use clean tags with the prefix `AIH-`.

Suggested:
- AIH-New-Lead
- AIH-Website
- AIH-Chat
- AIH-Voice
- AIH-Referral
- AIH-Event
- AIH-Founding-Access
- AIH-AI-Receptionist
- AIH-Missed-Call
- AIH-CRM
- AIH-Website-Build
- AIH-Reactivation
- AIH-Reputation
- AIH-RnD
- AIH-Fulfillment
- AIH-Logistics
- AIH-Government
- AIH-Partner
- AIH-Qualified
- AIH-Proposal
- AIH-Won
- AIH-Long-Term-Nurture

## Calendars

Create:
### AIH Strategy + Capability Call
Length: 30 minutes
Use for:
- AI / CRM / automation
- Websites and funnels
- AI receptionist
- Lead reactivation
- Fulfillment / logistics
- R&D
- Partner discussions
- Government / subcontract discussions

### AIH Systems Audit
Length: 45 minutes
Use for qualified businesses that need a deeper process review.

### AIH Partner / Teaming Call
Length: 30 minutes
Use for primes, vendors, partners, institutions, and government-contract teaming.

## Forms

### AIH Project Intake
Fields:
- First Name
- Last Name
- Email
- Phone
- Company / Organization
- Website
- Service Interest
- Primary Business Problem
- Desired Outcome
- Project Context
- Preferred Timeline

On submit:
- Create/update contact
- Add AIH-Website tag
- Add service-interest tag
- Create opportunity in New Inquiry
- Notify sales team
- Send confirmation SMS/email
- Offer Strategy + Capability Call

### AIH Founding Access
Fields:
- Name
- Email
- Phone
- Company
- Interest
- Program/Event

On submit:
- Tag AIH-Founding-Access
- Add to Founding Access nurture
- Create opportunity only if commercial intent exists

## Website Chat

Create a HighLevel chat widget for the AIH website.

Chat goals:
1. Determine the visitor's problem.
2. Identify relevant AIH service.
3. Ask concise discovery questions.
4. Capture name, email, phone, company.
5. Create/update CRM contact.
6. Create opportunity for sales-worthy conversations.
7. Offer the correct calendar.
8. Trigger human follow-up for complex requests.

Knowledge source:
`data/aih-knowledge-base.md`

## Voice AI

Create:
### AIH Inbound Receptionist
Purpose:
- answer calls
- qualify
- book
- route
- create CRM contact/opportunity
- summarize call

### AIH Follow-Up Agent
Purpose:
- follow up on form/chat inquiries
- missed-call callbacks
- approved lead reactivation
- appointment reminders/reschedules
- approved business-development outreach

Prompt:
`data/aih-voice-agent-prompt.md`

## Phone / Conversation Routing

Recommended number:
A dedicated AIH business number inside the sub-account.

Routing:
- Inbound call -> Voice AI first during configured hours/overflow
- Human transfer available
- Missed/abandoned call -> Missed-Call Rescue workflow
- Every meaningful call -> note + summary + opportunity update

## Email

Recommended sender identity:
Applied Innovations Hub

Create:
- Inquiry confirmation
- Appointment confirmation
- Appointment reminder
- Proposal follow-up
- No-response nurture
- Event confirmation
- Founding Access confirmation
- Reactivation sequences
- Review request sequences

## Website Integration

The repository already contains:
- `highlevel-config.js`
- native HighLevel chat loader
- project form embed replacement
- interest form embed replacement
- booking integration

Once IDs/links are available, populate:
- locationId
- chatWidgetId
- projectFormUrl
- interestFormUrl
- bookingUrl

Then set:
`useNativeChat: true`

No website redesign is required.
