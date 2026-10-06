-- Human-friendly order numbers (e.g. 10693) that customers can quote to the bot.
create sequence if not exists orders_order_number_seq start 10000;

alter table orders
  add column if not exists order_number text unique
  default lpad(nextval('orders_order_number_seq')::text, 5, '0');

update orders
  set order_number = lpad(nextval('orders_order_number_seq')::text, 5, '0')
  where order_number is null;
