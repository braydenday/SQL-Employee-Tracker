-- creates department, role, and employee tables and work database
drop database if exists work_db;

create database work_db;

use work_db;

create table department (
    id int not null auto_increment primary key,
    name varchar(30) not null
);

create table role (
    id int not null auto_increment primary key,
    title varchar(30) not null,
    department_id int,
    salary decimal,
    foreign key (department_id)
    references department(id)
    on delete cascade
);

create table employee (
    id int not null auto_increment primary key,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int,
    manager_id int,
    foreign key (role_id)
    references role(id),
    foreign key (manager_id)
    references employee(id)
    on delete set null
);


