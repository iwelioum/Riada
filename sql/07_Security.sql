USE riada_db;

CREATE ROLE IF NOT EXISTS `role_gate_access`;
CREATE ROLE IF NOT EXISTS `role_billing_ops`;
CREATE ROLE IF NOT EXISTS `role_data_protection`;

CREATE USER IF NOT EXISTS 'portique_user'@'localhost' IDENTIFIED BY RANDOM PASSWORD;
CREATE USER IF NOT EXISTS 'billing_user'@'localhost' IDENTIFIED BY RANDOM PASSWORD;
CREATE USER IF NOT EXISTS 'dpo_user'@'localhost' IDENTIFIED BY RANDOM PASSWORD;

REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'portique_user'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'billing_user'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'dpo_user'@'localhost';

GRANT EXECUTE ON PROCEDURE riada_db.sp_CheckAccess TO `role_gate_access`;
GRANT EXECUTE ON PROCEDURE riada_db.sp_CheckAccessGuest TO `role_gate_access`;

GRANT EXECUTE ON PROCEDURE riada_db.sp_GenerateMonthlyInvoice TO `role_billing_ops`;
GRANT EXECUTE ON PROCEDURE riada_db.sp_ExpireElapsedInvoices TO `role_billing_ops`;
GRANT EXECUTE ON PROCEDURE riada_db.sp_ExpireElapsedContracts TO `role_billing_ops`;

GRANT EXECUTE ON PROCEDURE riada_db.sp_AnonymizeMember TO `role_data_protection`;
GRANT EXECUTE ON PROCEDURE riada_db.sp_FreezeContract TO `role_data_protection`;
GRANT EXECUTE ON PROCEDURE riada_db.sp_RenewContract TO `role_data_protection`;

GRANT `role_gate_access` TO 'portique_user'@'localhost';
GRANT `role_billing_ops` TO 'billing_user'@'localhost';
GRANT `role_data_protection` TO 'dpo_user'@'localhost';

SET DEFAULT ROLE `role_gate_access` TO 'portique_user'@'localhost';
SET DEFAULT ROLE `role_billing_ops` TO 'billing_user'@'localhost';
SET DEFAULT ROLE `role_data_protection` TO 'dpo_user'@'localhost';

ALTER USER 'portique_user'@'localhost' PASSWORD EXPIRE INTERVAL 180 DAY;
ALTER USER 'billing_user'@'localhost' PASSWORD EXPIRE INTERVAL 180 DAY;
ALTER USER 'dpo_user'@'localhost' PASSWORD EXPIRE INTERVAL 180 DAY;

FLUSH PRIVILEGES;

SHOW GRANTS FOR 'portique_user'@'localhost';
SHOW GRANTS FOR 'billing_user'@'localhost';
SHOW GRANTS FOR 'dpo_user'@'localhost';
