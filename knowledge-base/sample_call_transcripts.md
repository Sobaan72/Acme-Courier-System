# Acme Courier Co. — Synthetic Call Transcripts

Per roadmap 3.3: 60-80 transcripts are needed across 6 categories to train/stress-test
the Retell AI intake agent before it touches real calls. Below are 60 transcripts —
10 per category — covering clean, incomplete, ambiguous, off-topic, multi-package,
and hostile/impatient intake calls. A prompt template is included at the end if you
want to push toward the 80 upper bound later.

## 1. Clean intake

**Transcript 1:**
> Agent: Thanks for calling Acme Courier, this is Ava. Where are we picking up today?
> Customer: Hi, I need something picked up from 45 Ossington Ave and dropped at 200 Bloor St W.
> Agent: Got it. What are we sending — roughly how big and how heavy?
> Customer: A small box, maybe 2 kilos, some documents.
> Agent: And do you need same-day standard, same-day express, or next-day?
> Customer: Same-day is fine, doesn't need to rush.
> Agent: Perfect, can I get your name and a phone number for the confirmation?
> Customer: Priya Singh, 416-555-2231.
> Agent: You're all set, Priya — quote's on its way to your phone now.
Outcome: order_captured — all fields present.

**Transcript 2:**
> Agent: Acme Courier, how can I help?
> Customer: Need a pickup from my office, 88 Queen St W, unit 12, going to 500 King St E.
> Agent: Got the addresses. Package size and weight?
> Customer: Medium box, about 6kg.
> Agent: Standard, express, or next-day?
> Customer: Express, it's urgent.
> Agent: Name and phone for the booking?
> Customer: Daniel Brown, 416-555-8890, email daniel.b@example.com.
> Agent: Booked — express quote coming to your email now.
Outcome: order_captured — all fields present.

**Transcript 13:**
> Agent: Acme Courier, this is Ava, how can I help?
> Customer: Hi, I need a pickup from 310 College St to 88 Yonge St.
> Agent: Got it. What's the package like?
> Customer: Small envelope, maybe half a kilo, just some contracts.
> Agent: Same-day standard, express, or next-day?
> Customer: Next-day works fine.
> Agent: Great, can I get a name and phone number?
> Customer: Grace Chen, 416-555-3390.
> Agent: You're booked, Grace — next-day quote coming to your phone.
Outcome: order_captured — all fields present.

**Transcript 14:**
> Agent: Thanks for calling Acme, this is Ava.
> Customer: I need something picked up from my store, 640 Queen St W, going to a customer at 12 Roncesvalles Ave.
> Agent: Got both addresses. What are we shipping and roughly what size?
> Customer: A medium box of clothing samples, around 5kg.
> Agent: Service tier — standard, express, or next-day?
> Customer: Same-day standard is fine.
> Agent: Perfect. Name and phone for the confirmation?
> Customer: Liam Osei, 416-555-7712, liam.o@example.com.
> Agent: All set — quote's heading to your email now.
Outcome: order_captured — all fields present.

**Transcript 15:**
> Agent: Acme Courier, how can I help you today?
> Customer: Pickup from 77 Spadina Ave, drop-off at 900 King St E.
> Agent: Got it. Package size and weight?
> Customer: Large box, about 18kg, it's some office equipment.
> Agent: Same-day express or standard?
> Customer: Express — need it there in the next two hours.
> Agent: Name and phone number, please.
> Customer: Fatima Reyes, 416-555-4471.
> Agent: You're booked, express quote sent to your phone.
Outcome: order_captured — all fields present.

**Transcript 16:**
> Agent: Acme Courier, this is Ava speaking.
> Customer: Hey, need a next-day pickup, 210 Bathurst St to 550 Danforth Ave.
> Agent: Got the addresses. What's the package?
> Customer: Small parcel, a couple of books, maybe 3kg.
> Agent: And your name and phone for the booking?
> Customer: Noah Kim, 416-555-9834, noah.kim@example.com.
> Agent: Booked — next-day quote is on its way to your email.
Outcome: order_captured — all fields present.

