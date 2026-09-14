/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * ************************************************************************************
 * *******************************   MARKER COMPONENT   *******************************
 * ************************************************************************************
 *
 * A reusable React Leaflet marker for visualizing a vessel in the Lotusim
 * simulation map. The marker dynamically scales with zoom level and rotates
 * based on the vessel's heading.
 *
 * Features:
 * - Renders a custom divIcon styled as a blue arrow.
 * - Scales icon size relative to current map zoom level.
 * - Rotates icon according to vessel heading (pose).
 * - Displays a popup with vessel name, coordinates, and optional info.
 *
 */

import React, { useMemo } from 'react';
import { VesselPosition } from '../../types';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';

// Outline color per domain
const DOMAIN_OUTLINE_COLORS: Record<string, string> = {
  air: '#ffffff',          // air
  surface: '#000080',      // surface
  underwater: '#800080',   // underwater
} as const;

const DEFAULT_OUTLINE_COLOR = '#888888'; // fallback if domain is missing/unrecognized

type VesselDomain = keyof typeof DOMAIN_OUTLINE_COLORS;

const UNDERWATER_THRESHOLD = -10;
const AERIAL_THRESHOLD = 10;

const getDomainFromAltitude = (altitude?: number | null): VesselDomain => {
  if (altitude == null) return 'surface';
  if (altitude < UNDERWATER_THRESHOLD) return 'underwater';
  if (altitude > AERIAL_THRESHOLD) return 'air';
  return 'surface';
};

const getDomainOutlineColor = (altitude?: number | null): string => {
  return DOMAIN_OUTLINE_COLORS[getDomainFromAltitude(altitude)];
};

const getVesselFillColor = (key: string): string => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  // Fixed saturation/lightness chosen to stay distinguishable from the
  // white/black/light-blue outline colors while remaining vivid.
  return `hsl(${hue}, 70%, 45%)`;
};

/**
 * VesselMarkerComponent
 *
 * A memoized React component that renders a vessel marker on the map.
 *
 * @param vessel - Vessel data with position and heading.
 * @param zoomLevel - Current zoom level to dynamically size the marker.
 */
export const VesselMarkerComponent: React.FC<{
  vessel: VesselPosition;
  zoomLevel: number;
  onRemove?: (vesselName: string) => void;
}> = React.memo(({ vessel, zoomLevel, onRemove }) => {
  const getIconSize = (zoomLevel: number) => {
    const baseSize = 2;
    const scaledSize = baseSize + zoomLevel *1.5;
    return [scaledSize, scaledSize * 1.625];
  };

  const customIcon = useMemo(() => {
    const [w, h] = getIconSize(zoomLevel);
    const fillColor = getVesselFillColor(vessel.vesselName ?? '');
    const strokeColor = getDomainOutlineColor(vessel.geoPoint?.altitude);
    const strokeWidth = Math.max(2.5, w * 0.3);
    // Scale sprite background proportionally with icon size so the same arrow cell
    // stays visible at every zoom level. SPRITE_CELL_W is the arrow's pixel width
    // in the sprite at the zoom level the original offsets were calibrated for (zoom 15).
    // const SPRITE_CELL_W = 15.5;
    // const scale = w / SPRITE_CELL_W;
    // const bgW = 251 * scale;
    // const bgH = 175 * scale;
    // const bgX = -6 * scale;
    // return divIcon({
    //   iconSize: [w, h],
    //   iconAnchor: [w / 2, h / 2],
    //   popupAnchor: [0, -h / 2],
    //   className: '',
    //   html: `<div
    //           class="blue-arrow-icon"
    //           style="
    //             width:${w}px;
    //             height:${h}px;
    //             background-image:url('/sprite_medium.png');
    //             background-position:${bgX}px 0px;
    //             background-size:${bgW}px ${bgH}px;
    //             transform: rotate(${(vessel.heading ?? 0)}deg);
    //             transform-origin: center center;
    //           ">
    //         </div>`,
    // });
    const arrowSvg = `
      <svg
        width="${w}"
        height="${h}"
        viewBox="0 0 100 150"
        xmlns="http://www.w3.org/2000/svg"
        style="transform: rotate(${(vessel.heading ?? 0)}deg); transform-origin: center center; overflow: visible;"
      >
        <path
          d="M50 0 L90 150 L50 120 L10 150 Z"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
        />
      </svg>`;

    return divIcon({
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
      popupAnchor: [0, -h / 2],
      className: '',
      html: `<div class="vessel-icon" style="width:${w}px;height:${h}px;">${arrowSvg}</div>`,
    });
  }, [zoomLevel, vessel.heading, vessel.vesselName, vessel.geoPoint?.altitude]);

  if (vessel.geoPoint?.latitude == null || vessel.geoPoint?.longitude == null) return null;

  return (
    <Marker position={[vessel.geoPoint.latitude, vessel.geoPoint.longitude]} icon={customIcon}>
      <Popup>
        <strong>Vessel: {vessel.vesselName}</strong>
        <br />
        Latitude: {vessel.geoPoint.latitude}
        <br />
        Longitude: {vessel.geoPoint.longitude}
        <br />
        Altitude: {vessel.geoPoint.altitude}
        <br />
        Heading: {vessel.heading}
        <br />
        {onRemove && (
          <button
            onClick={() => onRemove(vessel.vesselName)}
            style={{
              marginTop: 6,
              color: 'red',
              background: 'none',
              border: '1px solid red',
              borderRadius: 4,
              cursor: 'pointer',
              padding: '2px 8px',
            }}
          >
            Remove
          </button>
        )}
      </Popup>
    </Marker>
  );
});
