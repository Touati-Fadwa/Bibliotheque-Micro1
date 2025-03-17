
# Database Setup Instructions

This document explains how to set up the PostgreSQL database for the Bibliothèque ISET Tozeur application.

## Requirements

- PostgreSQL (version 12 or higher)
- psql command line tool

## Setup Steps

1. **Install PostgreSQL**:

   For Ubuntu/Debian:
   ```
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

   For macOS (using Homebrew):
   ```
   brew install postgresql
   ```

   For Windows, download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/).

2. **Start PostgreSQL Service**:

   For Ubuntu/Debian:
   ```
   sudo service postgresql start
   ```

   For macOS:
   ```
   brew services start postgresql
   ```

   For Windows, it should start automatically after installation.

3. **Run the Database Initialization Script**:

   ```
   psql -U postgres -f init.sql
   ```

   You'll be prompted for the PostgreSQL superuser password.

4. **Update Connection Settings**:

   Modify the `.env` file in the `back` directory to match your PostgreSQL configuration:

   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=bibliotheque_iset
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

## Verification

To verify that the database has been set up correctly:

1. Connect to the database:
   ```
   psql -U postgres -d bibliotheque_iset
   ```

2. List tables:
   ```
   \dt
   ```

   You should see the `users`, `books`, and `borrowings` tables.

3. Query the sample student:
   ```
   SELECT username, email FROM users WHERE role = 'student';
   ```

   You should see the sample student entry.

## Production Considerations

For a production environment:

1. Use a strong password for the PostgreSQL user
2. Configure proper network security settings
3. Set up regular database backups
4. Consider using SSL for database connections
