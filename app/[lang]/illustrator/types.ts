export type Project = {
    id: string;
    name: string;
    artboards: Artboard[];
    layers: Layer[];
    activeArtboardId: string;
    activeLayerId: string;
    preferences: Preferences;
};

export type Point = { x: number; y: number }

export type Element = {
    id: string;
    type: 'path' | 'shape' | 'line';
    tool: string;
    points?: Point[];
    start?: Point;
    end?: Point;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    name: string;
    layerId: string;
    groupId?: string;
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    angle: number;
    opacity: number;
    shadow?: { x: number; y: number; blur: number; color: string };
    isHidden: boolean;
    isLocked: boolean;
}

export type Group = {
    id: string;
    name: string;
    elementIds: string[];
    layerId: string;
    isExpanded: boolean;
    isHidden: boolean;
    isLocked: boolean;
}

export type Layer = {
    id: string;
    name: string;
    elements: Element[];
    groups: Group[];
    isHidden: boolean;
    isLocked: boolean;
}

export type Artboard = {
    id: string;
    name: string;
    width: number;
    height: number;
    layers: Layer[];
    zoom: number;
    pan: { x: number; y: number };
    isVisible?: boolean;
}


export type Guide = {
    id: string;
    position: number;
    orientation: 'horizontal' | 'vertical';
}

export type Preferences = {
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
    showRulers: boolean;
    showGuides: boolean;
}