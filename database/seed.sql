-- Demo tenant + pricing table + demo drivers (all fictional).
insert into companies (company_id, slug, name, service_city)
values ('e9937002-053d-4f65-8274-b3c2d6eb8037', 'acme-001', 'Acme Courier Co.', 'Toronto')
on conflict do nothing;

-- Price = base_rate_cad * tier_multiplier. Zone 1 = downtown (≤4 km from depot) ... zone 4 = outer GTA (≤50 km).
insert into pricing_config (company_id, zone, weight_class, service_tier, base_rate_cad, tier_multiplier)
select 'e9937002-053d-4f65-8274-b3c2d6eb8037', v.* from (values
(1,'L','next_day',32.00,0.85),(1,'L','same_day_express',32.00,1.60),(1,'L','same_day_standard',32.00,1.00),
(1,'M','next_day',22.00,0.85),(1,'M','same_day_express',22.00,1.60),(1,'M','same_day_standard',22.00,1.00),
(1,'S','next_day',15.00,0.85),(1,'S','same_day_express',15.00,1.60),(1,'S','same_day_standard',15.00,1.00),
(1,'XL','same_day_express',48.00,1.60),(1,'XL','same_day_standard',48.00,1.00),
(2,'L','next_day',37.00,0.85),(2,'L','same_day_express',37.00,1.60),(2,'L','same_day_standard',37.00,1.00),
(2,'M','next_day',27.00,0.85),(2,'M','same_day_express',27.00,1.60),(2,'M','same_day_standard',27.00,1.00),
(2,'S','next_day',20.00,0.85),(2,'S','same_day_express',20.00,1.60),(2,'S','same_day_standard',20.00,1.00),
(2,'XL','next_day',53.00,0.85),(2,'XL','same_day_express',53.00,1.60),(2,'XL','same_day_standard',53.00,1.00),
(3,'L','next_day',42.00,0.85),(3,'L','same_day_express',42.00,1.60),(3,'L','same_day_standard',42.00,1.00),
(3,'M','next_day',32.00,0.85),(3,'M','same_day_express',32.00,1.60),(3,'M','same_day_standard',32.00,1.00),
(3,'S','next_day',25.00,0.85),(3,'S','same_day_express',25.00,1.60),(3,'S','same_day_standard',25.00,1.00),
(3,'XL','next_day',58.00,0.85),(3,'XL','same_day_express',58.00,1.60),(3,'XL','same_day_standard',58.00,1.00),
(4,'L','next_day',47.00,0.85),(4,'L','same_day_express',47.00,1.60),(4,'L','same_day_standard',47.00,1.00),
(4,'M','next_day',37.00,0.85),(4,'M','same_day_express',37.00,1.60),(4,'M','same_day_standard',37.00,1.00),
(4,'S','next_day',30.00,0.85),(4,'S','same_day_express',30.00,1.60),(4,'S','same_day_standard',30.00,1.00),
(4,'XL','next_day',63.00,0.85),(4,'XL','same_day_express',63.00,1.60),(4,'XL','same_day_standard',63.00,1.00)
) as v(zone, weight_class, service_tier, base_rate_cad, tier_multiplier);

insert into drivers (company_id, full_name, phone, vehicle_class, pay_rate_per_delivery) values
('e9937002-053d-4f65-8274-b3c2d6eb8037','Marcus Chen','+14165550101','cargo_van',9.50),
('e9937002-053d-4f65-8274-b3c2d6eb8037','Priya Sharma','+14165550102','motorcycle',7.00),
('e9937002-053d-4f65-8274-b3c2d6eb8037','Diego Alvarez','+14165550103','e_bike',6.00),
('e9937002-053d-4f65-8274-b3c2d6eb8037','Hannah Okafor','+14165550104','cargo_van',9.50),
('e9937002-053d-4f65-8274-b3c2d6eb8037','Liam Tremblay','+14165550105','e_bike',6.00);
