'use client'

import maplibregl, { type GeoJSONSource, type LngLatBoundsLike, type Map } from 'maplibre-gl'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils/cn'
import type {
  SfCrashMapCrashProperties,
  SfCrashMapNeighborhood,
  SfCrashMapAtlas as SfCrashMapAtlasData,
  SfCrashMapAtlasPeriodResponse,
  SfCrashMapFeature,
  SfCrashMapPeriodKey,
  SfCrashMapPeriodOption,
} from '../_lib/data'

type FocusKey = 'overall' | 'volume' | 'severe' | 'ped-bike'
type LoadState = 'idle' | 'loading' | 'ready' | 'error'
type MapLayerFilter = Parameters<Map['setFilter']>[1]

const SF_BOUNDS: LngLatBoundsLike = [
  [-122.53, 37.69],
  [-122.35, 37.84],
]

const SF_CENTER: [number, number] = [-122.4305, 37.7677]

const focusOptions: Array<{ key: FocusKey; label: string; mapLabel: string }> = [
  { key: 'overall', label: 'Overall', mapLabel: 'Selected crash records' },
  { key: 'volume', label: 'Most Crashes', mapLabel: 'Top-neighborhood records' },
  { key: 'severe', label: 'Severe/Fatal', mapLabel: 'Severe/fatal records' },
  { key: 'ped-bike', label: 'Walk/Bike', mapLabel: 'Pedestrian/bicycle records' },
]

const fallbackPeriodOptions: SfCrashMapPeriodOption[] = [
  {
    key: 'last12',
    label: 'Last 12 months',
    description: 'The freshest one-year crash window DataSF currently supports.',
    startDate: null,
    endDate: null,
  },
  {
    key: 'last3',
    label: 'Last 3 years',
    description: 'A recent enough window to reduce noise without losing the neighborhood pattern.',
    startDate: null,
    endDate: null,
  },
  {
    key: 'since2020',
    label: 'Since 2020',
    description: 'The full recent archive used for neighborhood context.',
    startDate: null,
    endDate: null,
  },
]

const mapStyle = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-opacity': 0.34,
        'raster-saturation': -0.82,
        'raster-contrast': 0.12,
      },
    },
  ],
}

