"""
Nexordis — Phase 0 synthetic order generator for Acme Courier Co.

Generates a realistic order dataset per roadmap section 3.2:
  - 500-700 records
  - business-hours/weekday bias on created_at
  - at least 15% deliberate edge cases (incomplete address, late same-day,
    cancel/rebook, oversized package, duplicate entries, out-of-area)
  - Toronto-format addresses/postal codes
  - full field set matching sql/schema.sql `orders` table

Usage:
    python3 generate_synthetic_orders.py --count 600 --out ../data/acme_orders_synthetic.csv

No external services required — pure stdlib, zero cost, deterministic with --seed.
"""

import argparse
import csv
import random
import uuid
from datetime import datetime, timedelta, time

COMPANY_ID = "acme-001"

FIRST_NAMES = ["James","Priya","Wei","Fatima","Liam","Sofia","Noah","Aisha","Mateo",
               "Chloe","Ravi","Emma","Youssef","Grace","Daniel","Amara","Lucas","Mei",
               "Omar","Isabella"]
LAST_NAMES = ["Chen","Singh","Ahmed","Tremblay","Kowalski","Nguyen","Osei","Patel",
              "Reyes","Ivanov","Kim","Costa","Brown","Al-Farsi","Dubois"]

TORONTO_STREETS = ["Queen St W","King St E","Dundas St W","Bloor St W","Yonge St",
                    "College St","Spadina Ave","Bathurst St","St Clair Ave W",
                    "Eglinton Ave E","Danforth Ave","Lake Shore Blvd W","Ossington Ave",
                    "Roncesvalles Ave","Coxwell Ave"]

# Rough Toronto FSAs (first 3 chars of postal code) by zone, for plausible distribution
ZONE_FSA = {
    1: ["M5V","M5G","M5B","M5T"],           # downtown core
    2: ["M6J","M6K","M4M","M4Y"],           # inner ring
    3: ["M4C","M6P","M6H","M4E"],           # mid ring
    4: ["M9V","M1E","M2N","M3H"],           # outer ring
}

SIZES = ["S", "M", "L", "XL"]
TIERS = ["same_day_standard", "same_day_express", "next_day"]
VEHICLES = ["cargo_van", "motorcycle", "e_bike"]
STATUSES = ["pending", "quoted", "confirmed", "in_transit", "delivered", "cancelled"]
CHANNELS_WEIGHTED = ["phone"] * 60 + ["web_form"] * 25 + ["email"] * 15


def rand_postal(zone: int) -> str:
    fsa = random.choice(ZONE_FSA[zone])
    return f"{fsa} {random.randint(1,9)}{random.choice('ABCDEFGHJKLMNPRSTVWXYZ')}{random.randint(1,9)}"


def rand_address(zone: int) -> str:
    num = random.randint(10, 999)
    street = random.choice(TORONTO_STREETS)
    unit = f" Unit {random.randint(1,40)}" if random.random() < 0.3 else ""
    return f"{num} {street}{unit}, Toronto, ON {rand_postal(zone)}"


def biased_timestamp(base_date: datetime) -> datetime:
    """Business-hours/weekday biased timestamp, peaks 8-10am and 2-4pm."""
    if random.random() < 0.85:  # weekday bias
        while base_date.weekday() >= 5:
            base_date -= timedelta(days=1)
    peak = random.random()
    if peak < 0.35:
        hour = random.randint(8, 9)
    elif peak < 0.65:
        hour = random.randint(14, 15)
    else:
        hour = random.randint(7, 18)
    minute = random.randint(0, 59)
    return base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)


def gen_customer():
    name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    phone = f"+1-416-{random.randint(200,999)}-{random.randint(1000,9999)}"
    email = name.lower().replace(" ", ".") + f"{random.randint(1,99)}@example.com"
    return name, phone, email


