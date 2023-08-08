insert into department (name)
values ("human resources"),
("finance"),
("sales"),
("marketing"),
("production");

insert into role (title, department_id, salary)
values ("hr manager", 1, 70000),
("hr associate", 1, 50000),
("finance manager", 2, 90000),
("finance associate", 2, 75000),
("sales manager", 3, 105000),
("sales associate", 3, 95000),
("marketing manager", 4, 85000),
("marketing associate", 4, 55000),
("production manager", 5, 75000),
("production associate", 5, 45000);

-- manager id points to role id
insert into employee (first_name, last_name, role_id, manager_id)
values ("sean", "test", 1, null),
("maria", "tester", 2, 1),
("robert", "tests", 3, null),
("yan", "bacon", 4, 3),
("david", "bacons", 5, null),
("john", "egg", 6, 5),
("ali", "eggs", 7, null),
("ana", "brunch", 8, 7),
("mohamed", "dinner", 9, null),
("michael", "doe", 10, 9);