export default function SfCrashMapAtlas() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const latestMapStateRef = useRef<{
    atlas: SfCrashMapAtlasData | null
    activeFocus: FocusKey
    volumeIds: Set<string>
    selectedNeighborhoodId: string | null
  }>({
    atlas: null,
    activeFocus: 'overall',
    volumeIds: new Set(),
    selectedNeighborhoodId: null,
  })
  const [atlasByPeriod, setAtlasByPeriod] = useState<
    Partial<Record<SfCrashMapPeriodKey, SfCrashMapAtlasData>>
  >({})
  const [periodOptions, setPeriodOptions] =
    useState<SfCrashMapPeriodOption[]>(fallbackPeriodOptions)
  const [activePeriod, setActivePeriod] = useState<SfCrashMapPeriodKey>('last3')
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeFocus, setActiveFocus] = useState<FocusKey>('overall')
  const [query, setQuery] = useState('')
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const atlas = atlasByPeriod[activePeriod] || null

  useEffect(() => {
    let cancelled = false

    async function loadAtlas() {
      if (atlasByPeriod[activePeriod] && reloadKey === 0) {
        setLoadState('ready')
        return
      }

      setLoadState('loading')
      setErrorMessage('')

      try {
        const response = await fetch(`/api/sf-crash-map?period=${activePeriod}`)
        if (!response.ok) {
          throw new Error(`SF Crash Map API returned ${response.status}`)
        }

        const nextPayload = (await response.json()) as SfCrashMapAtlasPeriodResponse
        if (!cancelled) {
          setPeriodOptions(nextPayload.periodOptions)
          setAtlasByPeriod((current) => ({
            ...current,
            [nextPayload.activePeriod]: nextPayload.atlas,
          }))
          setReloadKey(0)
          setLoadState('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState('error')
          setErrorMessage(error instanceof Error ? error.message : 'DataSF data could not load.')
        }
      }
    }

    loadAtlas()

    return () => {
      cancelled = true
    }
  }, [activePeriod, atlasByPeriod, reloadKey])

  const activePeriodOption =
    periodOptions.find((period) => period.key === activePeriod) || fallbackPeriodOptions[1]
  const activeFocusOption =
    focusOptions.find((focus) => focus.key === activeFocus) || focusOptions[0]

  const volumeIds = useMemo(() => {
    if (!atlas) return new Set<string>()

    return new Set(
      [...atlas.neighborhoods]
        .sort(
          (a, b) =>
            b.recentCrashCount - a.recentCrashCount ||
            b.score - a.score ||
            a.neighborhoodName.localeCompare(b.neighborhoodName)
        )
        .slice(0, 15)
        .map((neighborhood) => neighborhood.id)
    )
  }, [atlas])

  const focusedNeighborhoods = useMemo(() => {
    if (!atlas) return []

    const normalizedQuery = query.trim().toLowerCase()
    return atlas.neighborhoods
      .filter((neighborhood) => {
        if (!normalizedQuery) return true

        const searchable = [
          neighborhood.neighborhoodName,
          neighborhood.neighborhoodKey,
          ...neighborhood.supervisorDistricts,
        ]
          .join(' ')
          .toLowerCase()
        return searchable.includes(normalizedQuery)
      })
      .sort((a, b) => compareNeighborhoodsForFocus(a, b, activeFocus))
      .slice(0, 80)
  }, [activeFocus, atlas, query])

  const selectedNeighborhood = useMemo(() => {
    if (!atlas || !selectedNeighborhoodId) return null
    return (
      atlas.neighborhoods.find((neighborhood) => neighborhood.id === selectedNeighborhoodId) || null
    )
  }, [atlas, selectedNeighborhoodId])

  latestMapStateRef.current = {
    atlas,
    activeFocus,
    volumeIds,
    selectedNeighborhoodId,
  }

  useEffect(() => {
    if (!atlas || !mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle as maplibregl.StyleSpecification,
      center: SF_CENTER,
      zoom: 11.25,
      maxBounds: SF_BOUNDS,
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: {
        compact: false,
      },
    })

    mapRef.current = map
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      className: 'sf-crash-map-popup',
    })
    popupRef.current = popup

    map.on('load', () => {
      const latest = latestMapStateRef.current
      addAtlasLayers(map, latest.atlas || atlas, popup)
      syncCrashLayerFilters(
        map,
        latest.activeFocus,
        latest.volumeIds,
        latest.selectedNeighborhoodId
      )
      map.fitBounds(SF_BOUNDS, { padding: 22, duration: 0 })
    })
  }, [atlas])

  useEffect(() => {
    return () => {
      popupRef.current?.remove()
      mapRef.current?.remove()
      popupRef.current = null
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!atlas || !map || !map.isStyleLoaded()) return

    const crashSource = map.getSource('crashes') as GeoJSONSource | undefined
    crashSource?.setData(atlas.crashes as GeoJSON.FeatureCollection)
    const latest = latestMapStateRef.current
    syncCrashLayerFilters(map, latest.activeFocus, latest.volumeIds, latest.selectedNeighborhoodId)
  }, [atlas])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getLayer('crash-points')) return

    syncCrashLayerFilters(map, activeFocus, volumeIds, selectedNeighborhoodId)
  }, [activeFocus, selectedNeighborhoodId, volumeIds])

  const selectNeighborhood = useCallback(
    (neighborhood: SfCrashMapNeighborhood) => {
      if (selectedNeighborhoodId !== neighborhood.id) {
        setSelectedNeighborhoodId(neighborhood.id)
      }

      const map = mapRef.current
      if (!atlas || !map) return

      const bounds = getNeighborhoodBounds(atlas.crashes.features, neighborhood.id, activeFocus)
      if (bounds) {
        map.stop()
        map.fitBounds(bounds, {
          padding: {
            top: 80,
            bottom: 80,
            left: 80,
            right: 80,
          },
          duration: 950,
          easing: easeOutCubic,
          maxZoom: 14.4,
        })
      }
    },
    [activeFocus, atlas, selectedNeighborhoodId]
  )

  const resetMap = useCallback(() => {
    setSelectedNeighborhoodId(null)
    mapRef.current?.stop()
    mapRef.current?.fitBounds(SF_BOUNDS, {
      padding: 22,
      duration: 900,
      easing: easeOutCubic,
    })
  }, [])

  const totalNeighborhoods = atlas?.neighborhoods.length || 0
  const severeShare = atlas
    ? formatPercent(atlas.stats.severeFatalCrashCount, atlas.stats.recentInjuryCrashCount)
    : '...'
  const pedBikeShare = atlas
    ? formatPercent(atlas.stats.pedBikeCrashCount, atlas.stats.recentInjuryCrashCount)
    : '...'
  const mapCrashCount = atlas
    ? formatNumber(countCrashesForFocus(atlas.crashes.features, activeFocus, volumeIds))
    : '...'
  const latestCollisionDate = atlas ? formatDate(atlas.stats.latestCollisionDate) : 'Loading'
  const dataLoadedAt = atlas ? formatDate(atlas.stats.crashesDataLoadedAt) : 'Loading'
  const periodRange = atlas
    ? formatPeriodRange(
        atlas.crashPeriodStartDate,
        atlas.crashPeriodEndDate,
        atlas.recentCrashesSinceYear
      )
    : 'Loading DataSF'

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-neutral-100 text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(460px,48vw)]">
        <section className="order-2 min-w-0 bg-neutral-50 lg:order-1 dark:bg-neutral-950">
          <header className="border-b border-white/10 bg-neutral-950/95 px-5 py-3 text-white sm:px-8 lg:px-10">
            <div className="mx-auto flex items-center justify-between gap-4">
              <Link
                href="/sf-crash-map"
                className="sf-crash-map-masthead text-white transition hover:text-red-100"
              >
                SF Crash Map
              </Link>
            </div>
          </header>
          <div className="bg-white px-5 py-4 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-neutral-950">
            <div>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-none tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl dark:text-white">
                SF injury crashes
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg dark:text-neutral-300">
                Explore recent DataSF crash records across San Francisco neighborhoods, including
                severe, fatal, pedestrian, and bicycle-involved crashes.
              </p>
            </div>

            <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/10 dark:bg-white/10">
              <StatTile
                label="Neighborhoods"
                value={atlas ? formatNumber(atlas.stats.neighborhoodCount) : '...'}
                detail={`${formatNumber(totalNeighborhoods)} ranked areas`}
                tone="teal"
              />
              <StatTile
                label="Injury crashes"
                value={atlas ? formatNumber(atlas.stats.recentInjuryCrashCount) : '...'}
                detail={periodRange}
                tone="amber"
              />
              <StatTile
                label="Severe/Fatal"
                value={atlas ? formatNumber(atlas.stats.severeFatalCrashCount) : '...'}
                detail={`${severeShare} of recent crashes`}
                tone="red"
              />
              <StatTile
                label="Ped/Bike involved"
                value={atlas ? formatNumber(atlas.stats.pedBikeCrashCount) : '...'}
                detail={`${pedBikeShare} of recent crashes`}
                tone="cyan"
              />
            </div>

            <div className="mt-6 rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Crash window
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1 rounded-md border border-neutral-300 bg-white p-1 dark:border-white/15 dark:bg-neutral-950">
                {periodOptions.map((period) => (
                  <button
                    key={period.key}
                    type="button"
                    aria-pressed={activePeriod === period.key}
                    className={cn(
                      'min-h-14 rounded px-2 py-2 text-center transition',
                      activePeriod === period.key
                        ? 'bg-neutral-950 text-white shadow-sm dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white'
                    )}
                    onClick={() => {
                      setActivePeriod(period.key)
                      setSelectedNeighborhoodId(null)
                    }}
                  >
                    <span className="block text-xs font-bold uppercase tracking-[0.08em]">
                      {getPeriodButtonLabel(period.key)}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium leading-4 text-current opacity-70">
                      {getPeriodButtonHint(period)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 py-2 sm:px-8 lg:px-10">
            <div className="sticky top-0 z-20 -mx-5 border-y border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 dark:border-white/10 dark:bg-neutral-950/95">
              <div className="grid gap-3">
                <div
                  className="grid w-full grid-cols-2 gap-1 rounded-md border border-neutral-300 bg-neutral-100 p-1 sm:grid-cols-4 dark:border-white/15 dark:bg-neutral-900"
                  aria-label="Map focus"
                >
                  {focusOptions.map((focus) => (
                    <button
                      key={focus.key}
                      className={cn(
                        'h-9 w-full rounded px-3 text-xs font-bold uppercase tracking-[0.08em] transition',
                        activeFocus === focus.key
                          ? 'bg-neutral-950 text-white shadow-sm dark:bg-white dark:text-neutral-950'
                          : 'text-neutral-600 hover:bg-white hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
                      )}
                      type="button"
                      onClick={() => {
                        setActiveFocus(focus.key)
                        setSelectedNeighborhoodId(null)
                      }}
                    >
                      {focus.label}
                    </button>
                  ))}
                </div>

                <label className="relative block w-full">
                  <span className="sr-only">Search neighborhoods</span>
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500"
                    aria-hidden="true"
                  >
                    Find
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 pl-16 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                    placeholder="Neighborhood"
                    type="search"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950">
              <div className="hidden grid-cols-[48px_minmax(170px,1.3fr)_88px_88px_88px_78px] gap-3 border-b border-neutral-200 bg-neutral-100 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 md:grid">
                <span>Rank</span>
                <span>Neighborhood</span>
                <span className="text-right">Crashes</span>
                <span className="text-right">Severe</span>
                <span className="text-right">Ped/Bike</span>
                <span className="text-right">Index</span>
              </div>

              {loadState === 'error' ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-base font-semibold text-neutral-950 dark:text-white">
                    DataSF did not load.
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    className="mt-5 h-10 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                    onClick={() => setReloadKey((key) => key + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : loadState !== 'ready' ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-md bg-neutral-100 dark:bg-white/10"
                    />
                  ))}
                </div>
              ) : focusedNeighborhoods.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No neighborhoods match this search.
                </div>
              ) : (
                <div>
                  {focusedNeighborhoods.map((neighborhood, index) => (
                    <button
                      key={neighborhood.id}
                      type="button"
                      className={cn(
                        'grid w-full gap-2 border-b border-neutral-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-neutral-50 dark:border-white/10 dark:hover:bg-white/5 md:grid-cols-[48px_minmax(170px,1.3fr)_88px_88px_88px_78px] md:items-center md:gap-3',
                        selectedNeighborhoodId === neighborhood.id &&
                          'bg-red-50 outline outline-1 outline-red-200 dark:bg-red-500/10 dark:outline-red-400/30'
                      )}
                      onClick={() => selectNeighborhood(neighborhood)}
                    >
                      <span className="hidden text-sm font-bold tabular-nums text-neutral-400 md:block">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 flex-none rounded-sm bg-red-500"
                            aria-hidden="true"
                          />
                          <span className="truncate text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
                            <span className="md:hidden">{index + 1}. </span>
                            {neighborhood.neighborhoodName}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {neighborhood.supervisorDistricts.length > 0
                            ? neighborhood.supervisorDistricts.join(', ')
                            : `Latest ${formatDate(neighborhood.latestCollisionDate)}`}
                        </p>
                      </div>
                      <Metric value={neighborhood.recentCrashCount} label="Crashes" />
                      <Metric value={neighborhood.severeFatalCrashCount} label="Severe" />
                      <Metric value={neighborhood.pedBikeCrashCount} label="Ped/Bike" />
                      <Metric value={neighborhood.score} label="Index" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <footer className="bg-neutral-950 px-5 py-5 text-xs leading-6 text-neutral-400 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Updated {dataLoadedAt}</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <a
                  className="font-semibold hover:text-white"
                  href="https://data.sfgov.org/d/ubvf-ztfx"
                  target="_blank"
                  rel="noreferrer"
                >
                  DataSF source
                </a>
                <span>
                  By{' '}
                  <Link className="font-semibold text-white hover:text-teal-200" href="/">
                    Marcelo Carmona
                  </Link>
                </span>
              </div>
            </div>
          </footer>
        </section>

        <aside className="order-1 bg-neutral-950 lg:sticky lg:top-0 lg:order-2 lg:h-dvh lg:self-start">
          <div className="relative h-[420px] lg:h-full">
            <div ref={mapContainerRef} className="sf-crash-map-map h-full w-full" />

            <div className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-md bg-neutral-950/90 px-3 py-2 text-xs text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
              <div className="font-semibold">Map focus</div>
              <div className="mt-1 text-neutral-300">
                {mapCrashCount} {activeFocusOption.mapLabel.toLowerCase()} ·{' '}
                {activePeriodOption.label}
              </div>
            </div>

            {selectedNeighborhood ? (
              <button
                type="button"
                className="absolute right-4 top-4 rounded-md bg-neutral-950/90 px-3 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 transition hover:bg-neutral-900"
                onClick={resetMap}
              >
                Reset map
              </button>
            ) : null}

            <div className="absolute bottom-4 left-4 w-[min(310px,calc(100%-2rem))] rounded-md bg-neutral-950/92 p-4 text-xs text-white shadow-2xl ring-1 ring-white/10 backdrop-blur">
              <div className="font-semibold">Crash Records</div>
              <div className="mt-1 text-neutral-400">
                {selectedNeighborhood
                  ? selectedNeighborhood.neighborhoodName
                  : activePeriodOption.label}
              </div>
              <div className="mt-3 space-y-2">
                {activeFocus !== 'ped-bike' ? (
                  <LegendRow color="#f43f5e" label="Severe or fatal record" round />
                ) : null}
                {activeFocus !== 'severe' ? (
                  <LegendRow color="#22d3ee" label="Pedestrian or bicycle record" round />
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function addAtlasLayers(map: Map, atlas: SfCrashMapAtlasData, popup: maplibregl.Popup) {
  map.addSource('crashes', {
    type: 'geojson',
    data: atlas.crashes as GeoJSON.FeatureCollection,
    promoteId: 'unique_id',
  })

  map.addLayer({
    id: 'crash-points',
    type: 'circle',
    source: 'crashes',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 1.6, 14, 4.2, 16, 5.8],
      'circle-color': ['match', ['get', 'crashKind'], 'severe-fatal', '#f43f5e', '#22d3ee'],
      'circle-stroke-color': '#0a0a0a',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 10, 0.45, 14, 1],
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 13, 0.82],
    },
  })

  map.addLayer({
    id: 'crash-selected',
    type: 'circle',
    source: 'crashes',
    filter: ['==', ['get', 'neighborhoodId'], ''],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 14, 7, 16, 9],
      'circle-color': ['match', ['get', 'crashKind'], 'severe-fatal', '#f43f5e', '#22d3ee'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-opacity': 0.95,
    },
  })

  map.on('mousemove', 'crash-points', (event) => {
    const feature = event.features?.[0] as SfCrashMapFeature<SfCrashMapCrashProperties> | undefined
    if (!feature) return
    map.getCanvas().style.cursor = 'pointer'
    popup.setLngLat(event.lngLat).setDOMContent(crashPopup(feature.properties)).addTo(map)
  })
  map.on('mouseleave', 'crash-points', () => {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })
}

function syncCrashLayerFilters(
  map: Map,
  activeFocus: FocusKey,
  volumeIds: Set<string>,
  selectedNeighborhoodId: string | null
) {
  if (map.getLayer('crash-points')) {
    map.setFilter('crash-points', getCrashPointFilter(activeFocus, volumeIds))
  }

  if (map.getLayer('crash-selected')) {
    map.setFilter('crash-selected', getSelectedCrashFilter(selectedNeighborhoodId, activeFocus))
  }
}

function getCrashPointFilter(activeFocus: FocusKey, volumeIds: Set<string>): MapLayerFilter {
  if (activeFocus === 'severe') {
    return asMapFilter(['==', ['get', 'crashKind'], 'severe-fatal'])
  }

  if (activeFocus === 'ped-bike') {
    return asMapFilter(['==', ['get', 'crashKind'], 'ped-bike'])
  }

  if (activeFocus === 'volume') {
    const ids = Array.from(volumeIds)
    return ids.length > 0
      ? asMapFilter(['in', ['get', 'neighborhoodId'], ['literal', ids]])
      : asMapFilter(['==', ['get', 'neighborhoodId'], '__none__'])
  }

  return null
}

function getSelectedCrashFilter(
  selectedNeighborhoodId: string | null,
  activeFocus: FocusKey
): MapLayerFilter {
  if (!selectedNeighborhoodId) {
    return asMapFilter(['==', ['get', 'neighborhoodId'], '__none__'])
  }

  const neighborhoodFilter = ['==', ['get', 'neighborhoodId'], selectedNeighborhoodId]

  if (activeFocus === 'severe') {
    return asMapFilter(['all', neighborhoodFilter, ['==', ['get', 'crashKind'], 'severe-fatal']])
  }

  if (activeFocus === 'ped-bike') {
    return asMapFilter(['all', neighborhoodFilter, ['==', ['get', 'crashKind'], 'ped-bike']])
  }

  return asMapFilter(neighborhoodFilter)
}

function asMapFilter(expression: unknown): MapLayerFilter {
  return expression as MapLayerFilter
}

function compareNeighborhoodsForFocus(
  a: SfCrashMapNeighborhood,
  b: SfCrashMapNeighborhood,
  activeFocus: FocusKey
) {
  return (
    getNeighborhoodFocusValue(b, activeFocus) - getNeighborhoodFocusValue(a, activeFocus) ||
    b.score - a.score ||
    b.recentCrashCount - a.recentCrashCount ||
    a.neighborhoodName.localeCompare(b.neighborhoodName)
  )
}

function getNeighborhoodFocusValue(neighborhood: SfCrashMapNeighborhood, activeFocus: FocusKey) {
  if (activeFocus === 'volume') return neighborhood.recentCrashCount
  if (activeFocus === 'severe') return neighborhood.severeFatalCrashCount
  if (activeFocus === 'ped-bike') return neighborhood.pedBikeCrashCount
  return neighborhood.score
}

function countCrashesForFocus(
  features: Array<SfCrashMapFeature<SfCrashMapCrashProperties>>,
  activeFocus: FocusKey,
  volumeIds: Set<string>
) {
  return features.filter((feature) => crashMatchesFocus(feature, activeFocus, volumeIds)).length
}

function crashMatchesFocus(
  feature: SfCrashMapFeature<SfCrashMapCrashProperties>,
  activeFocus: FocusKey,
  volumeIds: Set<string>
) {
  if (activeFocus === 'severe') return feature.properties.crashKind === 'severe-fatal'
  if (activeFocus === 'ped-bike') return feature.properties.crashKind === 'ped-bike'
  if (activeFocus === 'volume') return volumeIds.has(feature.properties.neighborhoodId)
  return true
}

function StatTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail: string
  tone: 'teal' | 'amber' | 'red' | 'cyan'
}) {
  const tones: Record<typeof tone, string> = {
    teal: 'bg-teal-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
  }

  return (
    <div className="flex min-h-36 flex-col bg-white p-4 dark:bg-neutral-950">
      <div className="flex min-h-8 items-start gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
        <span className={cn('h-2.5 w-2.5 rounded-sm', tones[tone])} aria-hidden="true" />
        <span className="leading-4">{label}</span>
      </div>
      <div className="mt-3 min-h-9 text-3xl font-bold leading-none tracking-tight text-neutral-950 tabular-nums dark:text-white">
        {value}
      </div>
      <div className="mt-2 min-h-10 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
        {detail}
      </div>
    </div>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm md:block md:text-right">
      <span className="text-xs text-neutral-500 dark:text-neutral-400 md:hidden">{label}</span>
      <span className="font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
        {formatNumber(value)}
      </span>
    </div>
  )
}