def base_order(order_index: int, start_date: datetime, edge_case: str = None) -> dict:
    zone = random.randint(1, 4)
    created = biased_timestamp(start_date - timedelta(days=random.randint(0, 45)))
    name, phone, email = gen_customer()
    size = random.choice(SIZES)
    tier = random.choices(TIERS, weights=[55, 30, 15])[0]
    status = random.choices(STATUSES, weights=[5, 10, 15, 10, 55, 5])[0]
    weight = round(random.uniform(0.5, 25.0), 1)
    vehicle = random.choice(VEHICLES)
    channel = random.choice(CHANNELS_WEIGHTED)

    pickup = rand_address(zone)
    dropoff = rand_address(random.randint(1, 4))

    row = {
        "order_id": str(uuid.uuid4()),
        "company_id": COMPANY_ID,
        "created_at": created.isoformat(),
        "pickup_address": pickup,
        "dropoff_address": dropoff,
        "package_weight_kg": weight,
        "package_size": size,
        "service_tier": tier,
        "customer_name": name,
        "customer_phone": phone,
        "customer_email": email,
        "assigned_driver_id": "",
        "vehicle_class": vehicle,
        "status": status,
        "quoted_price_cad": "",
        "actual_delivery_timestamp": "",
        "pod_submitted": "false",
        "invoice_sent": "false",
        "intake_channel": channel,
        "edge_case": edge_case or "",
    }

    # base pricing so the CSV is usable to sanity-check the quote engine later
    base_rate = {1: 12, 2: 18, 3: 26, 4: 34}[zone]
    size_mult = {"S": 1.0, "M": 1.2, "L": 1.5, "XL": 2.0}[size]
    tier_mult = {"same_day_standard": 1.0, "same_day_express": 1.6, "next_day": 0.85}[tier]
    row["quoted_price_cad"] = round(base_rate * size_mult * tier_mult, 2)

    if status == "delivered":
        row["actual_delivery_timestamp"] = (created + timedelta(hours=random.uniform(1, 6))).isoformat()
        row["pod_submitted"] = random.random() < 0.9
        row["invoice_sent"] = random.random() < 0.7

    return row


def apply_edge_case(row: dict, case: str) -> dict:
    row["edge_case"] = case
    if case == "incomplete_address":
        row["dropoff_address"] = row["dropoff_address"].split(",")[0]  # strip city/postal
    elif case == "late_same_day":
        created = datetime.fromisoformat(row["created_at"])
        row["created_at"] = created.replace(hour=random.randint(16, 18), minute=random.randint(1, 59)).isoformat()
        row["service_tier"] = "same_day_express"
    elif case == "oversized_package":
        row["package_size"] = "XL"
        row["package_weight_kg"] = round(random.uniform(28, 60), 1)
        row["vehicle_class"] = "cargo_van"
    elif case == "duplicate_entry":
        pass  # handled by caller: emits a near-identical row separately
    elif case == "international_out_of_area":
        row["dropoff_address"] = "1 Peace Bridge Plaza, Buffalo, NY 14213, USA"
        row["status"] = "cancelled"
    elif case == "cancelled_rebooked":
        row["status"] = "cancelled"
    return row


def generate(count: int, seed: int, out_path: str):
    random.seed(seed)
    start_date = datetime(2026, 7, 10, 9, 0, 0)

    edge_case_target = max(int(count * 0.15), 1)
    edge_types = ["incomplete_address", "late_same_day", "cancelled_rebooked",
                  "oversized_package", "duplicate_entry", "international_out_of_area"]

    rows = []
    edge_count = 0
    idx = 0
    while len(rows) < count:
        idx += 1
        make_edge = edge_count < edge_case_target and random.random() < 0.20
        if make_edge:
            case = random.choice(edge_types)
            row = base_order(idx, start_date)
            row = apply_edge_case(row, case)
            rows.append(row)
            edge_count += 1
            if case == "duplicate_entry":
                dup = dict(row)
                dup["order_id"] = str(uuid.uuid4())
                created = datetime.fromisoformat(row["created_at"])
                dup["created_at"] = (created + timedelta(minutes=random.randint(5, 90))).isoformat()
                dup["edge_case"] = "duplicate_entry"
                rows.append(dup)
        else:
            rows.append(base_order(idx, start_date))

    rows = rows[:count]
    rows.sort(key=lambda r: r["created_at"])

    fieldnames = list(rows[0].keys())
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} orders ({edge_count} edge-case records, "
          f"{edge_count/len(rows)*100:.1f}%) -> {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=600)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--out", type=str, default="../data/acme_orders_synthetic.csv")
    args = parser.parse_args()
    generate(args.count, args.seed, args.out)
