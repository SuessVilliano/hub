# AIH HighLevel Workflow Map

## WF-01 — New Website Inquiry
Trigger:
- Project Intake submitted
- HighLevel chat qualifies commercial intent

Actions:
1. Create/update contact
2. Apply source + service tags
3. Create opportunity in AIH Revenue Pipeline / New Inquiry
4. Assign owner
5. Internal notification
6. Confirmation email
7. Confirmation SMS
8. Wait 10 minutes
9. If no appointment: send booking prompt
10. Wait 1 day
11. If no response: follow-up
12. Wait 3 days
13. Final short follow-up
14. Move to nurture if not active

## WF-02 — Missed-Call Rescue
Trigger:
- Inbound call missed / not answered

Actions:
1. Immediately send SMS:
   "Hey {{contact.first_name}}, this is Applied Innovations Hub. Sorry we missed you. What were you looking to build, automate, or improve?"
2. Create/update contact
3. Tag AIH-Missed-Call
4. Create New Inquiry opportunity if none exists
5. AI conversation handles reply
6. If buying intent: offer booking
7. If urgent/high value: notify human

## WF-03 — AI Receptionist Qualified Lead
Trigger:
- Voice AI sets qualification field = Qualified

Actions:
1. Tag AIH-Voice + AIH-Qualified
2. Create/update opportunity
3. Save Voice AI summary
4. Assign sales owner
5. Send calendar if not booked
6. Notify sales team
7. If booked: move to Discovery Scheduled

## WF-04 — Appointment Lifecycle
Trigger:
- Appointment booked

Actions:
1. Move opportunity to Discovery Scheduled
2. Send confirmation
3. Reminder 24 hours before
4. Reminder 2 hours before
5. If attended: move to Discovery Completed
6. If no-show: start reschedule sequence
7. If cancelled: offer reschedule

## WF-05 — Proposal Follow-Up
Trigger:
- Opportunity moved to Proposal / Scope Sent

Actions:
1. Send proposal receipt confirmation
2. Wait 2 days
3. Short follow-up
4. Wait 3 days
5. Value-based follow-up
6. Wait 5 days
7. Final decision-check message
8. Move to Decision Pending / Long-Term Nurture as appropriate

## WF-06 — Lead Reactivation
Trigger:
- Contact added to approved reactivation list

Actions:
1. Respect DND/consent
2. Segment by original interest
3. Send conversational reactivation message
4. Route replies to AI/human
5. Qualified replies -> opportunity + calendar
6. No response -> limited follow-up cadence
7. Opt-out -> stop immediately

## WF-07 — Review + Reputation
Trigger:
- Project milestone / successful service completion

Actions:
1. Send feedback request
2. Positive response -> public review request
3. Negative response -> internal recovery task
4. Follow-up once if no response

## WF-08 — Founding Access
Trigger:
- Founding Access form / event interest

Actions:
1. Tag AIH-Founding-Access
2. Send welcome
3. Ask which program/service matters most
4. Segment
5. Announce relevant events
6. Escalate commercial intent to Revenue Pipeline

## WF-09 — Event Registration
Trigger:
- Event registration

Actions:
1. Tag event name
2. Send confirmation
3. Calendar/reminder sequence
4. Event-day reminder
5. Post-event recap
6. CTA to Systems Audit / Strategy Call
7. Add to appropriate nurture

## WF-10 — Government / Teaming Inquiry
Trigger:
- Government / subcontract service selected
- Chat/voice identifies prime/agency/team opportunity

Actions:
1. Create opportunity in AIH Partnerships + Government
2. Capture opportunity/contract ID
3. Assign research owner
4. Internal alert
5. Send capability-intake confirmation
6. Schedule Partner / Teaming Call
