CREATE DATABASE IF NOT EXISTS nicasalud_contactos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nicasalud_contactos;

CREATE TABLE IF NOT EXISTS contactos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(190) NOT NULL,
  mensaje TEXT NOT NULL,
  pagina_origen VARCHAR(190) DEFAULT NULL,
  ip_origen VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_contactos_created_at (created_at),
  INDEX idx_contactos_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
