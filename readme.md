# Comics engineering

## Technology stack

### Databases

* Main : PostgreSQL
* Secondary (unplugable features) : MongoDB

### Backend

* Technology : Java
* Framework : Javalin & jOOQ

Before compiling, generate the jOOQ files:

> * Set environement variables for the Postgres DataBase
> * Go to `backend/comics-backend`
> * Run `./gradlew clean :app:generateJooq --no-build-cache --rerun-tasks`
> * After that, you can start to run the Java code

### Frontend

* Framework : React
