-- CreateTable
CREATE TABLE `users_3d` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` INTEGER NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` INTEGER NULL,
    `user_id` INTEGER NULL,
    `company` INTEGER NULL,
    `creator` VARCHAR(191) NOT NULL,
    `updater` VARCHAR(191) NULL,
    `linkedUser` VARCHAR(191) NULL,

    UNIQUE INDEX `users_3d_email_key`(`email`),
    UNIQUE INDEX `users_3d_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
