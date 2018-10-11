# heimap-project-management-backend
Heimap Project Management Backend

# Install dependencies

```npm install express --save```

```npm install body-parser```

```npm install cors```

```npm install pg-promise```

```sudo npm install -g pm2```

# Start server

```node server```

# Prepare database 

# Install postgresql

```sudo apt update```

```sudo apt install postgresql postgresql-contrib```

# Switch to postgres user, change password and run SQLs

```sudo -i -u postgres```

```psql```

```ALTER USER heimapadmin WITH PASSWORD 'heimap';```

# Create table 

```CREATE DATABASE heimap_proj_man WITH OWNER heimapadmin;```

# Ceate tables

```CREATE TABLE auth_key_tbl (p_key SERIAL PRIMARY KEY, user_id INTEGER, timestmp TIMESTAMP, auth_key INTEGER, validity BOOLEAN);```

```CREATE TABLE user_tbl (p_key SERIAL PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT, username TEXT, pass TEXT, organisation TEXT, about TEXT, timestmp TIMESTAMP);```

```CREATE TABLE proj_tbl (p_key SERIAL PRIMARY KEY, proj_name TEXT, organisation TEXT, funder TEXT, description TEXT, timestmp TIMESTAMP);```

```CREATE TABLE role_tbl (p_key SERIAL PRIMARY KEY, user_id INTEGER, role_proj TEXT, proj_id INTEGER);```

# Auto Start Server on server reboot 

https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04 - Read the PM2 Section

# PSQL common commands ***

```\l``` list databases

```\dt``` list tables
