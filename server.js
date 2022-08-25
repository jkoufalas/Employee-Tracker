//Include Packages
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();

//setup basic querys to print tables
const queryDeparments = "SELECT * FROM department";
const queryRoles = `SELECT role.id, title, department.name "department", salary FROM role
join department where department.id = role.department_id`;
const queryEmployee = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name "department", role.salary ,CONCAT( manager.first_name, " ", manager.last_name) AS "manager"
FROM employee
join role ON role.id = employee.role_id
join department ON department.id = role.department_id
left join employee as manager on manager.id = employee.manager_id`;

//application title
const applicationHeader = `

███████╗███╗░░░███╗██████╗░██╗░░░░░░█████╗░██╗░░░██╗███████╗███████╗
██╔════╝████╗░████║██╔══██╗██║░░░░░██╔══██╗╚██╗░██╔╝██╔════╝██╔════╝
█████╗░░██╔████╔██║██████╔╝██║░░░░░██║░░██║░╚████╔╝░█████╗░░█████╗░░
██╔══╝░░██║╚██╔╝██║██╔═══╝░██║░░░░░██║░░██║░░╚██╔╝░░██╔══╝░░██╔══╝░░
███████╗██║░╚═╝░██║██║░░░░░███████╗╚█████╔╝░░░██║░░░███████╗███████╗
╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░░╚══════╝░╚════╝░░░░╚═╝░░░╚══════╝╚══════╝

███╗░░░███╗░█████╗░███╗░░██╗░█████╗░░██████╗░███████╗██████╗░
████╗░████║██╔══██╗████╗░██║██╔══██╗██╔════╝░██╔════╝██╔══██╗
██╔████╔██║███████║██╔██╗██║███████║██║░░██╗░█████╗░░██████╔╝
██║╚██╔╝██║██╔══██║██║╚████║██╔══██║██║░░╚██╗██╔══╝░░██╔══██╗
██║░╚═╝░██║██║░░██║██║░╚███║██║░░██║╚██████╔╝███████╗██║░░██║
╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝░╚═════╝░╚══════╝╚═╝░░╚═╝