**Transcript 17:**
> Agent: Thanks for calling Acme, this is Ava. How can I help?
> Customer: I need a pickup from 60 Eglinton Ave E, dropping off at 400 St Clair Ave W.
> Agent: Got it. Roughly how big and heavy is the package?
> Customer: Medium, maybe 8kg, kitchenware.
> Agent: Standard, express, or next-day?
> Customer: Standard's fine.
> Agent: Name and phone number?
> Customer: Isabella Kowalski, 416-555-2298.
> Agent: All booked — your quote is on the way.
Outcome: order_captured — all fields present.

**Transcript 18:**
> Agent: Acme Courier, this is Ava.
> Customer: Pickup at 900 Coxwell Ave, drop-off at 15 Yonge St.
> Agent: Got both. What are we shipping?
> Customer: A small electronics box, about 2.5kg.
> Agent: Which tier — standard, express, or next-day?
> Customer: Same-day express, please.
> Agent: Name and number?
> Customer: Mateo Al-Farsi, 416-555-6620.
> Agent: You're all set — express quote is heading to your phone now.
Outcome: order_captured — all fields present.

**Transcript 19:**
> Agent: Acme Courier, how can I help?
> Customer: Pickup from 500 Roncesvalles Ave going to 220 King St E.
> Agent: Got it. Package size and weight?
> Customer: Large, around 20kg, furniture parts.
> Agent: That'll need our cargo van — same-day standard or next-day work fine for that size. Which would you like?
> Customer: Next-day is fine.
> Agent: Name and phone number, please?
> Customer: Amara Dubois, 416-555-1187.
> Agent: Booked — quote heading to your phone now.
Outcome: order_captured — all fields present.

**Transcript 20:**
> Agent: Thanks for calling Acme Courier, this is Ava.
> Customer: I need a pickup from 45 Bloor St W to 610 Dundas St W.
> Agent: Got it. What's in the package and roughly how much does it weigh?
> Customer: Small box of samples, 1.5kg.
> Agent: Same-day standard, express, or next-day?
> Customer: Standard, no rush.
> Agent: Name and phone number?
> Customer: Youssef Tremblay, 416-555-8843, youssef.t@example.com.
> Agent: You're booked — quote's on the way to your email.
Outcome: order_captured — all fields present.

## 2. Incomplete intake

**Transcript 3:**
> Agent: Acme Courier, this is Ava.
> Customer: I need a pickup today.
> Agent: Sure — what's the pickup address?
> Customer: It's on Dundas, near the intersection with Bathurst. I don't have the exact number handy.
> Agent: No problem, can you check and text it to this number, or would you like me to note "Dundas St W near Bathurst" for now and follow up?
> Customer: Just note it for now, I'll confirm later.
Outcome: escalated — flagged for follow-up, address incomplete.

**Transcript 4:**
> Agent: Acme Courier, how can I help?
> Customer: I need to send a package to my sister.
> Agent: Happy to help — what's the pickup address and the drop-off address?
> Customer: Pickup is 12 Roncesvalles Ave. I don't actually know her new address off the top of my head.
> Agent: That's okay — I'll hold this as a pending request. Can I get your phone number so we can finish the booking once you have it?
Outcome: escalated — missing dropoff, held as pending.

**Transcript 21:**
> Agent: Acme Courier, this is Ava.
> Customer: Hi, need a courier for a small package.
> Agent: Sure — what's the pickup address?
> Customer: 88 College St.
> Agent: And the drop-off?
> Customer: Um, actually I'm not sure of the postal code, just "somewhere on Yonge Street near Eglinton."
> Agent: That's a bit too broad to book directly — can I hold this as pending and have you confirm the exact address by text?
> Customer: Yeah, sure.
Outcome: escalated — dropoff address incomplete, held pending confirmation.

