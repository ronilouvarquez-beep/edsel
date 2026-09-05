"use client"

import { ChangeEvent, FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { createUser, deleteUser, listUsers, updateUser } from "@/app/actions/users"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  Columns3Icon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  ImagePlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react"

import { emptyAddressValue, PhAddressFields, type AddressValue } from "@/components/ph-address-fields"
import { parseAddress } from "@/lib/ph-address"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const ROLES = ["admin", "staff", "customer"] as const
type Role = (typeof ROLES)[number]

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  customer: "Customer",
}

function toDbRole(role: string): Role {
  const value = role.toLowerCase()
  return (ROLES as readonly string[]).includes(value) ? (value as Role) : "customer"
}

type User = {
  id: string
  first_name: string
  middle_name: string
  last_name: string
  address: string
  email: string
  phone: string
  role: Role
  avatar: string
}

function displayName(user: Pick<User, "first_name" | "middle_name" | "last_name">) {
  return [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ")
}

function initials(user: Pick<User, "first_name" | "last_name">) {
  return `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?"
}

function toUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id ?? ""),
    first_name: String(row.first_name ?? ""),
    middle_name: String(row.middle_name ?? ""),
    last_name: String(row.last_name ?? ""),
    address: String(row.address ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone_number ?? ""),
    role: toDbRole(String(row.role ?? "customer")),
    avatar: String(row.avatar_url ?? row.avatar ?? ""),
  }
}

const columnLabels = {
  name:    "Name",
  address: "Address",
  phone:   "Phone",
  role:    "Role",
} as const
type ColumnKey = keyof typeof columnLabels

function roleBadgeClass(role: Role | string) {
  switch (role) {
    case "admin":    return "bg-primary text-primary-foreground"
    case "staff":    return "bg-amber-500/15 text-amber-600 dark:text-amber-400"
    case "customer": return "bg-secondary text-secondary-foreground"
    default:         return ""
  }
}

function RoleIcon({ role }: { role: Role | string }) {
  if (role === "admin") return <ShieldIcon className="size-3" />
  if (role === "staff") return <WrenchIcon className="size-3" />
  return <UserIcon className="size-3" />
}

const EMPTY_FORM = { firstName: "", middleName: "", lastName: "", address: "", email: "", phone: "", password: "", confirmPassword: "", role: "customer" as Role, imagePreview: "" }

export function UsersTable() {
  const [users, setUsers]               = useState<User[]>([])
  const [search, setSearch]             = useState("")
  const [roleFilter, setRoleFilter]     = useState("All")
  const [page, setPage]                 = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [sortColumn, setSortColumn]     = useState<ColumnKey | null>(null)
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("asc")
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(
    { name: true, address: true, phone: true, role: true }
  )
  const [formData, setFormData]   = useState(EMPTY_FORM)
  const [addressValue, setAddressValue] = useState<AddressValue>(emptyAddressValue())
  const [savedAddress, setSavedAddress] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const addDialogRef    = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    listUsers().then(({ data, error }) => {
      if (error || !data) return
      setUsers(data.map((row) => toUser(row)))
    })
  }, [])

  /* ── counts ──────────────────────────────────────────────── */
  const counts = useMemo(() => ({
    total:    users.length,
    admin:    users.filter((u) => u.role === "admin").length,
    staff:    users.filter((u) => u.role === "staff").length,
    customer: users.filter((u) => u.role === "customer").length,
  }), [users])

  /* ── filtered / sorted / paginated ──────────────────────── */
  const filtered = useMemo(() => users.filter((u) => {
    const term = search.toLowerCase().trim()
    const matchesSearch = !term || Object.values(u).some((v) => String(v).toLowerCase().includes(term))
    return matchesSearch && (roleFilter === "All" || u.role === roleFilter)
  }), [users, search, roleFilter])

  const sorted = useMemo(() => {
    if (!sortColumn) return filtered
    return [...filtered].sort((a, b) => {
      const av = sortColumn === "name" ? displayName(a) : String(a[sortColumn])
      const bv = sortColumn === "name" ? displayName(b) : String(b[sortColumn])
      return sortDir === "asc" ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true })
    })
  }, [filtered, sortColumn, sortDir])

  const pageCount  = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  function closeAddDialog() {
    addDialogRef.current?.close()
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    const dialog = event.currentTarget
    const rect = dialog.getBoundingClientRect()
    const clickedInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    if (!clickedInside) dialog.close()
  }

  function sortBy(col: ColumnKey) {
    setSortDir(sortColumn === col && sortDir === "asc" ? "desc" : "asc")
    setSortColumn(col)
    setPage(1)
  }

  /* ── open add dialog ─────────────────────────────────────── */
  function openAdd() {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setAddressValue(emptyAddressValue())
    setSavedAddress("")
    setEmailError("")
    setPasswordError("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    if (imageInputRef.current) imageInputRef.current.value = ""
    addDialogRef.current?.showModal()
  }

  /* ── open edit dialog ────────────────────────────────────── */
  function openEdit(user: User) {
    if (user.role === "admin") return
    const parsed = parseAddress(user.address)
    setEditingId(user.id)
    setFormData({
      firstName:  user.first_name,
      middleName: user.middle_name,
      lastName:   user.last_name,
      address:    user.address,
      email:      user.email,
      phone:      user.phone,
      password:   "",
      confirmPassword: "",
      role:       user.role,
      imagePreview: user.avatar,
    })
    setAddressValue({
      ...emptyAddressValue(),
      street: parsed.street,
      province: parsed.province,
      municipality: parsed.municipality,
      barangay: parsed.barangay,
      address: user.address,
    })
    setSavedAddress(user.address)
    setEmailError("")
    setPasswordError("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    if (imageInputRef.current) imageInputRef.current.value = ""
    addDialogRef.current?.showModal()
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (formData.imagePreview.startsWith("blob:")) URL.revokeObjectURL(formData.imagePreview)
    field("imagePreview", URL.createObjectURL(file))
  }

  function clearImage() {
    if (formData.imagePreview.startsWith("blob:")) URL.revokeObjectURL(formData.imagePreview)
    field("imagePreview", "")
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const [submitting, setSubmitting] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  /* ── submit add / edit ───────────────────────────────────── */
  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd  = new FormData(form)
    const get = (k: string) => String(fd.get(k) ?? "").trim()

    const email = get("email")
    const duplicate = users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== editingId)
    if (duplicate) {
      setEmailError("This email is already in use.")
      return
    }

    if (!addressValue.province || !addressValue.municipality || !addressValue.barangay) {
      toast.error("Select a province, municipality, and barangay.")
      return
    }

    const firstName = get("firstName")
    const middleName = get("middleName")
    const lastName = get("lastName")
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ")
    const password = get("password")
    const confirmPassword = get("confirmPassword")
    if (!editingId && password.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      toast.error("Password must be at least 8 characters.")
      return
    }
    if (!editingId && password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      toast.error("Passwords do not match.")
      return
    }

    const payload = {
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      address: addressValue.address || get("address"),
      email,
      phone_number: get("phone"),
      role: toDbRole(get("role")),
    }
    const localUser = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      address: payload.address,
      email,
      phone: payload.phone_number,
      role: payload.role,
      avatar: formData.imagePreview,
    }

    setSubmitting(true)

    if (editingId) {
      const toastId = toast.loading("Saving changes…")
      const { error } = await updateUser(editingId, payload)

      setSubmitting(false)
      if (error) {
        toast.error("Failed to update user.", { id: toastId, description: error })
        return
      }
      setUsers((cur) => cur.map((u) => (u.id === editingId ? { ...u, ...localUser } : u)))
      toast.success(`${fullName} updated.`, { id: toastId })
    } else {
      const toastId = toast.loading("Adding user…")
      const { data, error } = await createUser({ ...payload, password })

      setSubmitting(false)
      if (error) {
        toast.error("Failed to add user.", { id: toastId, description: error })
        return
      }
      setUsers((cur) => [data ? { ...toUser(data), avatar: formData.imagePreview } : { id: crypto.randomUUID(), ...localUser }, ...cur])
      setPage(1)
      toast.success(`${fullName} added as ${ROLE_LABELS[payload.role]}.`, { id: toastId })
    }

    addDialogRef.current?.close()
    form.reset()
  }

  /* ── delete ──────────────────────────────────────────────── */
  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const toastId = toast.loading("Deleting user…")
    const { error } = await deleteUser(deleteTarget.id)

    setDeleting(false)
    if (error) {
      toast.error("Failed to delete user.", { id: toastId, description: error })
      return
    }
    const name = displayName(deleteTarget)
    setUsers((cur) => cur.filter((u) => u.id !== deleteTarget.id))
    setDeleteTarget(null)
    deleteDialogRef.current?.close()
    setPage(1)
    toast.success(`${name} removed.`, { id: toastId })
  }

  function openDelete(user: User) {
    if (user.role === "admin") return
    setDeleteTarget(user)
    deleteDialogRef.current?.showModal()
  }

  /* ── refresh ─────────────────────────────────────────────── */
  async function refreshUsers() {
    const toastId = toast.loading("Refreshing…")
    const { data, error } = await listUsers()

    if (error || !data) {
      setUsers([])
      toast.error("Failed to load users.", { id: toastId, description: error ?? undefined })
    } else {
      setUsers(data.map((row) => toUser(row)))
      toast.success("Users refreshed.", { id: toastId })
    }
    setSearch("")
    setRoleFilter("All")
    setPage(1)
  }

  /* ── field helper ────────────────────────────────────────── */
  function field(name: keyof typeof EMPTY_FORM, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "email") setEmailError("")
    if (name === "password" || name === "confirmPassword") setPasswordError("")
  }

  /* ════════════════════════════════════════════════════════ */
  return (
    <section className="flex flex-1 flex-col gap-4 px-4 pb-6 lg:px-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage customer, staff, and administrator accounts.</p>
        </div>
        <Button onPress={openAdd}><PlusIcon />New User</Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total",    value: counts.total,    icon: UsersIcon,  cls: ""                                    },
          { label: "Admin",    value: counts.admin,    icon: ShieldIcon, cls: "text-primary"                        },
          { label: "Staff",    value: counts.staff,    icon: WrenchIcon, cls: "text-amber-500"                      },
          { label: "Customer", value: counts.customer, icon: UserIcon,   cls: "text-muted-foreground"               },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <Icon className={`size-4 shrink-0 ${cls}`} />
            <div>
              <p className="text-xl font-semibold leading-none">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative min-w-0 max-w-sm flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search users…"
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm"><FilterIcon />Filter</Button>
            <DropdownMenu placement="bottom start">
              <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["All", ...ROLES] as const).map((item) => (
                <DropdownMenuItem key={item} id={item} onAction={() => { setRoleFilter(item); setPage(1) }}>
                  {item === "All" ? "All" : ROLE_LABELS[item]}{roleFilter === item ? "  ✓" : ""}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          </DropdownMenuTrigger>
          {roleFilter !== "All" && <Badge variant="secondary">{ROLE_LABELS[roleFilter as Role]}</Badge>}
        </div>

        <div className="flex items-center justify-end gap-1 rounded-md border bg-card p-1">
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm"><Columns3Icon />Columns</Button>
            <DropdownMenu placement="bottom end">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(columnLabels) as ColumnKey[]).map((col) => (
                <DropdownMenuItem key={col} id={col} onAction={() => setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }))}>
                  {visibleColumns[col] ? "✓  " : "    "}{columnLabels[col]}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          </DropdownMenuTrigger>
          <Button variant="ghost" size="icon" aria-label="Refresh users" onPress={refreshUsers}><RefreshCwIcon /></Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                {(Object.keys(columnLabels) as ColumnKey[])
                  .filter((col) => visibleColumns[col])
                  .map((col) => (
                    <SortableHeader key={col} column={col} label={columnLabels[col]} sortColumn={sortColumn} sortDir={sortDir} onSort={sortBy} />
                  ))}
                <th className="h-10 w-10 px-2" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                  {visibleColumns.name && (
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <Avatar size="sm">
                          {user.avatar && <AvatarImage src={user.avatar} alt={displayName(user)} />}
                          <AvatarFallback>{initials(user)}</AvatarFallback>
                        </Avatar>
                        <span>
                          <span className="font-medium">{displayName(user)}</span>
                          <span className="block text-xs text-muted-foreground">{user.email}</span>
                        </span>
                      </span>
                    </td>
                  )}
                  {visibleColumns.address && <td className="px-4 py-3">{user.address || "—"}</td>}
                  {visibleColumns.phone  && <td className="px-4 py-3">{user.phone}</td>}
                  {visibleColumns.role   && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                        <RoleIcon role={user.role} />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                  )}

                  {/* Row actions */}
                  <td className="px-2 py-3 text-right">
                    {user.role === "admin" ? (
                      <Button variant="ghost" size="icon-sm" isDisabled aria-label="Admin actions are disabled">
                        <MoreHorizontalIcon />
                      </Button>
                    ) : (
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                          <MoreHorizontalIcon />
                        </Button>
                        <DropdownMenu placement="bottom end">
                          <DropdownMenuLabel>{displayName(user)}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem id="edit"   onAction={() => openEdit(user)}>
                            <PencilIcon className="size-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem id="delete" onAction={() => openDelete(user)} className="text-destructive focus:text-destructive">
                            <Trash2Icon className="size-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </DropdownMenuTrigger>
                    )}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length} users
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="user-page-size" className="sr-only">Rows per page</label>
            <select
              id="user-page-size"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="h-8 rounded-md border bg-background px-2 text-sm text-foreground"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
            <span>Page {page} of {pageCount}</span>
            <Button variant="outline" size="icon-sm" aria-label="Previous page" isDisabled={page === 1}        onPress={() => setPage((p) => Math.max(1, p - 1))}>‹</Button>
            <Button variant="outline" size="icon-sm" aria-label="Next page"     isDisabled={page >= pageCount} onPress={() => setPage((p) => Math.min(pageCount, p + 1))}>›</Button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit dialog ──────────────────────────────────── */}
      <dialog ref={addDialogRef} onClick={closeOnBackdrop} className="m-auto w-[min(760px,calc(100vw-2rem))] max-h-[min(90vh,880px)] overflow-hidden rounded-xl border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/50">
        <form onSubmit={submitUser} autoComplete="off" className="grid max-h-[min(90vh,880px)] grid-rows-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold">{editingId ? "Edit user" : "Add new user"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {editingId ? "Update the account information below." : "Fill in the details to create a new account."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeAddDialog}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close form"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <FieldGroup className="grid grid-cols-1 content-start gap-4 overflow-y-auto overscroll-contain p-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field className="sm:col-span-2 lg:col-span-3">
              <FieldLabel htmlFor="user-image">Upload image</FieldLabel>
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center">
                <Avatar size="lg" className="size-16">
                  {formData.imagePreview && <AvatarImage src={formData.imagePreview} alt="User photo preview" />}
                  <AvatarFallback>
                    <ImagePlusIcon className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <input
                    ref={imageInputRef}
                    id="user-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP. This photo appears on the user list.</p>
                </div>
                {formData.imagePreview && (
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove uploaded image" onPress={clearImage}>
                    <XIcon />
                  </Button>
                )}
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="user-first-name">First name</FieldLabel>
              <Input id="user-first-name" name="firstName" placeholder="Juan" required value={formData.firstName} onChange={(e) => field("firstName", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-middle-name">Middle name</FieldLabel>
              <Input id="user-middle-name" name="middleName" placeholder="Miguel" value={formData.middleName} onChange={(e) => field("middleName", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-last-name">Last name</FieldLabel>
              <Input id="user-last-name" name="lastName" placeholder="Santos" required value={formData.lastName} onChange={(e) => field("lastName", e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-email">Email</FieldLabel>
              <Input
                id="user-email" name="email" type="email" placeholder="juan@example.com" required
                value={formData.email}
                onChange={(e) => field("email", e.target.value)}
                aria-invalid={!!emailError || undefined}
                className={emailError ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="user-phone">Phone</FieldLabel>
              <Input id="user-phone" name="phone" placeholder="+63 917 000 0000" required value={formData.phone} onChange={(e) => field("phone", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-role">Role</FieldLabel>
              <select
                id="user-role" name="role"
                value={formData.role}
                onChange={(e) => field("role", e.target.value as Role)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>

            <PhAddressFields
              value={addressValue}
              onChange={setAddressValue}
              preloadFrom={savedAddress || undefined}
            />

            {!editingId && (
              <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2 lg:col-span-3">
                <Field>
                  <FieldLabel htmlFor="user-password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="user-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => field("password", e.target.value)}
                      className="pr-10"
                      aria-invalid={!!passwordError || undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-confirm-password">Confirm password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="user-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) => field("confirmPassword", e.target.value)}
                      className={`pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      aria-invalid={!!passwordError || undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
                </Field>
              </div>
            )}

            <div className="rounded-lg border bg-muted/40 p-4 sm:col-span-2 lg:col-span-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Role permissions</p>
              <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <li className="flex items-start gap-2"><ShieldIcon className="mt-0.5 size-3 shrink-0 text-primary" /><span><strong className="text-foreground">Admin</strong> — Full access to settings, users, and reports.</span></li>
                <li className="flex items-start gap-2"><WrenchIcon className="mt-0.5 size-3 shrink-0 text-amber-500" /><span><strong className="text-foreground">Staff</strong> — Manage orders, reservations, and menu.</span></li>
                <li className="flex items-start gap-2"><UserIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" /><span><strong className="text-foreground">Customer</strong> — Browse, book, and view their own orders.</span></li>
              </ul>
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" formNoValidate isDisabled={submitting} onPress={closeAddDialog}>Cancel</Button>
            <Button type="submit" isDisabled={submitting}>{submitting ? "Saving…" : editingId ? "Save changes" : "Add User"}</Button>
          </div>
        </form>
      </dialog>

      {/* ── Delete confirmation dialog ─────────────────────────── */}
      <dialog ref={deleteDialogRef} onClick={closeOnBackdrop} onClose={() => setDeleteTarget(null)} className="m-auto w-[min(400px,calc(100vw-2rem))] rounded-xl border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/50">
        <div className="p-5">
          <h2 className="text-xl font-semibold">Delete user?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong className="text-foreground">{deleteTarget ? displayName(deleteTarget) : ""}</strong> ({deleteTarget ? ROLE_LABELS[deleteTarget.role] : ""}) will be permanently removed. This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" isDisabled={deleting} onPress={() => { setDeleteTarget(null); deleteDialogRef.current?.close() }}>Cancel</Button>
          <Button variant="destructive" isDisabled={deleting} onPress={confirmDelete}>{deleting ? "Deleting…" : "Delete"}</Button>
        </div>
      </dialog>

    </section>
  )
}

function SortableHeader({
  column, label, sortColumn, sortDir, onSort,
}: {
  column: ColumnKey; label: string; sortColumn: ColumnKey | null; sortDir: "asc" | "desc"; onSort: (col: ColumnKey) => void
}) {
  const active = sortColumn === column
  return (
    <th className="h-10 px-4 font-medium">
      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => onSort(column)}>
        {label}
        {active
          ? (sortDir === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />)
          : <ArrowUpDownIcon className="size-3.5" />}
      </button>
    </th>
  )
}