function LegendRow({
  color,
  label,
  round = false,
}: {
  color: string
  label: string
  round?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-neutral-300">
      <span
        className={cn('h-2.5 w-2.5 flex-none', round ? 'rounded-full' : 'rounded-sm')}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </div>
  )
}

function crashPopup(properties: SfCrashMapCrashProperties) {
  const root = document.createElement('div')
  const location = [properties.primary_rd, properties.secondary_rd].filter(Boolean).join(' / ')
  root.className = 'min-w-56 rounded-md bg-neutral-950 p-3 text-xs text-white shadow-xl'
  root.innerHTML = `
    <div class="text-sm font-bold">${escapeHtml(properties.neighborhoodName)}</div>
    <div class="mt-1 text-neutral-300">${escapeHtml(location || 'Crash record')}</div>
    <div class="mt-2 text-neutral-400">${escapeHtml(properties.collision_severity || 'Injury crash')}</div>
    <div class="mt-2 text-neutral-400">${escapeHtml(properties.dph_col_grp_description || 'Crash group unavailable')}</div>
    <div class="mt-2 text-neutral-400">${formatDate(properties.collision_date)}</div>
  `
  return root
}

function getNeighborhoodBounds(
  features: Array<SfCrashMapFeature<SfCrashMapCrashProperties>>,
  neighborhoodId: string,
  activeFocus: FocusKey
) {
  const bounds = new maplibregl.LngLatBounds()
  let pointCount = 0
  const focusRequiresCrashKind = activeFocus === 'severe' || activeFocus === 'ped-bike'

  features
    .filter(
      (feature) =>
        feature.properties.neighborhoodId === neighborhoodId &&
        (!focusRequiresCrashKind || crashMatchesFocus(feature, activeFocus, new Set()))
    )
    .forEach((feature) => {
      pointCount += extendBounds(bounds, feature.geometry?.coordinates)
    })

  if (pointCount > 0) return bounds
  if (!focusRequiresCrashKind) return null

  features
    .filter((feature) => feature.properties.neighborhoodId === neighborhoodId)
    .forEach((feature) => {
      pointCount += extendBounds(bounds, feature.geometry?.coordinates)
    })

  return pointCount > 0 ? bounds : null
}