**Transcript 22:**
> Agent: Thanks for calling Acme, this is Ava.
> Customer: I need to book a pickup, but I forgot the weight of the package. It's just a box of files though.
> Agent: No problem, we can estimate it as a small-to-medium box for now and the driver will confirm on pickup. What's the pickup address?
> Customer: 400 Spadina Ave.
> Agent: And the drop-off?
> Customer: Actually, hold on, let me call you back — I need to check with my coworker first.
Outcome: escalated — customer ended call before completing booking.

**Transcript 23:**
> Agent: Acme Courier, how can I help?
> Customer: Pickup from my place, going downtown somewhere.
> Agent: Can I get the exact pickup address?
> Customer: 71 Danforth Ave.
> Agent: And the drop-off address downtown?
> Customer: I don't have it exactly, it's a law office on Bay Street, I think.
> Agent: I'll note "Bay Street law office, exact address pending" and flag this for a follow-up call to confirm the details.
Outcome: escalated — dropoff address not specific enough to book.

**Transcript 24:**
> Agent: Acme Courier, this is Ava.
> Customer: Need a pickup, it's urgent.
> Agent: Of course — what's the pickup address?
> Customer: 233 King St E.
> Agent: And where's it going?
> Customer: [background noise, muffled] Sorry, can you hold on a sec... [pause] ...okay I'm back, it's going to 500 Queen St W.
> Agent: No worries. What's the package size and weight?
> Customer: I actually don't know, my colleague packed it.
> Agent: That's fine, we'll estimate medium and the driver can confirm at pickup. Name and phone number?
> Customer: Chloe Ivanov, 416-555-2201.
Outcome: order_captured — package details estimated, rest complete.

**Transcript 25:**
> Agent: Acme Courier, this is Ava.
> Customer: I want to book a delivery but I'm not at the pickup location right now.
> Agent: That's fine — do you have the pickup address handy?
> Customer: 900 Bathurst St, but I won't be there until later this afternoon.
> Agent: Understood. What time should we plan for pickup?
> Customer: Not sure yet, can I call back with a time?
> Agent: Sure, I'll hold this as a pending booking until you confirm the pickup window.
Outcome: escalated — pickup time missing, held as pending.

**Transcript 26:**
> Agent: Thanks for calling Acme, this is Ava.
> Customer: Pickup from 55 Coxwell Ave.
> Agent: And the drop-off address?
> Customer: 610 St Clair Ave W... actually wait, I think it might be St Clair Ave E, let me check.
> Agent: Take your time.
> Customer: Sorry, I'll need to call back, I don't have it confirmed.
Outcome: escalated — dropoff address uncertain, customer will call back.

**Transcript 27:**
> Agent: Acme Courier, this is Ava.
> Customer: I need something delivered but I don't have the recipient's phone number yet.
> Agent: That's okay for now — what's the pickup and drop-off address?
> Customer: Pickup 320 Ossington Ave, drop-off 88 Yonge St.
> Agent: Got both. Package size?
> Customer: Small, a couple kilos.
> Agent: I can book this now without the recipient's number, or hold it until you have it — which would you prefer?
> Customer: Just book it, I'll add the number later.
Outcome: order_captured — recipient phone missing but not required to book.

**Transcript 28:**
> Agent: Acme Courier, how can I help?
> Customer: I need a pickup, my address is 145 Roncesvalles... actually I might be misremembering the number, hold on let me check my mail.
> Agent: No rush, take your time.
> Customer: Sorry, actually I don't have my glasses, I can't read the label. Can I text this to you later?
> Agent: Absolutely, I'll hold this as pending until you send the confirmed address.
Outcome: escalated — pickup address unconfirmed, held pending.

## 3. Ambiguous intake

**Transcript 5:**
> Customer: I need this there as fast as possible.
> Agent: Understood — that would be our same-day express service, which guarantees a 2-hour window. Should I book that?
> Customer: Yeah whatever's fastest.
Outcome: order_captured — agent resolved ambiguity by mapping to express tier.

**Transcript 6:**
> Customer: Just get it there today sometime, no rush really, but not tomorrow.
> Agent: That sounds like same-day standard — delivered today, no fixed 2-hour window. Sound right?
> Customer: Yeah that works.
Outcome: order_captured — agent resolved ambiguity by mapping to standard tier.

