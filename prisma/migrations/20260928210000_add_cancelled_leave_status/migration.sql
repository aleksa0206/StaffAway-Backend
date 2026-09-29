-- AlterTable
ALTER TABLE `LeaveRequest` MODIFY `status` ENUM('Pending', 'Approval', 'Rejected', 'Cancelled') NOT NULL;

-- AlterTable
ALTER TABLE `StatusHistory` MODIFY `oldStatus` ENUM('Pending', 'Approval', 'Rejected', 'Cancelled') NOT NULL,
    MODIFY `newStatus` ENUM('Pending', 'Approval', 'Rejected', 'Cancelled') NOT NULL;
