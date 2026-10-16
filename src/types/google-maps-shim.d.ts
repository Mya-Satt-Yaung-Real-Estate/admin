/**
 * Minimal Google Maps typings for Property Note maps (avoid blocked npm @types).
 * DrawingManager removed in Maps JS API 3.55+ / 3.65 — do not type it.
 */

declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    getZoom(): number | undefined;
    setMapTypeId(id: string): void;
    fitBounds(bounds: LatLngBounds, padding?: number | LatLngBoundsLiteral): void;
    getDiv(): HTMLElement;
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng | null;
    setMap(map: Map | null): void;
    setIcon(icon: string | Icon | Symbol | null): void;
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener;
  }

  class Polygon {
    constructor(opts?: PolygonOptions);
    setMap(map: Map | null): void;
    setEditable(editable: boolean): void;
    setOptions(opts: PolygonOptions): void;
    getPath(): MVCArray<LatLng>;
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener;
  }

  class Polyline {
    constructor(opts?: PolylineOptions);
    setMap(map: Map | null): void;
    setPath(path: LatLng[] | LatLngLiteral[] | MVCArray<LatLng>): void;
    getPath(): MVCArray<LatLng>;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    setContent(content: string | Element): void;
    setPosition(position: LatLng | LatLngLiteral): void;
    open(opts?: InfoWindowOpenOptions | Map, anchor?: Marker): void;
    close(): void;
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    isEmpty(): boolean;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  class MVCArray<T> {
    getArray(): T[];
    getLength(): number;
    getAt(i: number): T;
    push(elem: T): number;
    clear(): void;
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener;
  }

  class OverlayView {
    setMap(map: Map | null): void;
    getMap(): Map | null;
    getPanes(): MapPanes | null;
    getProjection(): MapCanvasProjection;
    onAdd(): void;
    draw(): void;
    onRemove(): void;
  }

  interface MapPanes {
    overlayMouseTarget: Element;
    overlayLayer: Element;
    floatPane: Element;
  }

  interface MapCanvasProjection {
    fromLatLngToDivPixel(latLng: LatLng | LatLngLiteral): Point | null;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  interface Icon {
    url: string;
    scaledSize?: Size;
    size?: Size;
    anchor?: Point;
  }

  interface Symbol {
    path: string | number;
    scale?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    disableDefaultUI?: boolean;
    disableDoubleClickZoom?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: {
      position?: number;
    };
    mapTypeControl?: boolean;
    mapTypeControlOptions?: {
      style?: number;
      position?: number;
      mapTypeIds?: string[];
    };
    gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    clickableIcons?: boolean;
    rotateControl?: boolean;
    scaleControl?: boolean;
  }

  interface MarkerOptions {
    map?: Map | null;
    position?: LatLng | LatLngLiteral;
    draggable?: boolean;
    title?: string;
    icon?: string | Icon | Symbol;
    zIndex?: number;
  }

  interface PolygonOptions {
    map?: Map | null;
    paths?: LatLng[] | LatLngLiteral[] | LatLng[][];
    editable?: boolean;
    draggable?: boolean;
    clickable?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    zIndex?: number;
  }

  interface PolylineOptions {
    map?: Map | null;
    path?: LatLng[] | LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    clickable?: boolean;
  }

  interface InfoWindowOptions {
    content?: string | Element;
    maxWidth?: number;
    pixelOffset?: Size;
  }

  interface InfoWindowOpenOptions {
    map?: Map | null;
    anchor?: Marker;
    position?: LatLng | LatLngLiteral;
  }

  interface MapMouseEvent {
    latLng: LatLng | null;
  }

  interface MapsEventListener {
    remove(): void;
  }

  enum MapTypeControlStyle {
    DEFAULT = 0,
    HORIZONTAL_BAR = 1,
    DROPDOWN_MENU = 2,
  }

  enum ControlPosition {
    TOP_LEFT = 1,
    TOP_CENTER = 2,
    TOP_RIGHT = 3,
    LEFT_CENTER = 4,
    LEFT_TOP = 5,
    LEFT_BOTTOM = 6,
    RIGHT_TOP = 7,
    RIGHT_CENTER = 13,
    RIGHT_BOTTOM = 8,
    BOTTOM_RIGHT = 9,
    BOTTOM_LEFT = 10,
    BOTTOM_CENTER = 11,
  }

  const MapTypeId: {
    ROADMAP: string;
    SATELLITE: string;
    HYBRID: string;
    TERRAIN: string;
  };

  function importLibrary(name: string): Promise<unknown>;

  namespace places {
    /** Legacy — prefer PlaceAutocompleteElement (Places API New). */
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      fields?: string[];
      types?: string[];
    }

    interface PlaceResult {
      geometry?: {
        location?: LatLng;
      };
      name?: string;
      formatted_address?: string;
    }

    /** Places API (New) autocomplete widget. */
    class PlaceAutocompleteElement extends HTMLElement {
      constructor(opts?: PlaceAutocompleteElementOptions);
      placeholder: string;
      includedRegionCodes?: string[];
    }

    interface PlaceAutocompleteElementOptions {
      placeholder?: string;
      includedRegionCodes?: string[];
    }

    interface PlacePredictionSelectEvent extends Event {
      placePrediction?: PlacePrediction;
    }

    interface PlacePrediction {
      toPlace(): Place;
    }

    interface Place {
      fetchFields(opts: { fields: string[] }): Promise<void>;
      location?: LatLng | null;
      displayName?: string | null;
      formattedAddress?: string | null;
    }
  }

  const event: {
    clearInstanceListeners(instance: object): void;
    removeListener(listener: MapsEventListener): void;
    trigger(instance: object, eventName: string, ...args: unknown[]): void;
    addListenerOnce(
      instance: object,
      eventName: string,
      handler: (...args: unknown[]) => void
    ): MapsEventListener;
  };
}

declare namespace google {
  const maps: typeof google.maps;
}

interface Window {
  google?: typeof google;
}