**Transcript 29:**
> Customer: I don't need it today, but soon-ish.
> Agent: When you say "soon-ish," would tomorrow by end of day work? That would be our next-day service.
> Customer: Yeah, tomorrow's fine.
Outcome: order_captured — agent clarified vague timing into next-day tier.

**Transcript 30:**
> Customer: It's not huge but it's kind of heavy, I guess medium-large?
> Agent: To help size it correctly — is it more like a shoebox, a small suitcase, or bigger than that?
> Customer: About the size of a small suitcase, maybe 12kg.
> Agent: That sounds like our Large size class. I'll book it as that.
Outcome: order_captured — agent narrowed vague size description into a size class.

**Transcript 31:**
> Customer: Can you get it there before 5?
> Agent: What time is it now, and where's the pickup from?
> Customer: It's 2pm, pickup is 90 Bathurst St.
> Agent: That fits within our same-day express 2-hour window. I'll book express to make the 5pm target.
Outcome: order_captured — agent translated a deadline into the correct tier.

**Transcript 32:**
> Customer: I just need it there whenever, doesn't matter.
> Agent: If timing truly doesn't matter, next-day service would save you the most — should I book that?
> Customer: Sure, whatever's cheapest.
Outcome: order_captured — agent defaulted to next-day given explicit low urgency.

**Transcript 33:**
> Customer: It's kind of urgent but not crazy urgent.
> Agent: Would same-day standard work — delivered sometime today, just not a guaranteed 2-hour window? Or do you need the guaranteed window, which is our express tier?
> Customer: The guaranteed one, just to be safe.
Outcome: order_captured — agent offered both options and let customer choose the tier.

**Transcript 34:**
> Customer: I need it there really soon, like within the hour if possible.
> Agent: Our fastest guaranteed option is a 2-hour express window — I can't guarantee within the hour, but express will move it as quickly as possible. Should I book that?
> Customer: Okay, that'll have to do.
Outcome: order_captured — agent set realistic expectations while mapping to express.

**Transcript 35:**
> Customer: Not sure if I need express or not, what's the price difference?
> Agent: Standard would be about $18 for this size and zone, express would be around $29 given the 1.6x rate for the guaranteed 2-hour window.
> Customer: I'll just do standard then.
Outcome: order_captured — agent clarified pricing to resolve the tier decision.

**Transcript 36:**
> Customer: I want it there today but I don't care about a specific window.
> Agent: That's exactly what same-day standard covers — delivered today, no fixed 2-hour window. I'll book that.
> Customer: Perfect, thanks.
Outcome: order_captured — agent confirmed standard tier matched the stated need.

## 4. Off-topic

**Transcript 7:**
> Customer: Hi, I'm calling about an order I placed yesterday, I want to know where it is.
> Agent: I can help with that — that's a tracking question rather than a new booking. Can I get the phone number or order confirmation you used?
Outcome: off_topic — routed to WISMO flow, not a new order.

**Transcript 8:**
> Customer: Do you guys deliver on weekends?
> Agent: We do offer weekend service in some zones — let me check availability for your area. What's your pickup postal code?
Outcome: off_topic — general inquiry, not an order; answered and offered booking.

**Transcript 37:**
> Customer: What happens if my package gets damaged?
> Agent: We cover declared value up to $200 CAD per package at no extra cost, and you can add coverage for higher-value items at booking. Would you like to book a delivery today, or is this about an existing order?
> Customer: Just asking in general, thanks.
Outcome: off_topic — policy question, answered without booking.

**Transcript 38:**
> Customer: Can I pay by e-transfer instead of credit card?
> Agent: Yes, we accept e-transfer as well as credit card and, for commercial accounts, monthly billing. Would you like to set up a booking now?
> Customer: Not right now, just wanted to know.
Outcome: off_topic — payment method inquiry, no booking made.

