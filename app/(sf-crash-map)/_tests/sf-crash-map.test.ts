import { describe, expect, it } from 'vitest'

import {
  buildSfCrashMapAtlas,
  buildSfCrashMapPeriods,
  getLatestCollisionDate,
  getSfCrashMapPeriodOptions,
  isPedBikeCrash,
  isRecentCrash,
  isSevereOrFatalCrash,
  type DataSfCrashProperties,
  type SfCrashMapFeatureCollection,
} from '../_lib/data'

function crashFeature(properties: DataSfCrashProperties, hasGeometry = true) {
  return {
    type: 'Feature' as const,
    geometry: hasGeometry
      ? {
          type: 'Point',
          coordinates: [-122.42, 37.77],
        }
      : null,
    properties,
  }
}

describe('sf crash map neighborhood data transforms', () => {
  it('groups recent crashes by analysis neighborhood', () => {
    const atlas = buildSfCrashMapAtlas({
      generatedAt: '2026-05-13T00:00:00.000Z',
      crashes: {
        type: 'FeatureCollection',
        features: [
          crashFeature({
            unique_id: 'mission-1',
            analysis_neighborhood: 'Mission',
            supervisor_district: '9',
            accident_year: '2025',
            collision_date: '2025-07-01T00:00:00.000',
          }),
          crashFeature({
            unique_id: 'mission-2',
            analysis_neighborhood: 'Mission',
            supervisor_district: '9',
            accident_year: '2024',
            collision_date: '2024-07-01T00:00:00.000',
          }),
          crashFeature({
            unique_id: 'soma',
            analysis_neighborhood: 'South of Market',
            supervisor_district: '6',
            accident_year: '2025',
            collision_date: '2025-02-01T00:00:00.000',
          }),
        ],
      },
    })

    const mission = atlas.neighborhoods.find(
      (neighborhood) => neighborhood.neighborhoodName === 'Mission'
    )
    const soma = atlas.neighborhoods.find(
      (neighborhood) => neighborhood.neighborhoodName === 'South of Market'
    )

    expect(mission).toMatchObject({
      neighborhoodKey: 'MISSION',
      recentCrashCount: 2,
      latestCollisionDate: '2025-07-01T00:00:00.000',
      supervisorDistricts: ['District 9'],
    })
    expect(soma).toMatchObject({
      neighborhoodKey: 'SOUTH OF MARKET',
      recentCrashCount: 1,
      supervisorDistricts: ['District 6'],
    })
    expect(atlas.stats.neighborhoodCount).toBe(2)
    expect(atlas.stats.recentInjuryCrashCount).toBe(3)
  })

  it('computes neighborhood counts and deterministic scores', () => {
    const atlas = buildSfCrashMapAtlas({
      generatedAt: '2026-05-13T00:00:00.000Z',
      crashes: {
        type: 'FeatureCollection',
        features: [
          crashFeature({
            unique_id: 'fatal',
            analysis_neighborhood: 'Mission',
            accident_year: '2025',
            collision_date: '2025-07-01T00:00:00.000',
            collision_severity: 'Fatal',
            dph_col_grp_description: 'Vehicle-Pedestrian',
          }),
          crashFeature({
            unique_id: 'bike',
            analysis_neighborhood: 'Mission',
            accident_year: '2024',
            collision_date: '2024-02-01T00:00:00.000',
            collision_severity: 'Injury (Other Visible)',
            dph_col_grp_description: 'Vehicle-Bicycle',
          }),
          crashFeature({
            unique_id: 'driver',
            analysis_neighborhood: 'Mission',
            accident_year: '2023',
            collision_date: '2023-02-01T00:00:00.000',
            collision_severity: 'Injury (Complaint of Pain)',
            dph_col_grp_description: 'Vehicle(s) Only Involved',
          }),
        ],
      },
    })

    expect(atlas.neighborhoods[0]).toMatchObject({
      neighborhoodName: 'Mission',
      recentCrashCount: 3,
      severeFatalCrashCount: 1,
      pedBikeCrashCount: 2,
      latestCollisionDate: '2025-07-01T00:00:00.000',
      score: 19,
    })
    expect(atlas.stats).toMatchObject({
      neighborhoodCount: 1,
      recentInjuryCrashCount: 3,
      severeFatalCrashCount: 1,
      pedBikeCrashCount: 2,
      latestCollisionDate: '2025-07-01T00:00:00.000',
    })
  })

  it('builds recency windows anchored to the latest DataSF collision date', () => {
    const response = buildSfCrashMapPeriods({
      generatedAt: '2026-05-13T00:00:00.000Z',
      crashes: {
        type: 'FeatureCollection',
        features: [
          crashFeature({
            unique_id: 'latest',
            analysis_neighborhood: 'Mission',
            accident_year: '2026',
            collision_date: '2026-02-28T00:00:00.000',
            collision_severity: 'Injury (Complaint of Pain)',
            dph_col_grp_description: 'Vehicle(s) Only Involved',
          }),
          crashFeature({
            unique_id: 'last-year',
            analysis_neighborhood: 'Mission',
            accident_year: '2025',
            collision_date: '2025-04-01T00:00:00.000',
            collision_severity: 'Injury (Severe)',
            dph_col_grp_description: 'Vehicle-Pedestrian',
          }),
          crashFeature({
            unique_id: 'three-year-window',
            analysis_neighborhood: 'Mission',
            accident_year: '2024',
            collision_date: '2024-02-28T00:00:00.000',
            collision_severity: 'Injury (Other Visible)',
            dph_col_grp_description: 'Vehicle-Bicycle',
          }),
          crashFeature({
            unique_id: 'older-context',
            analysis_neighborhood: 'Mission',
            accident_year: '2022',
            collision_date: '2022-02-28T00:00:00.000',
            collision_severity: 'Fatal',
            dph_col_grp_description: 'Vehicle(s) Only Involved',
          }),
        ],
      },
    })

    expect(response.defaultPeriod).toBe('last3')
    expect(response.periodOptions).toMatchObject([
      { key: 'last12', startDate: '2025-02-28', endDate: '2026-02-28T00:00:00.000' },
      { key: 'last3', startDate: '2023-02-28', endDate: '2026-02-28T00:00:00.000' },
      { key: 'since2020', startDate: null, endDate: '2026-02-28T00:00:00.000' },
    ])
    expect(response.periods.last12.neighborhoods[0].recentCrashCount).toBe(2)
    expect(response.periods.last3.neighborhoods[0].recentCrashCount).toBe(3)
    expect(response.periods.since2020.neighborhoods[0].recentCrashCount).toBe(4)
    expect(
      response.periods.last12.crashes.features.map((feature) => feature.properties.unique_id)
    ).toEqual(['last-year'])
  })

  it('derives latest collision date and period options from empty and populated crash payloads', () => {
    const crashes: SfCrashMapFeatureCollection<DataSfCrashProperties> = {
      type: 'FeatureCollection',
      features: [
        crashFeature({
          unique_id: 'old',
          accident_year: '2019',
          collision_date: '2019-12-31T00:00:00.000',
        }),
        crashFeature({
          unique_id: 'new',
          accident_year: '2025',
          collision_date: '2025-08-15T00:00:00.000',
        }),
      ],
    }

    expect(getLatestCollisionDate(crashes)).toBe('2025-08-15T00:00:00.000')
    expect(
      getSfCrashMapPeriodOptions('2025-08-15T00:00:00.000').map((period) => period.startDate)
    ).toEqual(['2024-08-15', '2022-08-15', null])
    expect(getSfCrashMapPeriodOptions(null).map((period) => period.startDate)).toEqual([
      null,
      null,
      null,
    ])
  })

  it('filters mapped crash points to severe, fatal, pedestrian, and bicycle crashes since 2020', () => {
    const atlas = buildSfCrashMapAtlas({
      generatedAt: '2026-05-13T00:00:00.000Z',
      crashes: {
        type: 'FeatureCollection',
        features: [
          crashFeature({
            unique_id: 'fatal',
            analysis_neighborhood: 'Market / Octavia',
            accident_year: '2025',
            collision_severity: 'Fatal',
            dph_col_grp_description: 'Vehicle(s) Only Involved',
          }),
          crashFeature({
            unique_id: 'ped',
            analysis_neighborhood: 'Market / Octavia',
            accident_year: '2024',
            collision_severity: 'Injury (Complaint of Pain)',
            dph_col_grp_description: 'Vehicle-Pedestrian',
          }),
          crashFeature({
            unique_id: 'driver',
            analysis_neighborhood: 'Market / Octavia',
            accident_year: '2024',
            collision_severity: 'Injury (Complaint of Pain)',
            dph_col_grp_description: 'Vehicle(s) Only Involved',
          }),
          crashFeature({
            unique_id: 'old-bike',
            analysis_neighborhood: 'Market / Octavia',
            accident_year: '2019',
            collision_severity: 'Injury (Other Visible)',
            dph_col_grp_description: 'Vehicle-Bicycle',
          }),
          crashFeature(
            {
              unique_id: 'null-geometry',
              analysis_neighborhood: 'Market / Octavia',
              accident_year: '2025',
              collision_severity: 'Injury (Severe)',
              dph_col_grp_description: 'Vehicle(s) Only Involved',
            },
            false
          ),
        ],
      },
    })

    expect(atlas.crashes.features.map((feature) => feature.properties.unique_id)).toEqual([
      'fatal',
      'ped',
    ])
    expect(atlas.crashes.features[0].properties).toMatchObject({
      neighborhoodId: 'market-octavia',
      neighborhoodName: 'Market / Octavia',
    })
  })

  it('handles missing neighborhoods, null geometry, and empty crash payloads', () => {
    const atlas = buildSfCrashMapAtlas({
      generatedAt: '2026-05-13T00:00:00.000Z',
      crashes: {
        type: 'FeatureCollection',
        features: [
          crashFeature(
            {
              unique_id: 'missing-neighborhood',
              analysis_neighborhood: null,
              accident_year: '2025',
              collision_severity: 'Injury (Severe)',
              dph_col_grp_description: 'Vehicle(s) Only Involved',
            },
            false
          ),
        ],
      },
    })

    expect(atlas.neighborhoods[0]).toMatchObject({
      neighborhoodName: 'Unknown neighborhood',
      recentCrashCount: 1,
      severeFatalCrashCount: 1,
    })
    expect(atlas.crashes.features).toEqual([])

    const emptyAtlas = buildSfCrashMapAtlas({
      generatedAt: '2026-05-13T00:00:00.000Z',
      crashes: emptyCrashes(),
    })
    expect(emptyAtlas.neighborhoods).toEqual([])
    expect(emptyAtlas.stats.neighborhoodCount).toBe(0)
  })

  it('normalizes crash classifications and date windows', () => {
    expect(isRecentCrash({ accident_year: '2020' })).toBe(true)
    expect(isRecentCrash({ accident_year: '2019' })).toBe(false)
    expect(
      isRecentCrash(
        { accident_year: '2024', collision_date: '2024-02-27T00:00:00.000' },
        2020,
        '2024-02-28'
      )
    ).toBe(false)
    expect(
      isRecentCrash(
        { accident_year: '2024', collision_date: '2024-02-28T00:00:00.000' },
        2020,
        '2024-02-28'
      )
    ).toBe(true)
    expect(isSevereOrFatalCrash({ collision_severity: 'Injury (Severe)' })).toBe(true)
    expect(isPedBikeCrash({ party2_type: 'Bicyclist' })).toBe(true)
  })
})

function emptyCrashes(): SfCrashMapFeatureCollection<DataSfCrashProperties> {
  return {
    type: 'FeatureCollection',
    features: [],
  }
}
