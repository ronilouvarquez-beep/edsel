export type AppRole = "admin" | "staff" | "customer"

export function getDashboardPath(role: unknown) {
  const normalizedRole = String(role ?? "").trim().toLowerCase()

  switch (normalizedRole) {
    case "admin":
    case "administrator":
    case "superadmin":
      return "/admin"
    case "staff":
      return "/staff"
    default:
      return "/customer"
  }
}