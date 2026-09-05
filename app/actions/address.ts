"use server"

import { fetchAllProvinces, fetchBarangays, fetchMunicipalities } from "@/lib/ph-address"

export async function getProvinces() {
  try {
    return { data: await fetchAllProvinces(), error: null }
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Failed to load provinces." }
  }
}

export async function getMunicipalities(provinceCode: string) {
  try {
    return { data: await fetchMunicipalities(provinceCode), error: null }
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Failed to load municipalities." }
  }
}

export async function getBarangays(municipalityCode: string, isCity = false) {
  try {
    return { data: await fetchBarangays(municipalityCode, isCity), error: null }
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Failed to load barangays." }
  }
}