function extendBounds(bounds: maplibregl.LngLatBounds, coordinates: unknown): number {
  if (!Array.isArray(coordinates)) return 0
  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    bounds.extend([coordinates[0], coordinates[1]])
    return 1
  }

  return coordinates.reduce((count, child) => count + extendBounds(bounds, child), 0)
}

function formatNumber(value: number | string | null | undefined) {
  const number = typeof value === 'number' ? value : Number(value || 0)
  return Number.isInteger(number)
    ? number.toLocaleString('en-US')
    : number.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

function formatPercent(value: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

function getPeriodButtonLabel(periodKey: SfCrashMapPeriodKey) {
  const labels: Record<SfCrashMapPeriodKey, string> = {
    last12: '12 mo.',
    last3: '3 years',
    since2020: '2020+',
  }

  return labels[periodKey]
}

function getPeriodButtonHint(period: SfCrashMapPeriodOption) {
  if (period.key === 'since2020') return 'Full context'
  if (period.startDate && period.endDate) {
    return `${formatShortYear(period.startDate)}-${formatShortYear(period.endDate)}`
  }

  return period.label.replace('Last ', '')
}

function formatPeriodRange(
  startDate: string | null,
  endDate: string | null,
  recentCrashesSinceYear: number
) {
  if (startDate && endDate) return `${formatDate(startDate)} to ${formatDate(endDate)}`
  if (endDate) return `Since ${recentCrashesSinceYear} through ${formatDate(endDate)}`
  return `Since ${recentCrashesSinceYear}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Unavailable'

  const date = toDisplayDate(value)
  if (Number.isNaN(date.getTime())) return 'Unavailable'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatShortYear(value: string) {
  const date = toDisplayDate(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 4)
  return new Intl.DateTimeFormat('en-US', { year: '2-digit' }).format(date)
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function toDisplayDate(value: string) {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  }

  return new Date(value)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
