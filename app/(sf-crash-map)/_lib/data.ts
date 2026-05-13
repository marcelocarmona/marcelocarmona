export type SfCrashMapGeometry = {
  type: string
  coordinates: unknown
} | null

export interface SfCrashMapFeature<TProperties extends Record<string, unknown>> {
  type: 'Feature'
  geometry: SfCrashMapGeometry
  properties: TProperties
}

export interface SfCrashMapFeatureCollection<TProperties extends Record<string, unknown>> {
  type: 'FeatureCollection'
  features: SfCrashMapFeature<TProperties>[]
}

export interface DataSfCrashProperties extends Record<string, unknown> {
  unique_id?: string | null
  primary_rd?: string | null
  secondary_rd?: string | null
  collision_severity?: string | null
  dph_col_grp_description?: string | null
  party1_type?: string | null
  party2_type?: string | null
  accident_year?: string | number | null
  collision_date?: string | null
  analysis_neighborhood?: string | null
  supervisor_district?: string | number | null
  street_view?: string | null
  data_loaded_at?: string | null
  data_updated_at?: string | null
}

export interface SfCrashMapNeighborhood {
  id: string
  neighborhoodKey: string
  neighborhoodName: string
  recentCrashCount: number
  severeFatalCrashCount: number
  pedBikeCrashCount: number
  latestCollisionDate: string | null
  supervisorDistricts: string[]
  score: number
}

export interface SfCrashMapCrashProperties extends DataSfCrashProperties {
  crashKind: 'severe-fatal' | 'ped-bike'
  neighborhoodId: string
  neighborhoodName: string
}

export interface SfCrashMapStats {
  neighborhoodCount: number
  recentInjuryCrashCount: number
  severeFatalCrashCount: number
  pedBikeCrashCount: number
  latestCollisionDate: string | null
  crashesDataLoadedAt: string | null
}

export type SfCrashMapPeriodKey = 'last12' | 'last3' | 'since2020'

export interface SfCrashMapPeriodOption {
  key: SfCrashMapPeriodKey
  label: string
  description: string
  startDate: string | null
  endDate: string | null
}

export interface SfCrashMapAtlas {
  generatedAt: string
  recentCrashesSinceYear: number
  periodKey: SfCrashMapPeriodKey
  periodLabel: string
  crashPeriodStartDate: string | null
  crashPeriodEndDate: string | null
  stats: SfCrashMapStats
  neighborhoods: SfCrashMapNeighborhood[]
  crashes: SfCrashMapFeatureCollection<SfCrashMapCrashProperties>
}

export interface SfCrashMapAtlasResponse {
  generatedAt: string
  defaultPeriod: SfCrashMapPeriodKey
  periodOptions: SfCrashMapPeriodOption[]
  periods: Record<SfCrashMapPeriodKey, SfCrashMapAtlas>
}

export interface SfCrashMapAtlasPeriodResponse {
  generatedAt: string
  defaultPeriod: SfCrashMapPeriodKey
  activePeriod: SfCrashMapPeriodKey
  periodOptions: SfCrashMapPeriodOption[]
  atlas: SfCrashMapAtlas
}

interface NeighborhoodAccumulator {
  id: string
  neighborhoodKey: string
  neighborhoodName: string
  recentCrashCount: number
  severeFatalCrashCount: number
  pedBikeCrashCount: number
  latestCollisionDate: string | null
  supervisorDistrictCounts: Map<string, number>
  score: number
}

const FALLBACK_NEIGHBORHOOD_KEY = 'UNKNOWN_NEIGHBORHOOD'
const FALLBACK_NEIGHBORHOOD_NAME = 'Unknown neighborhood'
const DEFAULT_SF_CRASH_MAP_PERIOD: SfCrashMapPeriodKey = 'last3'