**Transcript 39:**
> Customer: I think my driver was rude to me yesterday, I want to complain.
> Agent: I'm sorry to hear that — this needs to go to a dispatcher directly so they can look into it properly. Can I get your name and the order details so I can pass this along right away?
> Customer: Sure, it's Ravi Al-Farsi, order was yesterday afternoon.
Outcome: escalated — complaint routed to human dispatcher, not resolved by agent.

**Transcript 40:**
> Customer: How do I delete my account and personal data with you?
> Agent: That's a data request I need to route to our support team directly rather than handle automatically — can I get your name and the phone number on file so they can follow up?
> Customer: Sofia Kim, 416-555-7743.
Outcome: escalated — privacy/data-deletion request routed to human, not resolved by agent.

**Transcript 41:**
> Customer: Do you ship internationally?
> Agent: We currently only service the Greater Toronto Area — we don't offer cross-border or international courier service. I'd recommend a national or international courier for that.
> Customer: Ah okay, thanks anyway.
Outcome: off_topic — service area question, answered, no booking.

**Transcript 42:**
> Customer: What's the biggest package you can take?
> Agent: Our standard service covers up to 50kg in our XL size class, which requires a cargo van. Anything heavier or needing special handling would need a custom quote.
> Customer: Got it, mine's under that, I'll call back to book.
Outcome: off_topic — size limit inquiry, answered, no booking made yet.

**Transcript 43:**
> Customer: I never got an invoice for last week's delivery.
> Agent: I can help look into that — invoices are usually sent by email after delivery is confirmed. Can I get your name and the approximate delivery date so I can check?
> Customer: Emma Nguyen, delivery was last Tuesday.
Outcome: escalated — billing issue flagged for dispatcher follow-up.

**Transcript 44:**
> Customer: What vehicle do you use for deliveries?
> Agent: We use cargo vans for large packages, motorcycles for fast single-package same-day and express jobs, and e-bikes for smaller downtown deliveries.
> Customer: Interesting, thanks for the info.
Outcome: off_topic — general inquiry, answered, no booking.

## 5. Multi-package

**Transcript 9:**
> Customer: I have three separate pickups today, all going to the same warehouse.
> Agent: No problem — let's go one at a time. First pickup address?
> Customer: 10 Spadina Ave, then 45 College St, then 120 Bathurst St, all going to 900 Eglinton Ave E.
> Agent: Got all three. Same package size and service tier for all of them, or different?
> Customer: Same — medium boxes, same-day standard for all three.
Outcome: order_captured — 3 linked orders created under one customer record.

**Transcript 10:**
> Customer: I need two pickups, different destinations though.
> Agent: Sure, let's take the first one. Pickup and drop-off?
> Customer: First: 33 Danforth Ave to 700 Lake Shore Blvd W. Second: 33 Danforth Ave to 15 Coxwell Ave.
> Agent: Got both. Same package details for each?
> Customer: First one's small, second one's a medium box.
Outcome: order_captured — 2 orders created, different sizes tracked separately.

**Transcript 45:**
> Customer: I need four packages picked up from the same address, all going to different clients.
> Agent: Sure, let's go through them one at a time. Pickup address for all four?
> Customer: 500 King St E for all of them.
> Agent: Got it. First drop-off?
> Customer: 12 Roncesvalles Ave, small box.
> Agent: Second?
> Customer: 88 Yonge St, medium box.
> Agent: Third and fourth?
> Customer: 610 Dundas St W, small, and 900 Bathurst St, small.
> Agent: All four captured — I'll send a combined quote for all four orders.
Outcome: order_captured — 4 linked orders created under one pickup address.

**Transcript 46:**
> Customer: Two pickups from different addresses but both going to the same place.
> Agent: Sure — first pickup and the shared drop-off?
> Customer: First pickup 45 Ossington Ave, second pickup 300 Spadina Ave, both going to 700 Queen St W.
> Agent: Got it. Package details for each?
> Customer: Both are large boxes, around 15kg each.
> Agent: Same service tier for both?
> Customer: Yes, next-day for both.
Outcome: order_captured — 2 orders from different pickups to one destination.

