-- Bocusto Guitars — content + admin schema.
-- Lives on the same MySQL server as `bocusto_luthier` but in its own database,
-- so the two sites can be backed up, restored and moved independently.

CREATE DATABASE IF NOT EXISTS `bocusto_guitars`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `bocusto_guitars`;

-- Admin accounts for this site. Logins also fall back to the shared
-- `bocusto_luthier`.`users` table (see SHARED_USERS_DB), so one account can
-- open both admin panels as long as both apps use the same JWT_SECRET.
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every editable string / image URL on the public site, addressed by a dotted
-- path such as `models.hero.title` or `gallery.plates.2.image`.
-- Only values the admin has actually changed are stored; anything absent falls
-- back to the defaults shipped in the frontend, so the site renders correctly
-- against an empty table.
CREATE TABLE IF NOT EXISTS `page_config` (
  `key` VARCHAR(191) PRIMARY KEY,
  `page` VARCHAR(50) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `updated_by` VARCHAR(100) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_page` (`page`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter signups, commission requests and contact enquiries were kept in
-- memory while the site had no database; they persist here now.
CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `commissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `model` VARCHAR(120) DEFAULT NULL,
  `message` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(120) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
