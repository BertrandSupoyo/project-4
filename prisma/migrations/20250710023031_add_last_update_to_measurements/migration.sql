-- CreateTable
CREATE TABLE `substations` (
    `id` VARCHAR(191) NOT NULL,
    `no` INTEGER NOT NULL,
    `ulp` VARCHAR(191) NOT NULL,
    `noGardu` VARCHAR(191) NOT NULL,
    `namaLokasiGardu` TEXT NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `merek` VARCHAR(191) NOT NULL,
    `daya` VARCHAR(191) NOT NULL,
    `tahun` VARCHAR(191) NOT NULL,
    `phasa` VARCHAR(191) NOT NULL,
    `jumlahTrafoDistribusi` VARCHAR(191) NOT NULL,
    `seksiGardu` VARCHAR(191) NOT NULL,
    `penyulang` VARCHAR(191) NOT NULL,
    `arahSequence` VARCHAR(191) NOT NULL,
    `jurusanRayaKota` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `lastUpdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `measurements_siang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `substationId` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `r` DOUBLE NOT NULL DEFAULT 0,
    `s` DOUBLE NOT NULL DEFAULT 0,
    `t` DOUBLE NOT NULL DEFAULT 0,
    `n` DOUBLE NOT NULL DEFAULT 0,
    `rn` DOUBLE NOT NULL DEFAULT 0,
    `sn` DOUBLE NOT NULL DEFAULT 0,
    `tn` DOUBLE NOT NULL DEFAULT 0,
    `pp` DOUBLE NOT NULL DEFAULT 0,
    `pn` DOUBLE NOT NULL DEFAULT 0,
    `row_name` VARCHAR(191) NOT NULL,
    `rata2` DOUBLE NULL DEFAULT 0,
    `kva` DOUBLE NULL DEFAULT 0,
    `persen` DOUBLE NULL DEFAULT 0,
    `unbalanced` DOUBLE NULL DEFAULT 0,
    `lastUpdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `measurements_siang_substationId_month_row_name_key`(`substationId`, `month`, `row_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `measurements_malam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `substationId` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `r` DOUBLE NOT NULL DEFAULT 0,
    `s` DOUBLE NOT NULL DEFAULT 0,
    `t` DOUBLE NOT NULL DEFAULT 0,
    `n` DOUBLE NOT NULL DEFAULT 0,
    `rn` DOUBLE NOT NULL DEFAULT 0,
    `sn` DOUBLE NOT NULL DEFAULT 0,
    `tn` DOUBLE NOT NULL DEFAULT 0,
    `pp` DOUBLE NOT NULL DEFAULT 0,
    `pn` DOUBLE NOT NULL DEFAULT 0,
    `row_name` VARCHAR(191) NOT NULL,
    `rata2` DOUBLE NULL DEFAULT 0,
    `kva` DOUBLE NULL DEFAULT 0,
    `persen` DOUBLE NULL DEFAULT 0,
    `unbalanced` DOUBLE NULL DEFAULT 0,
    `lastUpdate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `measurements_malam_substationId_month_row_name_key`(`substationId`, `month`, `row_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `measurements_siang` ADD CONSTRAINT `measurements_siang_substationId_fkey` FOREIGN KEY (`substationId`) REFERENCES `substations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `measurements_malam` ADD CONSTRAINT `measurements_malam_substationId_fkey` FOREIGN KEY (`substationId`) REFERENCES `substations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