**Transcript 47:**
> Customer: I have a bunch of packages, like six or seven, going to different customers around the city.
> Agent: That's a fair number — let's capture them one at a time, or if you have a list, I can note the pickup address now and follow up for the full list of destinations.
> Customer: Actually let me just email you the list, it'll be faster.
> Agent: That works — I'll flag this as a bulk order pending your list, and a dispatcher will follow up on pricing since this may qualify for a commercial rate.
Outcome: escalated — bulk order routed to dispatcher for custom handling.

**Transcript 48:**
> Customer: Two packages, one pickup, one drop-off, but different sizes.
> Agent: Sure — what's the pickup and drop-off address?
> Customer: Pickup 233 King St E, drop-off 500 Queen St W for both.
> Agent: Got it. Sizes for each?
> Customer: One's small, one's extra-large — the big one is some furniture hardware.
> Agent: Noted, the XL one will need a cargo van. Same service tier for both?
> Customer: Same-day standard for both.
Outcome: order_captured — 2 orders, different sizes, same route.

**Transcript 49:**
> Customer: I need three pickups from three different addresses, all same destination, all urgent.
> Agent: Understood — let's go one at a time, starting with the first pickup address.
> Customer: 55 Coxwell Ave, 610 St Clair Ave W, and 145 Roncesvalles Ave, all going to 88 College St.
> Agent: Got all three. Since it's urgent, should I book all three as same-day express?
> Customer: Yes, please.
Outcome: order_captured — 3 linked express orders from different pickups.

**Transcript 50:**
> Customer: One pickup, two drop-offs at the same address but for two different people.
> Agent: Got it — pickup address?
> Customer: 900 Coxwell Ave, both going to 15 Yonge St, different units though.
> Agent: Understood, I'll note the unit numbers separately for each. What are the unit numbers?
> Customer: Unit 4 and unit 9.
> Agent: Got both — package details for each?
> Customer: Both small, same-day standard.
Outcome: order_captured — 2 orders, same building, different units.

**Transcript 51:**
> Customer: I have five drop-offs from one pickup, this is for a marketing campaign, samples going out.
> Agent: That's a good volume — I can capture the pickup address now, and given the volume, this may qualify for a commercial rate. Should I connect you with a dispatcher for that, or book at standard per-package pricing for now?
> Customer: Let's just book standard for now, I need it out today.
> Agent: Understood, let's go through the five addresses one at a time.
Outcome: order_captured — 5 linked orders, standard per-package pricing, dispatcher note added for future commercial rate discussion.

**Transcript 52:**
> Customer: Two packages, same pickup and drop-off, just want them tracked separately.
> Agent: No problem — pickup and drop-off address?
> Customer: 610 Dundas St W to 300 Spadina Ave.
> Agent: Got it. Any difference between the two packages?
> Customer: One's documents, one's a small electronics item, both small.
> Agent: I'll create two separate orders so they're tracked individually. Same service tier for both?
> Customer: Yes, same-day standard.
Outcome: order_captured — 2 separate orders for tracking purposes, identical route.

## 6. Hostile / impatient

**Transcript 11:**
> Customer: This is the third time I've called, why is this so hard.
> Agent: I'm sorry for the trouble — let's get this sorted right now. What's the pickup address?
> Customer: [address given tersely, short answers throughout]
> Agent: [stays calm, confirms each detail back, completes booking in minimal turns]
Outcome: order_captured — de-escalated, no transfer needed.

**Transcript 12:**
> Customer: I don't have time for twenty questions, just send someone.
> Agent: Understood — I just need the pickup address and drop-off address, that's it, then you're booked.
> Customer: [provides addresses only, refuses size/weight]
> Agent: That's enough to get started — I'll estimate the size as medium and a driver will confirm on pickup. You're booked.
Outcome: order_captured — agent used sensible defaults rather than stalling or transferring.

