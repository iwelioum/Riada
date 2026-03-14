/*DROP DATABASE IF EXISTS riada_db;*/

CREATE DATABASE IF NOT EXISTS riada_db
    DEFAULT CHARACTER SET  utf8mb4
    DEFAULT COLLATE        utf8mb4_0900_ai_ci;

USE riada_db;

SELECT
    SCHEMA_NAME                AS `Database`,
    DEFAULT_CHARACTER_SET_NAME AS `Charset`,
    DEFAULT_COLLATION_NAME     AS `Collation`
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'riada_db';
