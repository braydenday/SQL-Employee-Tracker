async function startApp() {
// import required packages
const inquirer = require("inquirer");
const mysql = await import("mysql2/promise");


require("dotenv").config();


const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;


// connects to work_db
async function dbConnection(select) {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    let returnedRowsFromDb = [];
    let returnedOutputFromInq = [];

    // switch for all the user input cases in db
    switch (select) {
      // id, name in department table sql
      case "view departments":
        returnedRowsFromDb = await db.query("SELECT * FROM department");
        console.table(returnedRowsFromDb[0]); // needs to be part of array?
        break;

      // role id, job title, department id, salary in roles table sql
      case "view roles":
        returnedRowsFromDb = await db.query(`
                  SELECT
                      role.id,
                      role.title,
                      role.salary,
                      department.name AS department
                  FROM role
                  JOIN department ON role.department_id = department.id
                  `);
        console.table(returnedRowsFromDb[0]);
        break;

      // employee id, first name, last name, job title, department, salary and manager in employee table sql
      case "view employees":
        returnedRowsFromDb = await db.query(`
                  SELECT
                      employee.id,
                      employee.first_name,
                      employee.last_name,
                      role.title AS title,
                      department.name AS department,
                      role.salary AS salary,
                      CASE WHEN employee.manager_id IS NOT NULL THEN CONCAT(manager_table.first_name,' ', manager_table.last_name) ELSE NULL END AS manager
                  FROM employee
                  JOIN role ON employee.role_id = role.id
                  JOIN department ON role.department_id = department.id
                  JOIN employee manager_table ON employee.manager_id = manager_table.id
                  `);
        console.table(returnedRowsFromDb[0]);
        break;




      // add a department
      case "add department":
        returnedOutputFromInq = await inquirer.prompt([
          {
            name: "department",
            message: "enter new department:",
          },
        ]);

        try {
          // adds department into database
          returnedRowsFromDb = await db.query(
            `INSERT INTO department (name) VALUES ('${returnedOutputFromInq.department}');`
          );
        } catch (error) {
          console.log("error: duplicate");
        }
        break;



      // add a role
      case "add role":
        returnedOutputFromInq = await inquirer.prompt([
          {
            name: "roleName",
            message: "enter new role:",
          },
          {
            name: "roleSalary",
            message: "enter new salary:",
          },
          {
            name: "roleDpt",
            message: "enter new department:",
          },
        ]);

        const { roleName, roleSalary, roleDpt } = returnedOutputFromInq;

        // store value from the database to get department Ids
        const returnDepartmentId = await db.query(
          `SELECT IFNULL((SELECT id FROM department WHERE name = "${roleDpt}"), "Department doesnt exist")`
        );

        // pull department id from name
        const [rows] = returnDepartmentId;
        const department_id = Object.values(rows[0])[0];

        // error if ID doesnt exist in database
        if (department_id === "Department doesnt exist") {
          console.log("error: enter role in department");
          break;
        }

        // adds roll into database
        returnedRowsFromDb = await db.query(
          ` INSERT INTO role (title, salary, department_id) VALUES ('${roleName}', '${roleSalary}', '${department_id}');`
        );
        break;




      // add a employee
      case "add employee":
        returnedOutputFromInq = await inquirer.prompt([
          {
            name: "first_name",
            message: "enter new employee's first name:",
          },
          {
            name: "last_name",
            message: "enter new employee's last name:",
          },
          {
            name: "role",
            message: "enter new employee's role:",
          },
          {
            name: "manager",
            message: "enter new employee's manager:",
          },
        ]);

        const allRoles = await db.query("select * from role;");

        const allManagers = await db.query(
          "select * from employee where manager_id is null;"
        );
        // return output from inquirer
        const { first_name, last_name, role, manager } = returnedOutputFromInq;

        const role_data = allRoles[0].filter((r) => {
          return r.title === role;
        });
        // return managers
        const manager_data = allManagers[0].filter((m) => {
          return `${m.first_name} ${m.last_name}` === manager;
        });
        // add employee in database
        returnedRowsFromDb = await db.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${first_name}', '${last_name}', ${role_data[0].id}, ${manager_data[0].id})`
        );
        break;




      // update employee role in database
      case "update employee role":
        currentEmployees = await db.query(`
                  SELECT id, first_name, last_name FROM employee;`);

        currentRoles = await db.query(`
                  SELECT id, title FROM role;`);

        const employeeList = currentEmployees[0].map((employee) => {
          return {
            name: `${employee["first_name"]} ${employee.last_name}`,
            value: employee.id,
          };
        });

        const roleList = currentRoles[0].map((role) => {
          return {
            name: role.title,
            value: role.id,
          };
        });

        returnedOutputFromInq = await inquirer.prompt([
          {
            type: "list",
            name: "employeeId",
            message: "pick employee to update:",
            choices: employeeList,
          },
          {
            type: "list",
            name: "newRole",
            message: "enter employee new role:",
            choices: roleList,
          },
        ]);
        console.log(returnedOutputFromInq);

        // update into database
        returnedRowsFromDb = await db.query(`
                      UPDATE employee
                      SET role_id = ${returnedOutputFromInq.newRole}
                      WHERE employee.id = ${returnedOutputFromInq.employeeId};`);
        break;
    }
    // catch any errors if error
  } catch (err) {
    console.log(err);
  }
}



// user prompt using inquirer to navigate the database
async function userPrompt() {
  try {
    const res = await inquirer.prompt([
      {
        type: "list",
        name: "select",
        message: "please select one",
        choices: [
          "view departments",
          "view roles",
          "view employees",
          "add department",
          "add role",
          "add employee",
          "update employee role",
          "quit",
        ],
      },
    ]);

    await dbConnection(res.select);

    if (res.select === "quit") {
      process.exit();
    } else {
      await userPrompt();
    }
  } catch (err) {
    console.error(err);
  }
}

userPrompt();
}

startApp();