**Transcript 53:**
> Customer: Your website's down, your phone line took forever, this better be quick.
> Agent: Apologies for the wait — I can get you booked in under a minute. Pickup address?
> Customer: 55 Bathurst St, and don't ask me twenty questions.
> Agent: Just the drop-off and I'm done — where's it going?
> Customer: 900 Queen St W.
> Agent: Booked, same-day standard, quote's on its way.
Outcome: order_captured — agent minimized questions to match customer's impatience.

**Transcript 54:**
> Customer: I already told the other guy all this, why do I have to repeat it.
> Agent: I apologize for that — I don't have the previous notes in front of me, so let's get it done quickly this time. Pickup address?
> Customer: [short, clipped answers]
> Agent: [confirms each detail back quickly, avoids repeating unnecessary questions]
Outcome: order_captured — de-escalated despite frustration about repeated calls.

**Transcript 55:**
> Customer: This is ridiculous, I just need a pickup, not a whole interview.
> Agent: Understood, let's keep it short — pickup and drop-off address?
> Customer: 233 King St E to 500 Queen St W.
> Agent: Got it, booking as same-day standard with a medium size estimate, driver will confirm at pickup.
> Customer: Fine, whatever, just get it done.
Outcome: order_captured — agent minimized friction and used defaults to close quickly.

**Transcript 56:**
> Customer: I've been on hold forever, this is unacceptable.
> Agent: I completely understand, and I'm sorry for the wait — let's get you booked right away. What's the pickup address?
> Customer: [terse, annoyed responses throughout]
> Agent: [remains calm, confirms details efficiently, does not become defensive]
Outcome: order_captured — de-escalated, agent stayed composed throughout.

**Transcript 57:**
> Customer: If this doesn't work I'm switching couriers, just so you know.
> Agent: I hear you, let's make sure this one goes smoothly. Pickup address?
> Customer: 45 Ossington Ave, drop-off 700 Lake Shore Blvd W.
> Agent: Got it. Same-day standard or express?
> Customer: Just get it there today, I don't care about the window.
> Agent: Standard it is — you're booked.
Outcome: order_captured — agent addressed concern briefly, then moved efficiently through booking.

**Transcript 58:**
> Customer: Why do I need to give my phone number, just send the driver.
> Agent: The phone number is only used so the driver can reach you if there's an issue at pickup — I do need that to complete the booking.
> Customer: Fine, 416-555-0021.
> Agent: Thank you — you're all booked.
Outcome: order_captured — agent explained the requirement briefly rather than arguing, customer complied.

**Transcript 59:**
> Customer: Your prices are way too high, this is a scam.
> Agent: I understand the concern — our pricing is based on zone distance, package size, and service tier, all shown in the quote before you confirm. Would you like me to walk through how this quote was calculated?
> Customer: No, just book it, I don't have a choice anyway.
> Agent: Understood, booking now — pickup address?
Outcome: order_captured — agent addressed the objection factually without escalating tension, then proceeded.

**Transcript 60:**
> Customer: I want to speak to a real person, not a robot.
> Agent: I can absolutely transfer you to a dispatcher if you'd prefer — or I can get this booked in under a minute myself, whichever you'd like.
> Customer: ...fine, just book it then.
> Agent: Great, pickup address?
Outcome: order_captured — agent offered human escalation but customer opted to continue with the agent.

---

## Prompt template to generate additional transcripts (optional, toward the 80 upper bound)

Use this with the Claude API (or any capable LLM) to generate more beyond the 60
above, if you want to push toward the 80 upper bound. Run in batches of ~10, vary
the category each batch.

```
Generate 10 realistic customer-agent phone call transcripts for "Acme Courier Co.",
a same-day courier company in Toronto, ON. The AI agent's name is Ava. Category for
this batch: {category}. Vary customer tone, completeness of information, and
realism (interruptions, corrections, background noise mentions). Each transcript
should end with one of these outcomes: order_captured, escalated, or off_topic.
Use real-sounding Toronto street names and plausible Canadian phone number formats.
Output as markdown, one transcript per numbered block, with an "Outcome:" line
after each.
```

Categories to cycle through: clean_intake, incomplete_intake, ambiguous_intake,
off_topic, multi_package, hostile_impatient.
