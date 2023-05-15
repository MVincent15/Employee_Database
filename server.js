const inquirer = require('inquirer');
const mysql = require('mysql2');

require("dotenv").config();

const createDB = () => {
  const db = mysql.createConnection({
    host: '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  return db;
};

const db = createDB();

function startEmployeeDB() {
  inquirer.prompt({
    type: "list",
    name: "startOptions",
    message: "Please Choose from One of the Following",
    choices: [
      "View all Departments",
      "View all Roles",
      "View all Employees",
      "Add a Department",
      "Add a Role",
      "Add an Employee",
      "Update an Employee Role",
      "Quit"
    ]

  }).then(answer => {
    switch (answer.startOptions) {
      case "View all Departments":
        db.query(`SELECT * FROM department`, (err, res) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          console.table(res);
          startEmployeeDB();
        });
        break;
      case "View all Roles":
        db.query(`SELECT * FROM role`, (err, res) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          console.table(res);
          startEmployeeDB();
        });
        break;
      case "View all Employees":
        const selectionEmployee = `SELECT employee.id, employee.first_name, employee.last_name, 
              role.title AS title, department.name AS department, role.salary AS salary,
              CASE WHEN employee.manager_id is NOT NULL THEN CONCAT(manager.first_name,' ', manager.last_name) ELSE NULL END AS manager
              FROM employee
              LEFT JOIN role ON employee.role_id = role.id
              LEFT JOIN department ON role.department_id = department.id
              LEFT JOIN employee manager ON manager.id = employee.manager_id`;
        db.query(selectionEmployee, (err, res) => {
          if (err) throw err;
          console.table(res);
          startEmployeeDB();
        });
        break;
      case "Add a Department":
        inquirer.prompt({
          type: "input",
          name: "department",
          message: "Please Enter New Department Name"
        }).then(answer => {
          db.query(`INSERT INTO department (name) VALUES (?)`, answer.department, (err, res) => {
            if (err) throw err;
            console.log("Department added.");
            startEmployeeDB();
          });
        });
        break;
      case "Add a Role":
        inquirer.prompt([
          {
            type: "input",
            name: "title",
            message: "Please Enter the New Role"
          },
          {
            type: "input",
            name: "salary",
            message: "Please Enter the New Salary for the Role"
          },
          {
            type: "input",
            name: "department",
            message: "Please Enter the Department the New Role Belongs"
          }
        ]).then(function (res) {
          db.query("SELECT id FROM department WHERE name = ?", [res.department], function (err, result) {
            if (err) {
              console.error(err);
              startEmployeeDB();
            } else {
              if (result.length > 0) {
                var departmentId = result[0].id;
                db.query("INSERT INTO role(title, salary, department_id) VALUES (?,?,?)", [res.title, res.salary, departmentId], function (err, data) {
                  if (err) {
                    console.error(err);
                    startEmployeeDB();
                  } else {
                    console.log("Role added successfully!");
                    startEmployeeDB();
                  }
                });
              } else {
                console.error("Department not found!");
                startEmployeeDB();
              }
            }
          });
        });
        break;
      case "Add an Employee":
        inquirer.prompt([
          {
            type: "input",
            name: "first_name",
            message: "Please enter the new employee's first name"
          },
          {
            type: "input",
            name: "last_name",
            message: "Please enter the new employee's last name"
          },
          {
            type: "input",
            name: "role",
            message: "Please enter the role for the new employee"
          },
          {
            type: "input",
            name: "manager",
            message: "Please enter the manager of the new employee (leave blank for no manager)"
          }
        ]).then(function (res) {
          db.query("SELECT id FROM role WHERE title = ?", [res.role], function (err, result) {
            if (err) {
              console.error(err);
              startEmployeeDB();
            } else {
              if (result.length > 0) {
                var roleId = result[0].id;
                var managerId = null;
                if (res.manager.trim() !== "") {
                  db.query("SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?", [res.manager], function (err, result) {
                    if (err) {
                      console.error(err);
                      startEmployeeDB();
                    } else {
                      if (result.length > 0) {
                        managerId = result[0].id;
                      }
                      inputEmployeeInfo(res.first_name, res.last_name, roleId, managerId);
                    }
                  });
                } else {
                  inputEmployeeInfo(res.first_name, res.last_name, roleId, managerId);
                }
              } else {
                console.error("Role not found!");
                startEmployeeDB();
              }
            }
          });
        });

        function inputEmployeeInfo(firstName, lastName, roleId, managerId) {
          db.query("INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [firstName, lastName, roleId, managerId], function (err, data) {
            if (err) {
              console.error(err);
              startEmployeeDB();
            } else {
              console.log("Success! Employee added");
              db.query("SELECT * FROM employee WHERE first_name = ? AND last_name = ?", [firstName, lastName], function (err, result) {
                if (err) {
                  console.error(err);
                  startEmployeeDB();
                } else {
                  console.table(result);
                  startEmployeeDB();
                }
              });
            }
          });
        }
        break;
      case "Update an Employee Role":
        inquirer.prompt([
          {
            type: "input",
            name: "employee",
            message: "Which employee would you like to update?"
          },
          {
            type: "input",
            name: "role",
            message: "Please enter the new role for this employee"
          }
        ]).then(function (res) {
          db.query("UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE CONCAT(first_name, ' ', last_name) = ?", [res.role, res.employee], function (err, data) {
            if (err) {
              console.error(err);
              startEmployeeDB();
            } else {
              console.log("Employee updated.");

              db.query("SELECT * FROM employee", (err, result) => {
                if (err) {
                  console.error(err);
                  startEmployeeDB();
                } else {
                  console.table(result);
                  startEmployeeDB();
                }
              });
            }
          });
        });
        break;
      case "Quit":
        db.end();
        break;
    }
  })
}

startEmployeeDB();