`

//these are the arrays that hold the lists for use in the prompts
var roleArray;
var departmentArray;
var employeeArray;
var managerArray;

//setup connection to mysql database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: process.env.DB_USER,
    // MySQL password
    password: process.env.DB_PASSWORD,
    // MySQL database
    database: process.env.DB_NAME
  },
  console.log(`Connected to the employee_tracker_db database.`)
);

//the questions the main menu
const mainMenuQuestions = [
  {
    type: 'list',
    name: 'main_menu',
    message: 'What would you like to do?',
    choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role', 'update employee managers', 'view employees by manager', 'view employees by department', 'delete a department', 'delete a role', 'delete an employee', 'view department utilization', 'Quit'],
  },
 ];
  
 //question to add department
 const addDepartmentQuery = [
  {
    type: 'input',
    name: 'department',
    message: 'What is the name of the Department?',
  },
 ];
  
var addRoleQuery;
var addEmployeeQuery;
var updateRoleQuery;
var updateManagerQuery;
var viewManagerQuery;
var deleteDepartmentQuery;
var deleteRoleQuery;
var deleteEmployeeQuery;
var viewDepartmentUtilQuery;

  //this prints out a basis query to a table
  function databaseQuery(query){
    //writes the header
    db.query(query, (err,rows) => {
      console.log(`\n`);
      console.table(rows);
      console.log(`\n`);
      mainMenu();
    });
  }

  //this adds the employees in the database to a list
  async function setupEmployeeList(){
    employeeArray = [];
    let [result] = await db.promise().query(`select CONCAT( first_name, " ", last_name) AS full_name from employee`);
    result.forEach(element => {
      employeeArray.push(element.full_name);
    });

    //once the array is set up, update the list of questions that use this array.
    setupEmployeeQuestion();
    setupUpdateEmployeeRoleQuestion();
    setupUpdateEmployeeManagerQuestion();
    setupManagerList();
    setupDeleteEmployeeQuestion();
  };

  //list of questions for creating an employee
  function setupEmployeeQuestion(){
    addEmployeeQuery = [
      {
        type: 'input',
        name: 'firstName',
        message: `What is the Employee's first name?`,
      },
      {
        type: 'input',
        name: 'lastName',
        message: `What is the Employee's last name?`,
      },
      {
        type: 'list',
        name: 'role',
        message: `What is the Employee's role?`,
        choices: roleArray,
      },
      {
        type: 'list',
        name: 'manager',
        message: `Who is the Employee's manager?`,
        choices: ['None', ...employeeArray],
      },
    ];

  }
  
  //this adds the role in the database to a list
  async function setupRoleList(){
    roleArray = [];
    let result = await db.promise().query(`select title from role`);
    result = result[0];
    result.forEach(element => {
      roleArray.push(element.title);
    });
    //once the array is set up, update the list of questions that use this array.
    setupEmployeeQuestion();
    setupDeleteRoleQuestion();
  }

  //this adds the role in the database to a list
  async function setupManagerList(){
    managerArray = [];
    let [result] = await db.promise().query(`select distinct CONCAT( manager.first_name, " ", manager.last_name) as fullName from employee right join employee as manager on manager.id = employee.manager_id`);
    result.forEach(element => {
      managerArray.push(element.fullName);
    });
    //once the array is set up, update the list of questions that use this array.
    setupManagerQuestion();
  }

  //sets up the question to list employees for a manager
  function setupManagerQuestion(){
    viewManagerQuery = [
     {
       type: 'list',
       name: 'manager',
       message: 'Which manager do you want to list Employees for?',
       choices: managerArray,
     },
   ];
 }

  //sets up the question to list employees for a department
  function setupEmployeebyDepartmentQuestion(){
  viewEmployeeByDepartmentQuery = [
   {
     type: 'list',
     name: 'department',
     message: 'Which department do you want to list Employees for?',
     choices: departmentArray,
   },
 ];
}

  //sets up the question to display the total utilized budget for a department
  function setupDepartmentUtilizationQuestion(){
  viewDepartmentUtilQuery = [
   {
     type: 'list',
     name: 'department',
     message: 'Which department do you want to view the budget utilization?',
     choices: departmentArray,
   },
 ];
}

  //sets up the question of which department to delete
  function setupDeleteDepartmentQuestion(){
  deleteDepartmentQuery = [
   {
     type: 'list',
     name: 'department',
     message: 'Which department do you want to Delete?',
     choices: departmentArray,
   },
 ];
}

  //sets up the question of which role to delete
  function setupDeleteRoleQuestion(){
  deleteRoleQuery = [
   {
     type: 'list',
     name: 'role',
     message: 'Which role do you want to Delete?',
     choices: roleArray,
   },
 ];
}

  //sets up the question of which employee to delete
  function setupDeleteEmployeeQuestion(){
  deleteEmployeeQuery = [
   {
     type: 'list',
     name: 'employee',
     message: 'Which employee do you want to Delete?',
     choices: employeeArray,
   },
 ];
}

  //this adds the department in the database to a list
  async function setupDepartmentList(){
    departmentArray = [];
    let [result] = await db.promise().query(`select name from department`);
    result.forEach(element => {
      departmentArray.push(element.name);
    });
    //once the array is set up, update the list of questions that use this array.
    setupDepartmentQuestion();
    setupEmployeebyDepartmentQuestion();
    setupDeleteDepartmentQuestion();
    setupDepartmentUtilizationQuestion();
  }

  function setupDepartmentQuestion(){
    addRoleQuery = [
     {
       type: 'input',
       name: 'title',
       message: 'What is the name of the role?',
     },
     {
       type: 'input',
       name: 'salary',
       message: 'What is the salary of the role?',
     },
     {
       type: 'list',
       name: 'department',
       message: 'What would you like to do now...',
       choices: departmentArray,
     },
   ];
 }

  //sets up the question to update an employee's role
  function setupUpdateEmployeeRoleQuestion(){
  updateRoleQuery = [
   {
     type: 'list',
     name: 'employee',
     message: `What Employee's Role do you want to update?`,
     choices: employeeArray,
   },
   {
     type: 'list',
     name: 'role',
     message: 'Which role do you want to assign the selected employee?',
     choices: roleArray,
   },

 ];
}

  //sets up the question to update an employee's manager
  function setupUpdateEmployeeManagerQuestion(){
  updateManagerQuery = [
   {
     type: 'list',
     name: 'employee',
     message: `What Employee do you want to update?`,
     choices: employeeArray,
   },
   {
     type: 'list',
     name: 'manager',
     message: 'What Manager do you to assign to the Employee?',
     choices: ['None', ...employeeArray],
   },

 ];
}

  //function to add an new employee
  function insertEmployee(){
    inquirer
    .prompt(addEmployeeQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      insertEmployeetoDatabase(answers.firstName, answers.lastName, answers.role, answers.manager)
    });
  }

  async function insertEmployeetoDatabase(firstName, lastName, title, managerName){
    //extract first and last name from combined names
    const [manager_first, manager_last] = managerName.split(' ');
    //get count to see if employee already exists
    let [[{count}]] = await db.promise().query(`select count(*) as count from employee where first_name = ? AND last_name = ?`, [firstName, lastName]);
    //get role id from title
    let [[{id: role_id}]] = await db.promise().query(`select id from role where title = ?`, title);
    
    //if the user select no manager to for employee
    if(managerName === 'None'){
      var manager_id = null;
    }else{
      //if manager was selected get id
      var [[{id: manager_id}]] = await db.promise().query(`select id from employee where first_name = ? AND last_name = ?`, [manager_first, manager_last]);
    }
     //if the employee already exists print it
    if(count > 0){
      console.log(`Error: Employee "${firstName} ${lastName}" already exists.`);
    }else{
      //otherwise insert into database
      const insert = await db.promise().query(`insert into employee(first_name, last_name, role_id, manager_id) Values (?, ?, ?, ?)`, [firstName, lastName, role_id, manager_id]);
      console.log(`Employee "${firstName} ${lastName}" created.`);
    } 
    //update the role list array and then questions list inside
    setupEmployeeList();
    //ask user what to do now
    mainMenu();
  }

  function insertDepartment(){
    inquirer
    .prompt(addDepartmentQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      insertDepartmenttoDatabase(answers.department);
    });
  }

  async function insertDepartmenttoDatabase(department){
    //find out if the department already exists in the database
    let [[{count}]] = await db.promise().query(`select count(*) as count from department where name = ?`, department);
     if(count > 0){
      //if it does print that it already exists
      console.log(`Error: Department "${department}" already exists.`);
    }else{
      //otherwise add to database
      const insert = await db.promise().query(`insert into department(name) Values (?)`, department);
      console.log(`Department "${department}" created.`);
    } 
    //update the department list array 
    setupDepartmentList();
    //ask user what to do now
    mainMenu();
  }

  function insertRole(){
    //writes the header
    inquirer
    .prompt(addRoleQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
        insertRoletoDatabase(answers.title, answers.department, answers.salary);
    });
  }

  function updateEmployeeRole(){
    //writes the header
    inquirer
    .prompt(updateRoleQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      updateEmployeesRoletoDatabase(answers.employee, answers.role);
    });
  }

  async function updateEmployeesRoletoDatabase(employee, role){
    //extract first and last name from combined names
    const [firstName, lastName] = employee.split(' ');
    //find role and employee id
    let [[{id: role_id}]] = await db.promise().query(`select id from role where title = ?`, role);
    let [[{id: employee_id}]] = await db.promise().query(`select id from employee where first_name = ? AND last_name = ?`, [firstName, lastName]);

    //update to database
    const update = await db.promise().query(`update employee SET role_id = ? WHERE id = ?`, [role_id, employee_id]);
    console.log(`Employee role updated.`);
    //ask user what to do now
    mainMenu();
  }

  function updateEmployeeManager(){
    //writes the header
    inquirer
    .prompt(updateManagerQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      updateEmployeesManagertoDatabase(answers.employee, answers.manager);
    });
  }

  async function updateEmployeesManagertoDatabase(employee, manager){
    //extract first and last name from combined names
    const [firstName, lastName] = employee.split(' ');
    //get id of employee
    let [[{id: employee_id}]] = await db.promise().query(`select id from employee where first_name = ? AND last_name = ?`, [firstName, lastName]);
    //if the user selected no manager
    if(manager === 'None'){
      //update manager with null
      const insert = await db.promise().query(`update employee SET manager_id = null WHERE id = ?`, employee_id);
      console.log(`Employee's Manager updated.`);
    }else{
      //extract first and last name from combined name
      const [manager_first, manager_last] = manager.split(' ');
      //check if the user selected a manager and employee as the same person
      if(firstName === manager_first && lastName === manager_last){
        //if so then print error
        console.log(`Error: Manager and employee cannot be the same.`);
      }else{
        //otherwise update with new manager
        //get manager id
        let [[{id: manager_id}]] = await db.promise().query(`select id from employee where first_name = ? AND last_name = ?`, [manager_first, manager_last]);
        //update database with new manager
        const update = await db.promise().query(`update employee SET manager_id = ? WHERE id = ?`, [manager_id, employee_id]);
        console.log(`Employee's Manager updated.`);
      }
    }
    //update the manager list array 
    setupManagerList();
    //ask user what to do now
    mainMenu();
  }

  function viewEmployeeByManager(){
    //writes the header
    inquirer
    .prompt(viewManagerQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      viewEmployeeByManagerFromDatabase(answers.manager);
    });
  }

  async function viewEmployeeByManagerFromDatabase(manager){
    //extract first and last name from combined names
    const [firstName, lastName] = manager.split(' ');
    //get manager id
    let [[{id: manager_id}]] = await db.promise().query(`select id from employee where first_name = ? AND last_name = ?`, [firstName, lastName]);
    //get results of query with manager
    let [result] = await db.promise().query(`select first_name, last_name from employee where manager_id = ?`, manager_id);
    //print result to table
    console.log(`${manager} has the following Employee's`);
    console.log(`\n`);
    console.table(result);
    console.log(`\n`);

    //ask user what to do now
    mainMenu();
  }

  function viewEmployeeByDepartment(){
    //writes the header
    inquirer
    .prompt(viewEmployeeByDepartmentQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      viewEmployeeByDepartmentFromDatabase(answers.department);
    });
  }

  async function viewEmployeeByDepartmentFromDatabase(department){
    //get department id
    let [[{id: department_id}]] = await db.promise().query(`select id from department where name = ?`, department);
    //get results of query with depaartment
    let [result] = await db.promise().query(`select first_name, last_name from employee join role on employee.role_id = role.id join department on role.department_id = department.id where department_id = ?`, department_id);
    //print result to table
    console.log(`${department} has the following Employee's`);
    console.log(`\n`);
    console.table(result);
    console.log(`\n`);

    //ask user what to do now
    mainMenu();
  }
  

  function deleteDepartment(){
    inquirer
    .prompt(deleteDepartmentQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      deleteDepartmentFromDatabase(answers.department);
    });
  }

  async function deleteDepartmentFromDatabase(department){
    //delete department query
    let result = await db.promise().query(`delete from department where name = ?`, department);
    console.log(`${department} has been deleted`);
    //update department list
    setupDepartmentList();
    //ask user what to do now
    mainMenu();
  }
  
  function deleteRole(){
    inquirer
    .prompt(deleteRoleQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      deleteRoleFromDatabase(answers.role);
    });
  }

  async function deleteRoleFromDatabase(role){
    //delete role query
    let result = await db.promise().query(`delete from role where title = ?`, role);
    console.log(`${role} has been deleted`);
    //update list of roles
    setupRoleList();
    //ask user what to do now
    mainMenu();
  }

  function deleteEmployee(){
    inquirer
    .prompt(deleteEmployeeQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      deleteEmployeeFromDatabase(answers.employee);
    });
  }

  async function deleteEmployeeFromDatabase(employee){
    //extract first and last name from combined names
    const [firstName, lastName] = employee.split(' ');
    let result = await db.promise().query(`delete from employee where first_name = ? AND last_name = ?`, [firstName, lastName]);
    console.log(`${employee} has been deleted`);
    setupEmployeeList();
    //ask user what to do now
    mainMenu();
  }

  
  function viewDeptUtilization(){
    //writes the header
    inquirer
    .prompt(viewDepartmentUtilQuery)
    //wait for response to all question and then use answers
    .then((answers) => {
      //execute function to process answers
      viewDeptUtilizationQuery(answers.department);
    });
  }

  async function viewDeptUtilizationQuery(department){
    //get department id
    let [[{id: department_id}]] = await db.promise().query(`select id from department where name = ?`, department);
    //run utilization query
    let [result] = await db.promise().query(`select SUM(role.salary) AS "budget utilization" from employee join role on employee.role_id = role.id join department on role.department_id = department.id where department_id = ?`, department_id);
    
    //display result in table
    console.log(`${department} has the following budget utilization`);
    console.log(`\n`);
    console.table(result);
    console.log(`\n`);
    //ask user what to do now
    mainMenu();
  }

  async function insertRoletoDatabase(role, department, salary){
    //check if role is already in database
    let [[{count}]] = await db.promise().query(`select count(*) as count from role where title = ?`, role);
    //get department id
    let [[{id: department_id}]] = await db.promise().query(`select id from department where name = ?`, department);
    //if role exists
    if(count > 0){
      //tell the user it already exists
      console.log(`Error: Role "${role}" already exists.`);
    }else{
      //otherwise add role to database
      const insert = await db.promise().query(`insert into role(department_id, title, salary) Values (?, ?, ?)`, [department_id, role, salary]);
      console.log(`:Role "${role}" created.`);
    } 
    //update the role list array
    setupRoleList();
    //ask user what to do now
    mainMenu();
  }

  //the first question is the manager, so this method asks the manager questions, then uses recursion to ask if the user would like to continue
  function mainMenu(){
    inquirer
    .prompt(mainMenuQuestions)
    //wait for response to all question and then use answers
    .then((answers) => {
      //answer of main menu is what to do next
      switch (answers.main_menu) {
        case 'view all departments':
          databaseQuery(queryDeparments);
          break;
        case 'view all roles':
          databaseQuery(queryRoles);
          break;
        case 'view all employees':
          databaseQuery(queryEmployee);
            break;
        case 'add a department':
          insertDepartment();
            break;
        case 'add a role':
          insertRole();
            break;
        case 'add an employee':
          insertEmployee();
          break;
        case 'update an employee role':
          updateEmployeeRole();
          break;
        case 'update employee managers':
          updateEmployeeManager();
          break;
        case 'view employees by manager':
          viewEmployeeByManager();
          break;
        case 'view employees by department':
          viewEmployeeByDepartment();
          break;
        case 'delete a department':
          deleteDepartment();
          break;
        case 'delete a role':
          deleteRole();
          break;
        case 'delete an employee':
          deleteEmployee();
          break;
        case 'view department utilization':
          viewDeptUtilization();
          break;
        case 'Quit':
          //when finishing close database to finish application
          db.end();
      }
    });

  }

  // App initialisation
function init() {

  //update all lists from current values in database and process all questions with these lists
  setupRoleList();
  setupDepartmentList();
  setupEmployeeList();
  setupManagerList();
  //print out application header
  console.log(applicationHeader);
  //take user to main menu
  mainMenu();
}
  
  // Function call to initialize app
  init();
