const PSGC_API = "https://psgc.gitlab.io/api"
const NCR_CODE = "130000000"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export type AddressOption = {
  code: string
  name: string
  isCity?: boolean
}

type PsgcPlace = {
  code: string
  name: string
  isCity?: boolean
  isMunicipality?: boolean
}

const cache = new Map<string, { at: number; data: unknown }>()

async function psgcFetch<T>(path: string): Promise<T> {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.data as T
  }

  const response = await fetch(`${PSGC_API}${path}`, {
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to load addresses (${response.status}).`)
  }

  const data = (await response.json()) as T
  cache.set(path, { at: Date.now(), data })
  return data
}

function toOptions(places: PsgcPlace[]): AddressOption[] {
  return [...places]
    .map((place) => ({
      code: place.code,
      name: place.name,
      isCity: Boolean(place.isCity),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchAllProvinces(): Promise<AddressOption[]> {
  const provinces = await psgcFetch<PsgcPlace[]>("/provinces.json")
  return toOptions([
    { code: NCR_CODE, name: "Metro Manila (NCR)" },
    ...provinces,
  ])
}

export async function fetchMunicipalities(provinceCode: string): Promise<AddressOption[]> {
  if (!provinceCode) return []

  const path =
    provinceCode === NCR_CODE
      ? `/regions/${NCR_CODE}/cities-municipalities.json`
      : `/provinces/${provinceCode}/cities-municipalities.json`

  return toOptions(await psgcFetch<PsgcPlace[]>(path))
}

export async function fetchBarangays(municipalityCode: string, isCity = false): Promise<AddressOption[]> {
  if (!municipalityCode) return []

  const primary = isCity
    ? `/cities/${municipalityCode}/barangays.json`
    : `/municipalities/${municipalityCode}/barangays.json`
  const fallback = isCity
    ? `/municipalities/${municipalityCode}/barangays.json`
    : `/cities/${municipalityCode}/barangays.json`

  try {
    return toOptions(await psgcFetch<PsgcPlace[]>(primary))
  } catch {
    return toOptions(await psgcFetch<PsgcPlace[]>(fallback))
  }
}

export function composeAddress(parts: {
  street?: string
  barangay?: string
  municipality?: string
  province?: string
}) {
  return [parts.street, parts.barangay, parts.municipality, parts.province]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ")
}

export function parseAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 3) {
    return {
      street: parts.slice(0, -3).join(", "),
      barangay: parts.at(-3) ?? "",
      municipality: parts.at(-2) ?? "",
      province: parts.at(-1) ?? "",
    }
  }

  return { street: address.trim(), barangay: "", municipality: "", province: "" }
}

export function matchAddressOption(options: AddressOption[], name: string) {
  const query = name.trim().toLowerCase()
  if (!query) return undefined

  return (
    options.find((option) => option.name.toLowerCase() === query) ??
    options.find((option) => {
      const optionName = option.name.toLowerCase()
      return optionName.includes(query) || query.includes(optionName.replace(/\s+\(.*\)$/, ""))
    })
  )
}
