"use client"

import { useEffect, useState } from "react"

import { getBarangays, getMunicipalities, getProvinces } from "@/app/actions/address"
import {
  composeAddress,
  matchAddressOption,
  parseAddress,
  type AddressOption,
} from "@/lib/ph-address"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export type AddressValue = {
  street: string
  province: string
  provinceCode: string
  municipality: string
  municipalityCode: string
  barangay: string
  barangayCode: string
  address: string
}

const EMPTY_ADDRESS: AddressValue = {
  street: "",
  province: "",
  provinceCode: "",
  municipality: "",
  municipalityCode: "",
  barangay: "",
  barangayCode: "",
  address: "",
}

export function emptyAddressValue(): AddressValue {
  return { ...EMPTY_ADDRESS }
}

type PhAddressFieldsProps = {
  value: AddressValue
  onChange: (value: AddressValue) => void
  preloadFrom?: string
}

export function PhAddressFields({ value, onChange, preloadFrom }: PhAddressFieldsProps) {
  const [provinces, setProvinces] = useState<AddressOption[]>([])
  const [municipalities, setMunicipalities] = useState<AddressOption[]>([])
  const [barangays, setBarangays] = useState<AddressOption[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  const [error, setError] = useState("")
  const parsedSaved = preloadFrom ? parseAddress(preloadFrom) : null

  useEffect(() => {
    let cancelled = false

    getProvinces().then(({ data, error: loadError }) => {
      if (cancelled) return
      setProvinces(data)
      setLoadingProvinces(false)
      if (loadError) setError(loadError)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (value.provinceCode || !parsedSaved?.province || provinces.length === 0) return
    const match = matchAddressOption(provinces, parsedSaved.province)
    if (!match) return
    update({
      street: parsedSaved.street || value.street,
      province: match.name,
      provinceCode: match.code,
    })
  }, [parsedSaved?.province, parsedSaved?.street, provinces, value.provinceCode, value.street])

  useEffect(() => {
    if (!value.provinceCode) {
      setMunicipalities([])
      setBarangays([])
      return
    }

    let cancelled = false
    setLoadingMunicipalities(true)
    setError("")

    getMunicipalities(value.provinceCode).then(({ data, error: loadError }) => {
      if (cancelled) return
      setMunicipalities(data)
      setLoadingMunicipalities(false)
      if (loadError) setError(loadError)

      if (!value.municipalityCode && parsedSaved?.municipality) {
        const match = matchAddressOption(data, parsedSaved.municipality)
        if (match) {
          update({
            municipality: match.name,
            municipalityCode: match.code,
          })
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [value.provinceCode])

  useEffect(() => {
    if (!value.municipalityCode) {
      setBarangays([])
      return
    }

    const selected = municipalities.find((item) => item.code === value.municipalityCode)
    let cancelled = false
    setLoadingBarangays(true)
    setError("")

    getBarangays(value.municipalityCode, Boolean(selected?.isCity)).then(({ data, error: loadError }) => {
      if (cancelled) return
      setBarangays(data)
      setLoadingBarangays(false)
      if (loadError) setError(loadError)

      if (!value.barangayCode && parsedSaved?.barangay) {
        const match = matchAddressOption(data, parsedSaved.barangay)
        if (match) {
          update({
            barangay: match.name,
            barangayCode: match.code,
          })
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [municipalities, value.municipalityCode])

  function update(partial: Partial<AddressValue>) {
    const next = { ...value, ...partial }
    onChange({
      ...next,
      address: composeAddress({
        street: next.street,
        barangay: next.barangay,
        municipality: next.municipality,
        province: next.province,
      }),
    })
  }

  function chooseProvince(code: string) {
    const selected = provinces.find((item) => item.code === code)
    update({
      province: selected?.name ?? "",
      provinceCode: code,
      municipality: "",
      municipalityCode: "",
      barangay: "",
      barangayCode: "",
    })
  }

  function chooseMunicipality(code: string) {
    const selected = municipalities.find((item) => item.code === code)
    update({
      municipality: selected?.name ?? "",
      municipalityCode: code,
      barangay: "",
      barangayCode: "",
    })
  }

  function chooseBarangay(code: string) {
    const selected = barangays.find((item) => item.code === code)
    update({
      barangay: selected?.name ?? "",
      barangayCode: code,
    })
  }

  return (
    <>
      <Field className="sm:col-span-2 lg:col-span-3">
        <FieldLabel htmlFor="user-street">Street / house no.</FieldLabel>
        <Input
          id="user-street"
          name="street"
          placeholder="House no., street, subdivision"
          value={value.street}
          onChange={(event) => update({ street: event.target.value })}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="user-province">Province</FieldLabel>
        <select
          id="user-province"
          name="province"
          required
          value={value.provinceCode}
          onChange={(event) => chooseProvince(event.target.value)}
          className={selectClassName}
        >
          <option value="">{loadingProvinces ? "Loading provinces…" : "Select province"}</option>
          {provinces.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor="user-municipality">Municipality</FieldLabel>
        <select
          id="user-municipality"
          name="municipality"
          required
          disabled={!value.provinceCode || loadingMunicipalities}
          value={value.municipalityCode}
          onChange={(event) => chooseMunicipality(event.target.value)}
          className={selectClassName}
        >
          <option value="">
            {!value.provinceCode
              ? "Select province first"
              : loadingMunicipalities
                ? "Loading municipalities…"
                : "Select municipality / city"}
          </option>
          {municipalities.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor="user-barangay">Barangay</FieldLabel>
        <select
          id="user-barangay"
          name="barangay"
          required
          disabled={!value.municipalityCode || loadingBarangays}
          value={value.barangayCode}
          onChange={(event) => chooseBarangay(event.target.value)}
          className={selectClassName}
        >
          <option value="">
            {!value.municipalityCode
              ? "Select municipality first"
              : loadingBarangays
                ? "Loading barangays…"
                : "Select barangay"}
          </option>
          {barangays.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      <input type="hidden" name="address" value={value.address} />

      {error && (
        <p className="text-xs text-destructive sm:col-span-2 lg:col-span-3">{error}</p>
      )}
      {preloadFrom && !value.provinceCode && (
        <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-3">
          Current address: {preloadFrom}
        </p>
      )}
    </>
  )
}