export function buildSfCrashMapAtlas({
  crashes,
  generatedAt = new Date().toISOString(),
  recentCrashesSinceYear = 2020,
  periodKey = 'since2020',
  periodLabel = 'Since 2020',
  periodStartDate = null,
  periodEndDate = null,
}: {
  crashes: SfCrashMapFeatureCollection<DataSfCrashProperties>
  generatedAt?: string
  recentCrashesSinceYear?: number
  periodKey?: SfCrashMapPeriodKey
  periodLabel?: string
  periodStartDate?: string | null
  periodEndDate?: string | null
}): SfCrashMapAtlas {
  const crashFeatures = Array.isArray(crashes.features) ? crashes.features : []
  const neighborhoodMap = new Map<string, NeighborhoodAccumulator>()
  const recentCrashes = crashFeatures.filter((feature) =>
    isRecentCrash(feature.properties, recentCrashesSinceYear, periodStartDate)
  )

  recentCrashes.forEach((feature) => {
    const neighborhood = getOrCreateNeighborhood(
      neighborhoodMap,
      getNeighborhoodKey(feature.properties),
      getNeighborhoodName(feature.properties)
    )
    const isSevereFatal = isSevereOrFatalCrash(feature.properties)
    const isPedBike = isPedBikeCrash(feature.properties)

    neighborhood.recentCrashCount += 1
    neighborhood.severeFatalCrashCount += isSevereFatal ? 1 : 0
    neighborhood.pedBikeCrashCount += isPedBike ? 1 : 0
    neighborhood.latestCollisionDate = maxIsoDate(
      neighborhood.latestCollisionDate,
      feature.properties.collision_date
    )

    const supervisorDistrict = normalizeSupervisorDistrict(feature.properties.supervisor_district)
    if (supervisorDistrict) {
      neighborhood.supervisorDistrictCounts.set(
        supervisorDistrict,
        (neighborhood.supervisorDistrictCounts.get(supervisorDistrict) || 0) + 1
      )
    }
  })

  neighborhoodMap.forEach((neighborhood) => {
    neighborhood.score = scoreNeighborhood(neighborhood)
  })

  const neighborhoods = Array.from(neighborhoodMap.values())
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.recentCrashCount - a.recentCrashCount ||
        a.neighborhoodName.localeCompare(b.neighborhoodName)
    )
    .map(toNeighborhood)

  const filteredCrashes = recentCrashes
    .filter((feature) => Boolean(feature.geometry))
    .filter(
      (feature) => isSevereOrFatalCrash(feature.properties) || isPedBikeCrash(feature.properties)
    )
    .map((feature) => {
      const crashKind: SfCrashMapCrashProperties['crashKind'] = isSevereOrFatalCrash(
        feature.properties
      )
        ? 'severe-fatal'
        : 'ped-bike'

      return {
        ...feature,
        properties: {
          ...feature.properties,
          crashKind,
          neighborhoodId: slugify(getNeighborhoodKey(feature.properties)),
          neighborhoodName: getNeighborhoodName(feature.properties),
        },
      }
    })

  return {
    generatedAt,
    recentCrashesSinceYear,
    periodKey,
    periodLabel,
    crashPeriodStartDate: periodStartDate,
    crashPeriodEndDate: periodEndDate,
    stats: {
      neighborhoodCount: neighborhoods.length,
      recentInjuryCrashCount: recentCrashes.length,
      severeFatalCrashCount: recentCrashes.filter((feature) =>
        isSevereOrFatalCrash(feature.properties)
      ).length,
      pedBikeCrashCount: recentCrashes.filter((feature) => isPedBikeCrash(feature.properties))
        .length,
      latestCollisionDate: recentCrashes.reduce<string | null>(
        (latest, feature) => maxIsoDate(latest, feature.properties.collision_date),
        null
      ),
      crashesDataLoadedAt: recentCrashes.reduce<string | null>(
        (latest, feature) => maxIsoDate(latest, feature.properties.data_loaded_at),
        null
      ),
    },
    neighborhoods,
    crashes: {
      type: 'FeatureCollection',
      features: filteredCrashes,
    },
  }
}

