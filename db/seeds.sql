insert into department (name)
values ("human resources"),
("finance"),
("sales"),
("marketing"),
("production");

insert into role (title, department_id, salary)
values ("hr manager", 1, 75000)

insert into employee (first_name, last_name, role_id, manager_id)
values ("sean", "test", 1, null)