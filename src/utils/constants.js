export const UserRoleEnum = {
    ADMIN: 'admin',
    MEMBER: 'member',
}

export const AvailableUserRole = Object.values(UserRoleEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    REVIEW: "review",
    DONE: "done"
}
export const AvailableTaskStatus = Object.values(TaskStatusEnum);