export function buildSfCrashMapPeriods({
  crashes,
  generatedAt = new Date().toISOString(),
  recentCrashesSinceYear = 2020,
}: {
  crashes: SfCrashMapFeatureCollection<DataSfCrashProperties>
  generatedAt?: string
  recentCrashesSinceYear?: number
}): SfCrashMapAtlasResponse {
  const latestCollisionDate = getLatestCollisionDate(crashes, recentCrashesSinceYear)
  const periodOptions = getSfCrashMapPeriodOptions(latestCollisionDate)
  const periods = Object.fromEntries(
    periodOptions.map((period) => [
      period.key,
      buildSfCrashMapAtlas({
        crashes,
        generatedAt,
        recentCrashesSinceYear,
        periodKey: period.key,
        periodLabel: period.label,
        periodStartDate: period.startDate,
        periodEndDate: period.endDate,
      }),
    ])
  ) as Record<SfCrashMapPeriodKey, SfCrashMapAtlas>

  return {
    generatedAt,
    defaultPeriod: DEFAULT_SF_CRASH_MAP_PERIOD,
    periodOptions,
    periods,
  }
}

export function buildSfCrashMapPeriod({
  crashes,
  generatedAt = new Date().toISOString(),
  recentCrashesSinceYear = 2020,
  periodKey = DEFAULT_SF_CRASH_MAP_PERIOD,
}: {
  crashes: SfCrashMapFeatureCollection<DataSfCrashProperties>
  generatedAt?: string
  recentCrashesSinceYear?: number
  periodKey?: SfCrashMapPeriodKey
}): SfCrashMapAtlasPeriodResponse {
  const latestCollisionDate = getLatestCollisionDate(crashes, recentCrashesSinceYear)
  const periodOptions = getSfCrashMapPeriodOptions(latestCollisionDate)
  const period =
    periodOptions.find((option) => option.key === periodKey) ||
    periodOptions.find((option) => option.key === DEFAULT_SF_CRASH_MAP_PERIOD) ||
    periodOptions[0]

  return {
    generatedAt,
    defaultPeriod: DEFAULT_SF_CRASH_MAP_PERIOD,
    activePeriod: period.key,
    periodOptions,
    atlas: buildSfCrashMapAtlas({
      crashes,
      generatedAt,
      recentCrashesSinceYear,
      periodKey: period.key,
      periodLabel: period.label,
      periodStartDate: period.startDate,
      periodEndDate: period.endDate,
    }),
  }
}

export function getLatestCollisionDate(
  crashes: SfCrashMapFeatureCollection<DataSfCrashProperties>,
  recentCrashesSinceYear = 2020
): string | null {
  const crashFeatures = Array.isArray(crashes.features) ? crashes.features : []
  return crashFeatures
    .filter((feature) => isRecentCrash(feature.properties, recentCrashesSinceYear))
    .reduce<
      string | null
    >((latest, feature) => maxIsoDate(latest, feature.properties.collision_date), null)
}

export function getSfCrashMapPeriodOptions(
  latestCollisionDate: string | null
): SfCrashMapPeriodOption[] {
  return [
    {
      key: 'last12',
      label: 'Last 12 months',
      description: 'The freshest one-year crash window DataSF currently supports.',
      startDate: yearsBefore(latestCollisionDate, 1),
      endDate: latestCollisionDate,
    },
    {
      key: 'last3',
      label: 'Last 3 years',
      description:
        'A recent enough window to reduce noise without losing the neighborhood pattern.',
      startDate: yearsBefore(latestCollisionDate, 3),
      endDate: latestCollisionDate,
    },
    {
      key: 'since2020',
      label: 'Since 2020',
      description: 'The full recent archive used for neighborhood context.',
      startDate: null,
      endDate: latestCollisionDate,
    },
  ]
}

export function isRecentCrash(
  properties: DataSfCrashProperties,
  recentCrashesSinceYear = 2020,
  periodStartDate: string | null = null
): boolean {
  if (toNumber(properties.accident_year) < recentCrashesSinceYear) return false
  if (!periodStartDate) return true

  const collisionDate = toDateOnly(properties.collision_date)
  const startDate = toDateOnly(periodStartDate)
  return Boolean(collisionDate && startDate && collisionDate >= startDate)
}

