import {
  buildSfCrashMapPeriod,
  type DataSfCrashProperties,
  type SfCrashMapFeatureCollection,
  type SfCrashMapPeriodKey,
} from '../../_lib/data'

export const runtime = 'nodejs'
export const revalidate = 86400

const DATA_SF_DOMAIN = 'https://data.sfgov.org'
const CRASH_DATASET_ID = 'ubvf-ztfx'
const CACHE_SECONDS = 60 * 60 * 24
const periodKeys: SfCrashMapPeriodKey[] = ['last12', 'last3', 'since2020']

const crashQuery = {
  $select:
    'unique_id,primary_rd,secondary_rd,collision_severity,dph_col_grp_description,party1_type,party2_type,accident_year,collision_date,analysis_neighborhood,supervisor_district,street_view,data_loaded_at,data_updated_at,point',
  $where: "accident_year >= '2020'",
  $limit: '50000',
}

export async function GET(request: Request) {
  try {
    const periodKey = getRequestedPeriod(request.url)
    const crashes = await fetchGeoJson<DataSfCrashProperties>(CRASH_DATASET_ID, crashQuery)

    const atlas = buildSfCrashMapPeriod({
      crashes,
      periodKey,
    })

    return Response.json(atlas, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DataSF error'

    return Response.json(
      {
        error: 'Failed to load SF Crash Map data.',
        message,
      },
      {
        status: 502,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

function getRequestedPeriod(url: string): SfCrashMapPeriodKey {
  const period = new URL(url).searchParams.get('period')
  return periodKeys.includes(period as SfCrashMapPeriodKey)
    ? (period as SfCrashMapPeriodKey)
    : 'last3'
}

async function fetchGeoJson<TProperties extends Record<string, unknown>>(
  datasetId: string,
  query: Record<string, string>
): Promise<SfCrashMapFeatureCollection<TProperties>> {
  const url = new URL(`/resource/${datasetId}.geojson`, DATA_SF_DOMAIN)
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const headers: Record<string, string> = {
    Accept: 'application/geo+json, application/json',
  }
  const appToken = process.env.SOCRATA_APP_TOKEN
  if (appToken) {
    headers['X-App-Token'] = appToken
  }

  const response = await fetch(url, {
    headers,
    next: {
      revalidate: CACHE_SECONDS,
    },
  })

  if (!response.ok) {
    throw new Error(`DataSF ${datasetId} returned ${response.status}`)
  }

  const payload = (await response.json()) as SfCrashMapFeatureCollection<TProperties>
  return {
    type: 'FeatureCollection',
    features: Array.isArray(payload.features) ? payload.features : [],
  }
}
