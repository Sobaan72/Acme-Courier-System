# Acme Courier Co. — Synthetic Knowledge Base (RAG source content)

Phase 0/2 deliverable: the company-specific policy/FAQ/service-area content that
grounds the intake and WISMO agents' answers to questions the structured
order/quote flow can't handle (see roadmap §10 — RAG Pipeline, and the "off-topic"
transcript category in sample_call_transcripts.md). This is the raw content —
each entry below is loaded as a row in the `knowledge_documents` table
(company_id-scoped). Embedding these into Pinecone is a separate Phase 2 build
step (n8n workflow: read new/updated rows -> embed -> upsert to Pinecone
namespace = company_id) — not done yet, tracked in project-context.md.

Reference profile matches the rest of Phase 0: Acme Courier Co., Toronto ON,
4 pricing zones, 3 service tiers (same_day_standard / same_day_express /
next_day), business hours 8:00am-6:00pm, after-hours = capture_and_queue,
escalation phone +1-416-555-0100, 18 drivers across cargo_van / motorcycle /
e_bike.

---

## 1. [service_area] Service Area & Coverage
Acme Courier Co. delivers within the Greater Toronto Area (GTA), organized into
4 pricing zones by distance band from our central depot (downtown Toronto,
M5V). Zone 1 covers the downtown core (M5-prefix postal codes), Zone 2 the
inner ring (M4/M6 prefixes), Zone 3 the mid ring (M4/M6/M9 prefixes further
out), and Zone 4 the outer ring including parts of Etobicoke, Scarborough, and
North York. We do not currently service addresses outside the GTA, including
requests to other provinces, the United States, or international
destinations — these are flagged for manual review and typically declined
with a referral to a national courier partner.

## 2. [policy] Weekend & Holiday Delivery
Acme offers weekend delivery in Zones 1 and 2 only, subject to driver
availability — this is not guaranteed and should be confirmed at time of
booking. We do not operate on statutory holidays (New Year's Day, Family Day,
Good Friday, Victoria Day, Canada Day, Civic Holiday, Labour Day, Thanksgiving,
Christmas Day, Boxing Day). Orders placed on a holiday are queued for the next
business day.

## 3. [policy] After-Hours & Missed Call Handling
Our business hours are 8:00am-6:00pm, Monday through Saturday. Calls received
outside these hours are captured by our intake system, which records the
caller's order details and queues them for review. A dispatcher reviews all
overnight requests each morning at 7:00am and follows up directly. Customers
with an urgent same-day request outside business hours should note that
same-day service cannot begin until the next business day opens.

## 4. [faq] Service Tiers Explained
We offer three service tiers. Same-Day Standard: picked up and delivered
within the same business day, no fixed delivery window, typically 2-6 hours
depending on zone and driver route. Same-Day Express: guaranteed 2-hour
delivery window from pickup confirmation, priced at a premium (1.6x the
standard rate) for time-sensitive shipments. Next-Day: picked up today,
delivered by end of day the following business day, priced at a discount
(0.85x the standard rate) for non-urgent shipments.

## 5. [faq] Pricing & Zone Structure
Pricing is calculated from three factors: pickup zone (1-4, based on distance
from our depot), package size class (S/M/L/XL, each with a rate multiplier),
and service tier (standard/express/next-day, each with its own multiplier).
Base rates increase with zone distance. A quote is generated automatically at
booking and is valid for 24 hours. Quotes over $500 are held for manual
dispatcher approval before being sent to the customer.

## 6. [policy] Cutoff Times for Same-Day Requests
Same-Day Standard and Same-Day Express requests must be booked by 4:00pm to
guarantee same-day pickup and delivery. Requests submitted after 4:00pm are
still accepted but are flagged as late same-day requests — we will make a
best effort to complete them same-day, but if driver capacity does not allow
it, the order is automatically rolled to Next-Day service at no extra charge,
and the customer is notified of the change.

## 7. [policy] Package Size & Weight Limits
Size classes: S (small, up to 5kg, fits a standard courier bag), M (medium, up
to 15kg), L (large, up to 25kg), XL (extra-large or irregular shaped, up to
50kg — requires cargo van assignment). Packages over 50kg or requiring special
handling (freight pallets, refrigeration) are outside our standard service and
should be flagged for a custom quote rather than booked through the normal
intake flow.

