# Team-Profile-Generator

## Description

This is an application that takes user input and generates a Team Profile web page 

The user is asked questions that will generate the content of the readme.
- There are 3 types of employees that are can be created to add to the team.
    - Manager, this employee type is the first one asked for and only 1 can be created.
        - The properties required are Name, ID, email and Office Number
    - Engineer, this employee type is created through the selection list and any number can be created.
        - The properties required are Name, ID, email and gitHub Name
    - Intern, this employee type is created through the selection list and any number can be created.
        - The properties required are Name, ID, email and School
<br>

## Table of Contents

- [GitHub Link](#link)
- [Installation Instructions](#install-instructions)
- [Executing Instructions](#)
- [Video Demo](#video-demo)
---

## Link

The link to the GitHub repository of the assignment is <br>
[https://github.com/jkoufalas/Team-Profile-Generator](https://github.com/jkoufalas/Team-Profile-Generator)

---

## Install Instructions

The dependancies are listed within the package.json file. The dependancies for this application are
 - inquirer@8.2.4
 - jest

Since the dependancies are listed within the lock file, they will autmatically installed with the following command

```
npm i
```
---

## Executing Instructions

```
node index.js
```

Follow the prompts to include the information for your team.

---
## Video Demo

[Link to Demo](https://youtu.be/12_rirfDNJk)

Select the 1080p option for better resolution of text.

The demonstration video covers the following. 
- The install instructions.
- How to run the application.
- A walkthrough of the application and sample responses to questions.
- Where to find the HTML file once generated.
- The HTML that is generated run within a browser.
---

## Sample HTML

A sample of a generated index.html can be located in the ./dist folder named index.html This is the file generated in the Demo video link.