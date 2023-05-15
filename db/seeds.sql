INSERT INTO department (name)
VALUES ("Marketing"),
       ("Finance"),
       ("IT"),
       ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Marketing Manager", 150000, 1),
       ("Marketing Lead", 100000, 1),
       ("Finance Manager", 90000, 2),
       ("Accountant", 70000, 2),
       ("IT Manager", 100000, 3),
       ("Senior Data Analyst", 85000, 3),
       ("Sales Manager", 70000, 4),
       ("Junior Salesperson", 50000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Lela", "Herrara", 1 , NULL),
       ("Sal", "Finley", 2 , 1),
       ("Louie", "Jacobson", 3 , NULL),
       ("Eli", "Santiago", 4 , 3),
       ("Haley", "Potter", 5 , NULL),
       ("Harlen", "Stevens", 6 , 5),
       ("Paris", "White", 7 , NULL),
       ("Burt", "Day", 8 , 7);