export function isSevereOrFatalCrash(properties: DataSfCrashProperties): boolean {
  const severity = normalizeLabel(properties.collision_severity).toLowerCase()
  return severity.includes('fatal') || severity.includes('severe')
}

export function isPedBikeCrash(properties: DataSfCrashProperties): boolean {
  const values = [
    properties.dph_col_grp_description,
    properties.party1_type,
    properties.party2_type,
  ]
    .map((value) => normalizeLabel(value).toLowerCase())
    .join(' ')

  return values.includes('pedestrian') || values.includes('bicycle') || values.includes('bicyclist')
}

function getNeighborhoodKey(properties: DataSfCrashProperties): string {
  return normalizeLabel(properties.analysis_neighborhood).toUpperCase() || FALLBACK_NEIGHBORHOOD_KEY
}

function getNeighborhoodName(properties: DataSfCrashProperties): string {
  return normalizeLabel(properties.analysis_neighborhood) || FALLBACK_NEIGHBORHOOD_NAME
}

function getOrCreateNeighborhood(
  neighborhoodMap: Map<string, NeighborhoodAccumulator>,
  neighborhoodKey: string,
  neighborhoodName: string
): NeighborhoodAccumulator {
  const existing = neighborhoodMap.get(neighborhoodKey)
  if (existing) return existing

  const neighborhood: NeighborhoodAccumulator = {
    id: slugify(neighborhoodKey),
    neighborhoodKey,
    neighborhoodName,
    recentCrashCount: 0,
    severeFatalCrashCount: 0,
    pedBikeCrashCount: 0,
    latestCollisionDate: null,
    supervisorDistrictCounts: new Map(),
    score: 0,
  }
  neighborhoodMap.set(neighborhoodKey, neighborhood)
  return neighborhood
}

function toNeighborhood(neighborhood: NeighborhoodAccumulator): SfCrashMapNeighborhood {
  return {
    id: neighborhood.id,
    neighborhoodKey: neighborhood.neighborhoodKey,
    neighborhoodName: neighborhood.neighborhoodName,
    recentCrashCount: neighborhood.recentCrashCount,
    severeFatalCrashCount: neighborhood.severeFatalCrashCount,
    pedBikeCrashCount: neighborhood.pedBikeCrashCount,
    latestCollisionDate: neighborhood.latestCollisionDate,
    supervisorDistricts: Array.from(neighborhood.supervisorDistrictCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([district]) => district),
    score: neighborhood.score,
  }
}

function scoreNeighborhood(neighborhood: NeighborhoodAccumulator): number {
  return round(
    neighborhood.recentCrashCount +
      neighborhood.severeFatalCrashCount * 8 +
      neighborhood.pedBikeCrashCount * 4,
    1
  )
}

function normalizeSupervisorDistrict(value: unknown): string {
  const label = normalizeLabel(value)
  if (!label) return ''
  return /^district\s+/i.test(label) ? label : `District ${label}`
}

function normalizeLabel(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function maxIsoDate(a: string | null | undefined, b: string | null | undefined): string | null {
  const first = normalizeLabel(a)
  const second = normalizeLabel(b)
  if (!first) return second || null
  if (!second) return first
  return new Date(second).getTime() > new Date(first).getTime() ? second : first
}

function yearsBefore(value: string | null, years: number): string | null {
  const dateOnly = toDateOnly(value)
  if (!dateOnly) return null

  const [year, month, day] = dateOnly.split('-').map(Number)
  const shifted = new Date(Date.UTC(year - years, month - 1, day))
  if (shifted.getUTCMonth() !== month - 1) {
    shifted.setUTCDate(0)
  }

  return shifted.toISOString().slice(0, 10)
}

function toDateOnly(value: unknown): string | null {
  const label = normalizeLabel(value)
  if (!label) return null

  const dateOnly = label.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (dateOnly) return dateOnly

  const date = new Date(label)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function toNumber(value: unknown): number {
  const number = typeof value === 'number' ? value : Number.parseFloat(String(value || '0'))
  return Number.isFinite(number) ? number : 0
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