## 8. [policy] Damaged or Lost Package Policy
If a package is damaged or lost in transit, the customer should report it
within 48 hours of the scheduled delivery time. Acme covers declared value up
to $200 CAD per package at no extra cost; customers may purchase additional
declared-value coverage at booking for higher-value items. Claims are
reviewed by a dispatcher and resolved within 5 business days. Photographic
evidence of damage should be requested from the customer when possible.

## 9. [policy] Proof of Delivery (POD) Requirements
Drivers must submit proof of delivery (a photo of the delivered package at
the drop-off location, or a recipient signature) within 20 minutes of the
delivery timestamp. If POD is not submitted within 20 minutes, an automated
reminder is sent to the driver. If still not submitted 40 minutes after the
first reminder, the order is escalated to a dispatcher for manual follow-up.
Orders without POD cannot be invoiced.

## 10. [policy] Cancellation & Rebooking Policy
Orders can be cancelled free of charge any time before a driver is assigned.
Once a driver has been assigned and is en route to pickup, a cancellation fee
of $10 CAD applies. Orders cancelled after pickup (in-transit) are billed at
the full quoted rate. Customers may rebook a cancelled order at any time;
rebooked orders are treated as new bookings with a new quote.

## 11. [faq] Payment Methods & Invoicing
Acme invoices customers after delivery is confirmed and POD is received.
Invoices are generated automatically and sent by email, itemizing pickup/
dropoff addresses, package details, and the quoted price. Payment is due
within 15 days of the invoice date. We accept credit card (via Stripe),
e-transfer, and for approved commercial accounts, monthly billing on net-30
terms.

## 12. [other] Vehicle Classes
We operate three vehicle classes matched to package size and urgency: cargo
van (for large/XL packages and multi-stop routes), motorcycle (for fast,
single-package same-day and express deliveries in dense urban zones), and
electric bicycle (for small, lightweight packages in the downtown core,
zero-emission and often fastest in heavy downtown traffic).

## 13. [policy] Driver Conduct & Safety
All Acme drivers are required to follow standard road safety practices,
confirm delivery addresses before leaving a package unattended, and treat
customers professionally. Any complaint about driver conduct is escalated
immediately to a dispatcher for review and is not something the intake or
WISMO agent should attempt to resolve directly — it should always be routed
to a human.

## 14. [policy] Customer Data & Privacy
Customer data collected at booking (name, phone, email, addresses) is used
solely to fulfill the delivery and is not shared with third parties outside
of the driver assigned to the order and, where applicable, payment
processing via Stripe. Data is retained for 12 months for support and
invoicing purposes, then archived. Customers may request deletion of their
data by contacting support directly — this request must be routed to a human,
not resolved automatically by an agent.

## 15. [policy] Complaint & Escalation Process
Any customer message that expresses a complaint, dispute, or dissatisfaction
must be routed to a human dispatcher with the full order context attached —
this is a mandatory human-in-the-loop checkpoint and should never be resolved
solely by an automated agent. The dispatcher aims to respond to escalated
complaints within 2 business hours during business hours, or by 10:00am the
next business day if received after hours.

## 16. [faq] Tracking & Order Status
Customers can check order status by replying to their confirmation message on
WhatsApp or SMS, or by calling in. Status categories are: pending (order
received, not yet quoted), quoted (price sent, awaiting confirmation),
confirmed (customer accepted, awaiting driver assignment), in_transit (driver
has picked up and is en route), delivered (POD received), and cancelled.

## 17. [service_area] International / Out-of-Area Requests
Acme does not currently offer cross-border or international courier service.
Requests with a pickup or drop-off address outside the Greater Toronto Area —
including US addresses — are outside our service area and should be
politely declined, with the order marked cancelled. We recommend the
customer contact a national or international courier for these requests.

## 18. [faq] Multi-Package & Bulk Orders
Customers with multiple packages in a single call (e.g., several pickups
going to the same destination, or one pickup with multiple drop-offs) can
have each package booked as a linked order under the same customer record.
Each package is priced individually based on its own size, zone, and service
tier — there is no automatic bulk discount at this time, though commercial
accounts with regular volume can request a custom rate from a dispatcher.
