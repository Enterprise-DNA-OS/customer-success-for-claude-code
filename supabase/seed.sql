insert into success.accounts(id,name,owner,segment,contact,notice_evidence,retention_review_on,security_review_on) values
('10000000-0000-4000-8000-000000000001','Harbour Analytics','Aroha','growth','Casey, operations lead',null,current_date-7,current_date+60),
('10000000-0000-4000-8000-000000000002','Kauri Software','Ben','enterprise','Morgan, director','Demo notice assessment',current_date+180,current_date+90),
('10000000-0000-4000-8000-000000000003','Southern Data','Aroha','standard','Taylor, manager','Demo notice assessment',current_date+180,current_date-2)
on conflict do nothing;
insert into success.contracts(id,account_id,name,starts_on,renews_on,arr_cents,currency) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Harbour annual',current_date-340,current_date+25,2400000,'NZD'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Kauri annual',current_date-310,current_date+55,4800000,'AUD'),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Southern annual',current_date-372,current_date-7,1200000,'NZD')
on conflict do nothing;
insert into success.usage(id,account_id,name,observed_on,active_users,licensed_users,evidence) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Weekly usage',current_date-2,6,30,'Fictional usage extract'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Weekly usage',current_date-2,45,50,'Fictional usage extract'),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Old usage',current_date-40,9,10,'Fictional stale extract') on conflict do nothing;
insert into success.touchpoints(id,account_id,name,occurred_on,sentiment,actor) values
('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Sponsor concerned about adoption',current_date-8,'negative','Aroha'),
('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Quarterly value review agreed',current_date-3,'positive','Ben'),
('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Last check-in',current_date-45,'neutral','Aroha') on conflict do nothing;
insert into success.actions(id,account_id,name,owner,due_on) values
('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Arrange adoption workshop','Aroha',current_date-3),
('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Confirm renewal scope','Ben',current_date+7) on conflict do nothing;
insert into success.objectives(id,account_id,name,due_on) values
('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Twenty active operators',current_date-5),
('60000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Monthly reporting adopted',current_date+10) on conflict do nothing;
