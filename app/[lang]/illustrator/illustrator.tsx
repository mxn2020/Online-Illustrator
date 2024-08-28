'use client'

import NextImage from 'next/image';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import Link from 'next/link';

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PenTool, Pencil, Paintbrush, Eraser, Square, Circle, Triangle, Star, Type, Palette, Layers, Layout, Move, Maximize2, MinusSquare, Edit3, Image as ImageIcon, Share2, History, Package, Keyboard, Trash2, ChevronUp, ChevronDown, MoreVertical, Eye, EyeOff, Lock, Unlock, Copy, X, Check, Download, GripVertical, Settings, MousePointer, MoveIcon, PaintBucket, XCircle, RefreshCw, Undo, Redo, ZoomIn, ZoomOut, Maximize, Percent, Grid, Ruler, User as UserIcon, Minus, PanelLeftClose, PanelRightClose } from 'lucide-react'
import { DragDropContext, Droppable, DroppableProvided, Draggable, DraggableProvided } from 'react-beautiful-dnd'
import { toPng, toJpeg, toSvg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { useTheme } from 'next-themes'
import { Moon, Sun, Group, Ungroup } from 'lucide-react'
import { ThemeToggle } from "@/components/ThemeToggle"
import { ProjectPreview } from './ProjectPreview';
import { Locale, i18n } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

import { Save, FileText, Pen, PlusCircle, Globe } from 'lucide-react';

import TestimonialDialog from './TestimonialDialog';
import FeatureRequestDialog from './FeatureRequestDialog';

import { ThemeContext, ABTestProvider, GamificationProvider, trackEvent, loadTranslations } from '@/components/landing/tools';

type Project = {
    id: string;
    name: string;
    artboards: Artboard[];
    layers: Layer[];
    activeArtboardId: string;
    activeLayerId: string;
    preferences: Preferences;
    isTempProject: boolean;
};

type Point = { x: number; y: number }

type Element = {
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
    pressure?: number;
    thinning?: number;
    streamline?: number;
    smoothing?: number;
}

type Group = {
    id: string;
    name: string;
    elementIds: string[];
    layerId: string;
    isExpanded: boolean;
    isHidden: boolean;
    isLocked: boolean;
}

type Layer = {
    id: string;
    name: string;
    elements: Element[];
    groups: Group[];
    isHidden: boolean;
    isLocked: boolean;
}

type Artboard = {
    id: string;
    name: string;
    width: number;
    height: number;
    layers: Layer[];
    zoom: number;
    pan: { x: number; y: number };
    isVisible?: boolean;
}


type Guide = {
    id: string;
    position: number;
    orientation: 'horizontal' | 'vertical';
}

type Preferences = {
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
    showRulers: boolean;
    showGuides: boolean;
}

interface IllustratorProps {
    lang: Locale;
}

import avatarImage from '@/public/images/avatar2.jpg';
import Logo from '@/public/images/Logo.jpg';


export const Illustrator: React.FC<IllustratorProps> = ({ lang }) => {

    const { toast } = useToast()
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('draw')
    const [activeStrokeColor, setActiveStrokeColor] = useState('#000000')
    const [activeFillColor, setActiveFillColor] = useState('#FFFFFF')
    const [brushSize, setBrushSize] = useState(5)
    const [activeTool, setActiveTool] = useState('select')
    const [isDrawing, setIsDrawing] = useState(false)
    const [activeLayerId, setActiveLayerId] = useState('1')
    const [currentElement, setCurrentElement] = useState<Element | null>(null)
    const [selectedElements, setSelectedElements] = useState<Element[]>([])
    const [showElementsPanel, setShowElementsPanel] = useState(true)
    const [artboards, setArtboards] = useState<Artboard[]>([
        {
            id: '1',
            name: 'Artboard 1',
            width: 800,
            height: 600,
            layers: [{ id: '1', name: 'Layer 1', elements: [], groups: [], isHidden: false, isLocked: false }],
            zoom: 100,
            pan: { x: 0, y: 0 }
        }
    ])
    const [activeArtboardId, setActiveArtboardId] = useState('1')
    const layers = artboards.find(a => a.id === activeArtboardId)?.layers || []
    const setLayers = (newLayers: Layer[]) => {
        setArtboards(prevArtboards =>
            prevArtboards.map(artboard =>
                artboard.id === activeArtboardId
                    ? { ...artboard, layers: newLayers }
                    : artboard
            )
        )
    }

    const [isMoving, setIsMoving] = useState(false)
    const [moveStart, setMoveStart] = useState<Point | null>(null)
    const [moveDelta, setMoveDelta] = useState<Point>({ x: 0, y: 0 })
    const [showSelectionToolbar, setShowSelectionToolbar] = useState(false)
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
    const [undoStack, setUndoStack] = useState<Layer[][]>([])
    const [redoStack, setRedoStack] = useState<Layer[][]>([])

    const [guides, setGuides] = useState<Guide[]>([])
    const [preferences, setPreferences] = useState<Preferences>({
        showGrid: false,
        snapToGrid: false,
        gridSize: 20,
        showRulers: false,
        showGuides: false,
    })
    const [showLeftSidebar, setShowLeftSidebar] = useState(true)
    const [showRightSidebar, setShowRightSidebar] = useState(true)
    const [showBottomToolbar, setShowBottomToolbar] = useState(false)
    const [bottomToolbarContent, setBottomToolbarContent] = useState('')
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [historyStack, setHistoryStack] = useState<{ layers: Layer[], description: string }[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [showHistoryPanel, setShowHistoryPanel] = useState(false)

    const activeLayer = layers.find(layer => layer.id === activeLayerId)
    const activeElementCount = activeLayer ? activeLayer.elements.length : 0

    const [isNewArtboardDialogOpen, setIsNewArtboardDialogOpen] = useState(false)
    const [newArtboardSize, setNewArtboardSize] = useState({ width: 800, height: 600 });

    const [showNavigation, setShowNavigation] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const [projectName, setProjectName] = useState('Untitled Project');
    const [savedProjects, setSavedProjects] = useState([]);
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

    const activeArtboard = artboards.find(a => a.id === activeArtboardId)
    const zoom = activeArtboard?.zoom || 100
    const pan = activeArtboard?.pan || { x: 0, y: 0 }

    const [penPoints, setPenPoints] = useState<Point[]>([]);
    const [isDrawingCurve, setIsDrawingCurve] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [openTestimonialDialog, setOpenTestimonialDialog] = useState(false);
    const [openFeatureRequestDialog, setOpenFeatureRequestDialog] = useState(false);


    const { t } = useDictionary()

    const currentRoute = usePathname();
  
    const redirectedPathName = (locale: string) => {

        if (!currentRoute) return '/'
        const segments = currentRoute.split('/')
        segments[1] = locale
        return segments.join('/')
      }
    

    const setZoom = (newZoom: number) => {
        setArtboards(prevArtboards =>
            prevArtboards.map(artboard =>
                artboard.id === activeArtboardId
                    ? { ...artboard, zoom: newZoom }
                    : artboard
            )
        )
    }

    const setPan = (newPan: { x: number; y: number }) => {
        setArtboards(prevArtboards =>
            prevArtboards.map(artboard =>
                artboard.id === activeArtboardId
                    ? { ...artboard, pan: newPan }
                    : artboard
            )
        )
    }

    const toggleArtboardVisibility = (artboardId: string) => {
        setArtboards(prevArtboards =>
            prevArtboards.map(artboard =>
                artboard.id === artboardId
                    ? { ...artboard, isVisible: !artboard.isVisible }
                    : artboard
            )
        )
    }

    const [droppableId, setDroppableId] = useState('layers-droppable');

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        loadProjectsFromLocalStorage();
    }, [loadProjectsFromLocalStorage]);




    const loadProjectsFromLocalStorage = () => {
        const storedProjects = localStorage.getItem('illustratorProjects');
        if (storedProjects) {
            const parsedProjects = JSON.parse(storedProjects);
            const nonTempProjects = parsedProjects.filter((project: Project) => !project.isTempProject);
            setProjects(nonTempProjects);

            if (nonTempProjects.length > 0) {
                setIsProjectDialogOpen(true);
            } else {
                const emptyProject = createEmptyProject();
                setProjects([emptyProject]);
                setCurrentProjectState(emptyProject);
                saveProjectsToLocalStorage([emptyProject]);
            }
        } else {
            const emptyProject = createEmptyProject();
            setProjects([emptyProject]);
            setCurrentProjectState(emptyProject);
            saveProjectsToLocalStorage([emptyProject]);
        }
    };

    const handleCreateNewProject = () => {
        const newProject = createEmptyProject();
        setProjects(prevProjects => [...prevProjects.filter(p => !p.isTempProject), newProject]);
        setCurrentProjectState(newProject);
        saveProjectsToLocalStorage([...projects.filter(p => !p.isTempProject), newProject]);
        setIsProjectDialogOpen(false);
    };


    const handleLoadRecentProject = () => {
        if (projects.length > 0) {
            setCurrentProjectState(projects[projects.length - 1]);
        }
        setIsProjectDialogOpen(false);
    };

    const createEmptyProject = (): Project => {
        return {
            id: Date.now().toString(),
            name: 'Untitled Project',
            artboards: [{
                id: '1',
                name: 'Artboard 1',
                width: 800,
                height: 600,
                layers: [{ id: '1', name: 'Layer 1', elements: [], groups: [], isHidden: false, isLocked: false }],
                zoom: 100,
                pan: { x: 0, y: 0 }
            }],
            layers: [{ id: '1', name: 'Layer 1', elements: [], groups: [], isHidden: false, isLocked: false }],
            activeArtboardId: '1',
            activeLayerId: '1',
            preferences: {
                showGrid: false,
                snapToGrid: false,
                gridSize: 20,
                showRulers: false,
                showGuides: false,
            },
            isTempProject: true, // Set to true for new projects
        };
    };

    const setCurrentProjectState = (project: Project) => {
        setCurrentProject(project);
        setArtboards(project.artboards);
        setLayers(project.layers);
        setActiveArtboardId(project.activeArtboardId);
        setActiveLayerId(project.activeLayerId);
        setPreferences(project.preferences);
        // Reset any other state variables related to the canvas or project here
        setSelectedElements([]);
        setCurrentElement(null);
        // ... any other state resets
    };

    const saveProjectsToLocalStorage = (updatedProjects: Project[]) => {
        const projectsToSave = updatedProjects.filter(p => !p.isTempProject);
        localStorage.setItem('illustratorProjects', JSON.stringify(projectsToSave));
    };


    const ProjectDialog = () => (
        <AlertDialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('app.welcome_back')}</AlertDialogTitle> {/* Translation */}
                    <AlertDialogDescription>
                        {t('app.start_new_or_continue_recent')} {/* Translation */}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className='bg-primary-500 text-black'
                        onClick={handleCreateNewProject}>
                        {t('app.start_new_project')} {/* Translation */}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleLoadRecentProject}>
                        {t('app.continue_recent_project')} {/* Translation */}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    useEffect(() => {
        setShowSelectionToolbar(selectedElements.length > 0)
    }, [selectedElements])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setIsShiftPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);


    useEffect(() => {
        // change the id later here based on some conditions
        // in my case when my data is loaded
        if (layers.length) {
            setDroppableId('layers-droppable-' + layers.length);
        }
    }, [layers.length]);


    useEffect(() => {
        if (showBottomToolbar) {
            const timer = setTimeout(() => {
                setShowBottomToolbar(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showBottomToolbar])


    useEffect(() => {
        if (artboards.length > 1) {
            setShowNavigation(true);
            setTimeout(() => setIsVisible(true), 50); // Delay to trigger fade-in
        } else {
            setIsVisible(false);
            setTimeout(() => setShowNavigation(false), 300); // Delay to allow fade-out
        }
    }, [artboards.length]);


    const groupElements = (selectedElements: Element[], layers: Layer[]): [Layer[], Group | null] => {
        if (selectedElements.length < 2) return [layers, null];

        const groupId = Date.now().toString();
        const layerId = selectedElements[0].layerId;
        const group: Group = {
            id: groupId,
            name: `Group ${groupId}`,
            elementIds: selectedElements.map(el => el.id),
            layerId,
            isExpanded: true,
            isHidden: false,
            isLocked: false,
        };

        const updatedLayers = layers.map(layer => {
            if (layer.id === layerId) {
                return {
                    ...layer,
                    elements: layer.elements.map(el =>
                        selectedElements.some(sel => sel.id === el.id)
                            ? { ...el, groupId }
                            : el
                    ),
                    groups: [...layer.groups, group]
                };
            }
            return layer;
        });

        return [updatedLayers, group];
    };

    const ungroupElements = (groupId: string, layers: Layer[]): Layer[] => {
        return layers.map(layer => ({
            ...layer,
            elements: layer.elements.map(el =>
                el.groupId === groupId ? { ...el, groupId: undefined } : el
            ),
            groups: layer.groups.filter(group => group.id !== groupId)
        }));
    };

    const handleToolClick = (toolName: string) => {
        const tool = toolName.toLowerCase().split(' ')[0]
        setActiveTool(prevTool => prevTool === tool ? '' : tool)
        toast({
            title: `${toolName} ${activeTool === tool ? 'deselected' : 'selected'}`,
            description: activeTool === tool ? "Tool deselected." : "Start using the tool on the canvas.",
        })
        setShowBottomToolbar(true)
        setBottomToolbarContent(getToolShortcuts(tool))
    }

    const getToolShortcuts = (tool: string): string => {
        switch (tool) {
            case 'select':
                return 'Shift+Click: Multi-select | Ctrl+A: Select All'
            case 'move':
                return 'Arrow Keys: Move 1px | Shift+Arrow Keys: Move 10px'
            case 'pen':
            case 'pencil':
            case 'brush':
                return 'Click and drag to draw | Shift+Click: Straight line'
            case 'eraser':
                return 'Click and drag to erase | Shift+Click: Straight line erase'
            case 'rectangle':
            case 'ellipse':
            case 'triangle':
            case 'star':
                return 'Click and drag to draw | Shift: Keep aspect ratio'
            case 'line':
                return 'Click and drag to draw | Shift: Snap to 45° angles'
            default:
                return ''
        }
    }

    const handleExport = async (format: string) => {
        if (!svgRef.current) return;
        try {
            let dataUrl: string = '';  // Initialize dataUrl with an empty string

            switch (format) {
                case 'PNG':
                    dataUrl = await toPng(svgRef.current as any);
                    break;
                case 'JPEG':
                    // Create a temporary canvas
                    const svgElement = svgRef.current as SVGSVGElement;
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    if (context) {
                        // Set canvas dimensions to match the SVG
                        canvas.width = svgElement.clientWidth;
                        canvas.height = svgElement.clientHeight;

                        // Fill the canvas with white
                        context.fillStyle = '#ffffff';
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        // Convert the SVG to an image and draw it on the canvas
                        const svgDataUrl = await toPng(svgElement as any);
                        const image = new Image();
                        image.src = svgDataUrl;
                        await new Promise((resolve) => {
                            image.onload = () => {
                                context.drawImage(image, 0, 0);
                                resolve(null);
                            };
                        });

                        // Export the canvas content as a JPEG
                        dataUrl = canvas.toDataURL('image/jpeg');
                    }
                    break;
                case 'SVG':
                    dataUrl = await toSvg(svgRef.current as any);
                    break;
                case 'PDF':
                    const imgData = await toPng(svgRef.current as any);
                    const pdf = new jsPDF();
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save('illustration.pdf');
                    toast({
                        title: ('exported_as_pdf'),
                        description: ('pdf_export_success'),
                    });
                    return;
                default:
                    throw new Error('Unsupported format');
            }

            if (dataUrl) {
                const link = document.createElement('a');
                link.download = `illustration.${format.toLowerCase()}`;
                link.href = dataUrl;
                link.click();
                toast({
                    title: ('exported_as' + { format }),
                    description: ('export_success'),
                });
            } else {
                throw new Error('Failed to generate data URL for export');
            }
        } catch (error) {
            console.error('Export failed:', error);
            toast({
                title: ('export_failed'),
                description: ('export_error_try_again'),
                variant: "destructive",
            });
        }
    };

    const addToHistory = (description: string) => {
        const newHistoryEntry = { layers: JSON.parse(JSON.stringify(layers)), description }
        setHistoryStack(prevStack => {
            const newStack = [...prevStack.slice(0, historyIndex + 1), newHistoryEntry]
            setHistoryIndex(newStack.length - 1)
            return newStack
        })
    }

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prevIndex => prevIndex - 1)
            setLayers(historyStack[historyIndex - 1].layers)
        }
    }

    const handleRedo = () => {
        if (historyIndex < historyStack.length - 1) {
            setHistoryIndex(prevIndex => prevIndex + 1)
            setLayers(historyStack[historyIndex + 1].layers)
        }
    }

    const jumpToHistoryState = (index: number) => {
        setHistoryIndex(index)
        setLayers(historyStack[index].layers)
    }

    const handleZoomIn = () => {
        const currentZoom = artboards.find(artboard => artboard.id === activeArtboardId)?.zoom ?? 100;
        const newZoom = Math.min(currentZoom + 10, 200);
        setZoom(newZoom);
    }

    const handleZoomOut = () => {
        const currentZoom = artboards.find(artboard => artboard.id === activeArtboardId)?.zoom ?? 100;
        const newZoom = Math.max(currentZoom - 10, 10);
        setZoom(newZoom);
    }

    const handleResetZoom = () => {
        setZoom(100)
    }

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;

        const startPoint = {
            x: (e.clientX - svgRect.left - pan.x) / (zoom / 100),
            y: (e.clientY - svgRect.top - pan.y) / (zoom / 100),
        };

        if (activeTool === 'select') {
            const clickedElement = findElementAtPoint(startPoint);
            if (clickedElement) {
                const group = layers
                    .find(l => l.id === clickedElement.layerId)
                    ?.groups.find(g => g.elementIds.includes(clickedElement.id));

                if (group) {
                    const groupElements = layers
                        .find(l => l.id === clickedElement.layerId)
                        ?.elements.filter(el => group.elementIds.includes(el.id)) || [];

                    if (e.shiftKey) {
                        setSelectedElements(prev =>
                            prev.some(el => groupElements.some(ge => ge.id === el.id))
                                ? prev.filter(el => !groupElements.some(ge => ge.id === el.id))
                                : [...prev, ...groupElements]
                        );
                    } else {
                        setSelectedElements(groupElements);
                    }
                } else {
                    if (e.shiftKey) {
                        setSelectedElements(prev =>
                            prev.some(el => el.id === clickedElement.id)
                                ? prev.filter(el => el.id !== clickedElement.id)
                                : [...prev, clickedElement]
                        );
                    } else {
                        setSelectedElements([clickedElement]);
                    }
                }
            } else if (!e.shiftKey) {
                setSelectedElements([]);
            }
            return;
        }


        if (activeTool === 'move' && selectedElements.length > 0) {
            setIsMoving(true)
            setMoveStart(startPoint)
            setMoveDelta({ x: 0, y: 0 })
            const clickedElement = findElementAtPoint(startPoint)
            if (clickedElement) {
                setDragOffset({
                    x: startPoint.x - clickedElement.position.x,
                    y: startPoint.y - clickedElement.position.y
                })
            }
            return
        }

        if (activeTool === 'pen') {
            const newPoint = {
                x: Number(((e.clientX - svgRect.left - pan.x) / (zoom / 100)).toFixed(2)),
                y: Number(((e.clientY - svgRect.top - pan.y) / (zoom / 100)).toFixed(2))
            };

            if (penPoints.length === 0) {
                setPenPoints([newPoint]);
                setCurrentElement({
                    id: Date.now().toString(),
                    type: 'path',
                    tool: 'pen',
                    points: [newPoint],
                    strokeColor: activeStrokeColor,
                    fillColor: 'none',
                    strokeWidth: brushSize,
                    name: `Pen ${activeElementCount + 1}`,
                    layerId: activeLayerId,
                    position: newPoint,
                    dimensions: { width: 0, height: 0 },
                    angle: 0,
                    opacity: 1,
                    isHidden: false,
                    isLocked: false,
                });
            } else {
                setPenPoints(prevPoints => [...prevPoints, newPoint]);
                setCurrentElement(prev => ({
                    ...prev!,
                    points: [...prev!.points!, newPoint],
                }));
            }
            setIsDrawing(true);
        }

        if (['pencil', 'brush'].includes(activeTool)) {
            const newElement: Element = {
                id: Date.now().toString(),
                type: 'path',
                tool: activeTool,
                points: [startPoint],
                strokeColor: activeStrokeColor,
                fillColor: 'none',
                strokeWidth: brushSize,
                name: `${activeTool} ${activeElementCount + 1}`,
                layerId: activeLayerId,
                position: startPoint,
                dimensions: { width: 0, height: 0 },
                angle: 0,
                opacity: 1,
                isHidden: false,
                isLocked: false,
                pressure: activeTool === 'brush' ? 0.5 : 1,
                thinning: activeTool === 'pencil' ? 0.5 : 0,
                streamline: activeTool === 'pen' ? 0.5 : 0.2,
                smoothing: activeTool === 'brush' ? 0.5 : 0.2,
            }
            setCurrentElement(newElement)
            setIsDrawing(true)
        } else if (['rectangle', 'ellipse', 'triangle', 'star', 'line'].includes(activeTool)) {
            const newElement: Element = {
                id: Date.now().toString(),
                type: activeTool === 'line' ? 'line' : 'shape',
                tool: activeTool,
                start: startPoint,
                end: startPoint,
                strokeColor: activeStrokeColor,
                fillColor: activeFillColor,
                strokeWidth: brushSize,
                name: `${activeTool} ${activeElementCount + 1}`,
                layerId: activeLayerId,
                position: startPoint,
                dimensions: { width: 0, height: 0 },
                angle: 0,
                opacity: 1,
                isHidden: false,
                isLocked: false,
            }
            setCurrentElement(newElement)
            setIsDrawing(true)
        }
    }

    const moveElements = (elements: Element[], dx: number, dy: number): Element[] => {
        return elements.map(el => ({
            ...el,
            position: {
                x: el.position.x + dx,
                y: el.position.y + dy
            }
        }));
    };


    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svgRect = svgRef.current?.getBoundingClientRect()
        if (!svgRect) return

        const currentPoint = {
            x: (e.clientX - svgRect.left - pan.x) / (zoom / 100),
            y: (e.clientY - svgRect.top - pan.y) / (zoom / 100)
        }


        if (isMoving && moveStart) {
            const dx = currentPoint.x - moveStart.x;
            const dy = currentPoint.y - moveStart.y;

            const updatedElements = moveElements(selectedElements, dx, dy);

            setLayers(layers.map(layer => ({
                ...layer,
                elements: layer.elements.map(el =>
                    updatedElements.find(ue => ue.id === el.id) || el
                )
            })));

            setMoveStart(currentPoint);
            setMoveDelta(prevDelta => ({
                x: prevDelta.x + dx,
                y: prevDelta.y + dy
            }));
            return;
        }

        if (!isDrawing || !currentElement) return

        if (currentElement.type === 'path' && currentElement.points) {
            const newPoint = { x: currentPoint.x, y: currentPoint.y }

            if (activeTool === 'pen' && isDrawing) {
                const newPoint = {
                    x: Number(((e.clientX - svgRect.left - pan.x) / (zoom / 100)).toFixed(2)),
                    y: Number(((e.clientY - svgRect.top - pan.y) / (zoom / 100)).toFixed(2))
                };

                if (isShiftPressed && penPoints.length > 0) {
                    const lastPoint = penPoints[penPoints.length - 1];
                    const dx = Math.abs(newPoint.x - lastPoint.x);
                    const dy = Math.abs(newPoint.y - lastPoint.y);
                    if (dx > dy) {
                        newPoint.y = lastPoint.y;
                    } else {
                        newPoint.x = lastPoint.x;
                    }
                }

                setCurrentElement(prev => ({
                    ...prev!,
                    points: [...prev!.points!.slice(0, -1), newPoint],
                }));
            }

            if (currentElement.tool === 'brush') {
                // Add some randomness to brush strokes
                newPoint.x += (Math.random() - 0.5) * 2
                newPoint.y += (Math.random() - 0.5) * 2
            }

            setCurrentElement({
                ...currentElement,
                points: [...currentElement.points, newPoint],
            })
        }
        else if ((currentElement.type === 'shape' || currentElement.type === 'line') && currentElement.start) {
            setCurrentElement({
                ...currentElement,
                end: currentPoint,
                dimensions: {
                    width: Math.abs(currentPoint.x - currentElement.start.x),
                    height: Math.abs(currentPoint.y - currentElement.start.y),
                },
            })
        }
    }

    const handleMouseUp = () => {
        if (activeTool === 'pen') {
            if (currentElement && currentElement.points && currentElement.points.length > 1) {
                addElementToLayer(currentElement);
                setCurrentElement(null);
                setPenPoints([]);
            }
            setIsDrawing(false);
        }
        setIsDrawing(false)
        setIsMoving(false)
        setMoveStart(null)
        setMoveDelta({ x: 0, y: 0 })
        if (currentElement) {
            if (currentElement.type === 'shape' || currentElement.type === 'line') {
                if (currentElement.start && currentElement.end &&
                    currentElement.start.x === currentElement.end.x &&
                    currentElement.start.y === currentElement.end.y) {
                    setCurrentElement(null)
                    return
                }
            }
            const newLayers = layers.map(layer =>
                layer.id === activeLayerId
                    ? { ...layer, elements: [...layer.elements, currentElement] }
                    : layer
            )
            setLayers(newLayers)
            addToHistory(`Added ${currentElement.tool} element`)
            setCurrentElement(null)
        }
    }

    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState<Point | null>(null)

    const handlePanStart = (e: React.MouseEvent<SVGSVGElement>) => {
        if (activeTool === 'pan') {
            setIsPanning(true)
            setPanStart({ x: e.clientX, y: e.clientY })
        }
    }

    const handlePanMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (isPanning && panStart) {
            const dx = e.clientX - panStart.x
            const dy = e.clientY - panStart.y
            setPan({ x: pan.x + dx, y: pan.y + dy })
            setPanStart({ x: e.clientX, y: e.clientY })
        }
    }

    const handlePanEnd = () => {
        setIsPanning(false)
        setPanStart(null)
    }

    const clearCanvas = () => {
        const newLayers = layers.map(layer => ({ ...layer, elements: [] }))
        setLayers(newLayers)
        addToHistory('Cleared canvas')
        setCurrentElement(null)
        setSelectedElements([])
    }

    const createPenElement = (points: Point[]): Element => {
        return {
            id: Date.now().toString(),
            type: 'path',
            tool: 'pen',
            points: points,
            strokeColor: activeStrokeColor,
            fillColor: 'none',
            strokeWidth: brushSize,
            name: `Pen ${activeElementCount + 1}`,
            layerId: activeLayerId,
            position: points[0],
            dimensions: calculateDimensions(points),
            angle: 0,
            opacity: 1,
            isHidden: false,
            isLocked: false,
        };
    };

    const calculateDimensions = (points: Point[]) => {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return {
            width: maxX - minX,
            height: maxY - minY,
        };
    };

    const addElementToLayer = (element: Element) => {
        setLayers(layers.map(layer =>
            layer.id === activeLayerId
                ? { ...layer, elements: [...layer.elements, element] }
                : layer
        ));
        addToHistory(`Added ${element.tool} element`);
    };

    const renderPenPath = (element: Element) => {
        if (element.tool !== 'pen' || element.type !== 'path' || !element.points || element.points.length < 2) {
            return null;
        }

        // Filter out any invalid points
        const validPoints = element.points.filter(point =>
            typeof point.x === 'number' &&
            typeof point.y === 'number' &&
            !isNaN(point.x) &&
            !isNaN(point.y)
        );

        if (validPoints.length < 2) {
            return null; // Not enough valid points to draw a path
        }

        const d = validPoints.reduce((acc, point, index) => {
            const x = point.x.toFixed(2); // Reduce precision to 2 decimal places
            const y = point.y.toFixed(2);
            return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
        }, '');

        return (
            <path
                d={d}
                stroke={element.strokeColor || 'black'}
                strokeWidth={element.strokeWidth || 1}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        );
    };

    const renderPath = (element: Element) => {
        if (element.type !== 'path' || !element.points) return null;

        let d = '';
        const pressure = element.pressure ?? 1;
        const thinning = element.thinning ?? 0;
        const streamline = element.streamline ?? 0.5;
        const smoothing = element.smoothing ?? 0.2;

        switch (element.tool) {
            case 'pen':
                d = `M ${element.points[0].x} ${element.points[0].y}`;
                for (let i = 1; i < element.points.length; i++) {
                    if (i % 3 === 1) {
                        // Start of a curve
                        d += ` C ${element.points[i].x} ${element.points[i].y}`;
                    } else if (i % 3 === 0) {
                        // End of a curve
                        d += ` ${element.points[i].x} ${element.points[i].y}`;
                    } else {
                        // Control point
                        d += `, ${element.points[i].x} ${element.points[i].y}`;
                    }
                }
                break;
            case 'pencil':
            case 'brush':
                for (let i = 0; i < element.points.length; i++) {
                    const point = element.points[i];
                    const prevPoint = element.points[i - 1] || point;

                    if (i === 0) {
                        d += `M ${point.x} ${point.y}`;
                    } else {
                        const controlPoint1 = {
                            x: prevPoint.x + (point.x - prevPoint.x) * streamline,
                            y: prevPoint.y + (point.y - prevPoint.y) * streamline,
                        };
                        const controlPoint2 = {
                            x: point.x - (point.x - prevPoint.x) * streamline,
                            y: point.y - (point.y - prevPoint.y) * streamline,
                        };
                        d += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${point.x} ${point.y}`;
                    }
                }
                break;
        }

        let strokeWidth = element.strokeWidth * (1 - thinning * (1 - pressure));

        // Adjust the style based on the tool
        switch (element.tool) {
            case 'pen':
                // Pen tool - Precise and consistent
                strokeWidth = element.strokeWidth;
                break;
            case 'pencil':
                // Pencil tool - Thinner and slightly jittery
                strokeWidth = element.strokeWidth * 0.8;
                d = d.replace(/(\d+\.\d+)/g, (match) => (parseFloat(match) + (Math.random() - 0.5) * 0.5).toFixed(2));
                break;
            case 'brush':
                // Brush tool - Thick and possibly with variation in width
                strokeWidth = element.strokeWidth * 1.5 + (Math.random() - 0.5) * 2;
                break;
        }

        return (
            <path
                d={d}
                stroke={element.strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    transition: `stroke-width ${smoothing}s`,
                }}
            />
        );
    };


    const renderShape = (element: Element) => {
        if ((element.type !== 'shape' && element.type !== 'line') || !element.start || !element.end) return null
        const { tool, start, end, strokeColor, strokeWidth, fillColor } = element

        switch (tool) {
            case 'rectangle':
                return (
                    <rect
                        x={Math.min(start.x, end.x)}
                        y={Math.min(start.y, end.y)}
                        width={Math.abs(end.x - start.x)}
                        height={Math.abs(end.y - start.y)}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill={fillColor}
                    />
                )
            case 'ellipse':
                return (
                    <ellipse
                        cx={(start.x + end.x) / 2}
                        cy={(start.y + end.y) / 2}
                        rx={Math.abs(end.x - start.x) / 2}
                        ry={Math.abs(end.y - start.y) / 2}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill={fillColor}
                    />
                )
            case 'triangle':
                const midX = (start.x + end.x) / 2
                return (
                    <polygon
                        points={`${midX},${start.y} ${start.x},${end.y} ${end.x},${end.y}`}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill={fillColor}
                    />
                )
            case 'star':
                const centerX = (start.x + end.x) / 2
                const centerY = (start.y + end.y) / 2
                const outerRadius = Math.min(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) / 2
                const innerRadius = outerRadius / 2
                const points = []
                for (let i = 0; i < 10; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius
                    const angle = (Math.PI / 5) * i
                    points.push(`${centerX + radius * Math.sin(angle)},${centerY - radius * Math.cos(angle)}`)
                }
                return (
                    <polygon
                        points={points.join(' ')}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill={fillColor}
                    />
                )
            case 'line':
                return (
                    <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                    />
                )
            default:
                return null
        }
    }

    const findElementAtPoint = (point: Point): Element | null => {
        for (const layer of layers) {
            if (layer.isHidden) continue
            for (const element of layer.elements.slice().reverse()) {
                if (element.isHidden) continue
                if (isPointInElement(point, element)) {
                    return element
                }
            }
        }
        return null
    }

    const isPointInElement = (point: Point, element: Element): boolean => {
        if ((element.type === 'shape' || element.type === 'line') && element.start && element.end) {
            const { start, end } = element
            const minX = Math.min(start.x, end.x)
            const maxX = Math.max(start.x, end.x)
            const minY = Math.min(start.y, end.y)
            const maxY = Math.max(start.y, end.y)
            return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
        }
        // For path elements, you might want to implement a more sophisticated check
        return false
    }

    const unselectAll = () => {
        setSelectedElements([])
    }

    const selectAll = () => {
        setSelectedElements(layers.flatMap(layer => layer.elements))
    }

    const invertSelection = () => {
        const allElements = layers.flatMap(layer => layer.elements)
        const newSelection = allElements.filter(el => !selectedElements.some(sel => sel.id === el.id))
        setSelectedElements(newSelection)
    }

    const renderGrid = () => {
        if (!preferences.showGrid) return null

        const gridSize = preferences.gridSize * (zoom / 100)
        const width = containerRef.current?.clientWidth || 0
        const height = containerRef.current?.clientHeight || 0

        return (
            <g>
                {Array.from({ length: Math.ceil(width / gridSize) }).map((_, i) => (
                    <line
                        key={`vertical-${i}`}
                        x1={i * gridSize}
                        y1={0}
                        x2={i * gridSize}
                        y2={height}
                        stroke="#ddd"
                        strokeWidth={0.5}
                    />
                ))}
                {Array.from({ length: Math.ceil(height / gridSize) }).map((_, i) => (
                    <line
                        key={`horizontal-${i}`}
                        x1={0}
                        y1={i * gridSize}
                        x2={width}
                        y2={i * gridSize}
                        stroke="#ddd"
                        strokeWidth={0.5}
                    />
                ))}
            </g>
        )
    }

    const renderGuides = () => {
        if (!preferences.showGuides) return null

        return (
            <g>
                {guides.map(guide => (
                    <line
                        key={guide.id}
                        x1={guide.orientation === 'vertical' ? guide.position : 0}
                        y1={guide.orientation === 'horizontal' ? guide.position : 0}
                        x2={guide.orientation === 'vertical' ? guide.position : containerRef.current?.clientWidth || 0}
                        y2={guide.orientation === 'horizontal' ? guide.position : containerRef.current?.clientHeight || 0}
                        stroke="#00f"
                        strokeWidth={1}
                    />
                ))}
            </g>
        )
    }

    const renderRulers = () => {
        if (!preferences.showRulers) return null

        const rulerSize = 20
        const width = containerRef.current?.clientWidth || 0
        const height = containerRef.current?.clientHeight || 0

        return (
            <>
                <svg width={width} height={rulerSize} style={{ position: 'absolute', top: 0, left: rulerSize }}>
                    {/* Horizontal ruler */}
                    <rect width={width} height={rulerSize} fill="#f0f0f0" />
                    {Array.from({ length: Math.ceil(width / 100) }).map((_, i) => (
                        <g key={`h-${i}`}>
                            <line x1={i * 100} y1={0} x2={i * 100} y2={rulerSize} stroke="#000" />
                            <text x={i * 100 + 2} y={rulerSize - 2} fontSize="10">{i * 100}</text>
                        </g>
                    ))}
                </svg>
                <svg width={rulerSize} height={height} style={{ position: 'absolute', top: rulerSize, left: 0 }}>
                    {/* Vertical ruler */}
                    <rect width={rulerSize} height={height} fill="#f0f0f0" />
                    {Array.from({ length: Math.ceil(height / 100) }).map((_, i) => (
                        <g key={`v-${i}`}>
                            <line x1={0} y1={i * 100} x2={rulerSize} y2={i * 100} stroke="#000" />
                            <text x={2} y={i * 100 + 10} fontSize="10">{i * 100}</text>
                        </g>
                    ))}
                </svg>
            </>
        )
    }
    const GroupItem: React.FC<{ group: Group; layer: Layer }> = ({ group, layer }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editedName, setEditedName] = useState(group.name);

        const handleNameChange = () => {
            setLayers(layers.map(l =>
                l.id === layer.id
                    ? {
                        ...l,
                        groups: l.groups.map(g =>
                            g.id === group.id ? { ...g, name: editedName } : g
                        )
                    }
                    : l
            ));
            setIsEditing(false);
        };

        const toggleGroupExpansion = () => {
            setLayers(layers.map(l =>
                l.id === layer.id
                    ? {
                        ...l,
                        groups: l.groups.map(g =>
                            g.id === group.id ? { ...g, isExpanded: !g.isExpanded } : g
                        )
                    }
                    : l
            ));
        };

        const handleDeleteGroup = () => {
            const elementsToDelete = layer.elements.filter(el => group.elementIds.includes(el.id));
            const updatedLayers = layers.map(l =>
                l.id === layer.id
                    ? {
                        ...l,
                        elements: l.elements.filter(el => !elementsToDelete.includes(el)),
                        groups: l.groups.filter(g => g.id !== group.id)
                    }
                    : l
            );
            setLayers(updatedLayers);
        };

        const toggleGroupVisibility = () => {
            setLayers(layers.map(l =>
                l.id === layer.id
                    ? {
                        ...l,
                        groups: l.groups.map(g =>
                            g.id === group.id ? { ...g, isHidden: !g.isHidden } : g
                        )
                    }
                    : l
            ));
        };

        const toggleGroupLock = () => {
            setLayers(layers.map(l =>
                l.id === layer.id
                    ? {
                        ...l,
                        groups: l.groups.map(g =>
                            g.id === group.id ? { ...g, isLocked: !g.isLocked } : g
                        )
                    }
                    : l
            ));
        };

        const cloneGroup = () => {
            const clonedElements = group.elementIds.map(elementId => {
                const originalElement = layer.elements.find(el => el.id === elementId);
                return originalElement ? { ...originalElement, id: Date.now().toString() } : null;
            }).filter(el => el !== null) as Element[];

            const clonedGroup = {
                ...group,
                id: Date.now().toString(),
                name: `${group.name} Copy`,
                elementIds: clonedElements.map(el => el.id),
            };

            setLayers(layers.map(l =>
                l.id === layer.id
                    ? {
                        ...l,
                        elements: [...l.elements, ...clonedElements],
                        groups: [...l.groups, clonedGroup]
                    }
                    : l
            ));
        };

        const ungroupGroup = () => {
            const updatedLayers = ungroupElements(group.id, layers);
            setLayers(updatedLayers);
        };

        return (
            <div className="flex items-center space-x-2 mb-2 p-2 rounded">
                <Button variant="ghost" size="icon" onClick={toggleGroupExpansion}>
                    {group.isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronUp className="h-4 w-4" />
                    )}
                </Button>
                {isEditing ? (
                    <>
                        <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-32"
                        />
                        <Button size="icon" variant="ghost" onClick={handleNameChange}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Label className="w-32 truncate">{group.name}</Label>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={toggleGroupVisibility}>
                            {group.isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                            {group.isHidden ? 'Show' : 'Hide'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleGroupLock}>
                            {group.isLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                            {group.isLocked ? 'Unlock' : 'Lock'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={ungroupGroup}>
                            <Ungroup className="h-4 w-4 mr-2" /> Ungroup
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={cloneGroup}>
                            <Copy className="h-4 w-4 mr-2" /> Clone
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDeleteGroup}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    };

    const LayerItem: React.FC<{ layer: Layer; index: number }> = ({ layer, index }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editedName, setEditedName] = useState(layer.name);

        const handleNameChange = () => {
            setLayers(layers.map(l => l.id === layer.id ? { ...l, name: editedName } : l));
            setIsEditing(false);
        };

        const moveLayer = (direction: 'up' | 'down') => {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= layers.length) return;
            const newLayers = [...layers];
            const [removed] = newLayers.splice(index, 1);
            newLayers.splice(newIndex, 0, removed);
            setLayers(newLayers);
        };

        const handleDeleteLayer = () => {
            if (layers.length === 1) {
                const newLayer = { id: Date.now().toString(), name: 'Layer 1', elements: [], groups: [], isHidden: false, isLocked: false };
                setLayers([newLayer]);
                setActiveLayerId(newLayer.id);
            } else {
                const newLayers = layers.filter(l => l.id !== layer.id);
                setLayers(newLayers);
                if (layer.id === activeLayerId) {
                    setActiveLayerId(newLayers[Math.max(0, index - 1)].id);
                }
            }
        };

        return (
            <Draggable key={layer.id} draggableId={layer.id} index={index}>
                {(provided: DraggableProvided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center space-x-2 mb-2 p-2 rounded transition-colors duration-200 ${activeLayerId === layer.id
                            ? 'bg-card text-card-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                        onClick={() => setActiveLayerId(layer.id)}
                    >
                        <div {...provided.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {isEditing ? (
                            <>
                                <Input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="w-32 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                                />
                                <Button size="icon" variant="ghost" onClick={handleNameChange}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Label className="w-32 truncate">{layer.name}</Label>
                                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => moveLayer('up')} disabled={index === 0}>
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => moveLayer('down')} disabled={index === layers.length - 1}>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setLayers(layers.map(l => l.id === layer.id ? { ...l, isHidden: !l.isHidden } : l))}>
                                    {layer.isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                    {layer.isHidden ? 'Show' : 'Hide'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLayers(layers.map(l => l.id === layer.id ? { ...l, isLocked: !l.isLocked } : l))}>
                                    {layer.isLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                                    {layer.isLocked ? 'Unlock' : 'Lock'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLayers([...layers, { ...layer, id: Date.now().toString(), name: `${layer.name} Copy` }])}>
                                    <Copy className="h-4 w-4 mr-2" /> Clone
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete this layer?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. All elements in this layer will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteLayer}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </Draggable>
        );
    };

    const ElementItem: React.FC<{ element: Element; layerIndex: number; elementIndex: number }> = ({ element, layerIndex, elementIndex }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editedName, setEditedName] = useState(element.name);

        const handleNameChange = () => {
            setLayers(layers.map((layer, lIndex) =>
                lIndex === layerIndex
                    ? {
                        ...layer,
                        elements: layer.elements.map((el, elIndex) =>
                            elIndex === elementIndex ? { ...el, name: editedName } : el
                        )
                    }
                    : layer
            ));
            setIsEditing(false);
        };

        const moveElement = (direction: 'up' | 'down') => {
            const newIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;
            if (newIndex < 0 || newIndex >= layers[layerIndex].elements.length) return;
            const newLayers = [...layers];
            const [removed] = newLayers[layerIndex].elements.splice(elementIndex, 1);
            newLayers[layerIndex].elements.splice(newIndex, 0, removed);
            setLayers(newLayers);
        };

        const isSelected = selectedElements.some(sel => sel.id === element.id);

        return (
            <div className={`flex items-center space-x-2 mb-2 ${isSelected ? 'bg-accent' : ''}`}>
                {isEditing ? (
                    <>
                        <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-32 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                        />
                        <Button size="icon" variant="ghost" onClick={handleNameChange}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Label className="w-32 truncate">{element.name}</Label>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </>
                )}
                <Button size="icon" variant="ghost" onClick={() => moveElement('up')} disabled={elementIndex === 0}>
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => moveElement('down')} disabled={elementIndex === layers[layerIndex].elements.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" disabled>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Element Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="position-x" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Position X</Label>
                                <Input id="position-x" value={element.position.x} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="position-y" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Position Y</Label>
                                <Input id="position-y" value={element.position.y} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="width" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Width</Label>
                                <Input id="width" value={element.dimensions.width} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="height" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Height</Label>
                                <Input id="height" value={element.dimensions.height} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="angle" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Angle</Label>
                                <Input id="angle" value={element.angle} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stroke-color" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Stroke Color</Label>
                                <Input id="stroke-color" value={element.strokeColor} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stroke-width" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Stroke Width</Label>
                                <Input id="stroke-width" value={element.strokeWidth} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fill-color" className="text-right bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Fill Color</Label>
                                <Input id="fill-color" value={element.fillColor} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="opacity" className="text-righ bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">Opacity</Label>
                                <Input id="opacity" value={element.opacity} className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700" readOnly />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            setLayers(layers.map((layer, lIndex) =>
                                lIndex === layerIndex
                                    ? {
                                        ...layer,
                                        elements: layer.elements.map((el, elIndex) =>
                                            elIndex === elementIndex ? { ...el, isHidden: !el.isHidden } : el
                                        )
                                    }
                                    : layer
                            ))
                        }}>
                            {element.isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                            {element.isHidden ? 'Show' : 'Hide'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setLayers(layers.map((layer, lIndex) =>
                                lIndex === layerIndex
                                    ? {
                                        ...layer,
                                        elements: layer.elements.map((el, elIndex) =>
                                            elIndex === elementIndex ? { ...el, isLocked: !el.isLocked } : el
                                        )
                                    }
                                    : layer
                            ))
                        }}>
                            {element.isLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                            {element.isLocked ? 'Unlock' : 'Lock'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setLayers(layers.map((layer, lIndex) =>
                                lIndex === layerIndex
                                    ? {
                                        ...layer,
                                        elements: [...layer.elements, { ...element, id: Date.now().toString(), name: `${element.name} Copy` }]
                                    }
                                    : layer
                            ))
                        }}>
                            <Copy className="h-4 w-4 mr-2" /> Clone
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setLayers(layers.map((layer, lIndex) =>
                                lIndex === layerIndex
                                    ? {
                                        ...layer,
                                        elements: layer.elements.filter((_, elIndex) => elIndex !== elementIndex)
                                    }
                                    : layer
                            ))
                        }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }

        const newLayers = Array.from(layers);
        const [reorderedItem] = newLayers.splice(result.source.index, 1);
        newLayers.splice(result.destination.index, 0, reorderedItem);

        setLayers(newLayers);
    }


    const NewArtboardDialog = () => {
        const [localSize, setLocalSize] = useState({ width: 800, height: 600 });

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setLocalSize(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        };

        const handleCreateArtboard = () => {
            createNewArtboard(localSize.width, localSize.height);
            setIsNewArtboardDialogOpen(false);
        };

        return (
            <Dialog open={isNewArtboardDialogOpen} onOpenChange={setIsNewArtboardDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700">
                        Add Artboard
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Artboard</DialogTitle>
                        <DialogDescription>
                            Specify the width and height of the new artboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="width" className="text-right">Width</Label>
                            <Input
                                id="width"
                                name="width"
                                type="number"
                                value={localSize.width}
                                onChange={handleInputChange}
                                className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="height" className="text-right">Height</Label>
                            <Input
                                id="height"
                                name="height"
                                type="number"
                                value={localSize.height}
                                onChange={handleInputChange}
                                className="col-span-3 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateArtboard}>Create Artboard</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const createNewArtboard = (width: number, height: number) => {
        const newArtboard: Artboard = {
            id: Date.now().toString(),
            name: `Artboard ${artboards.length + 1}`,
            width: width,
            height: height,
            layers: [{ id: '1', name: 'Layer 1', elements: [], groups: [], isHidden: false, isLocked: false }],
            zoom: 100,
            pan: { x: 0, y: 0 },
            isVisible: true
        };
        setArtboards([...artboards, newArtboard]);
        setActiveArtboardId(newArtboard.id);
    };

    const ArtboardTab = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Artboards</h3>
            <NewArtboardDialog />
            {artboards.map((artboard) => (
                <div
                    key={artboard.id}
                    className={`p-2 border rounded transition-colors duration-200 ${activeArtboardId === artboard.id
                        ? 'bg-card text-card-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                >
                    <div className="flex justify-between items-center">
                        <Input
                            value={artboard.name}
                            onChange={(e) => {
                                setArtboards(artboards.map(a =>
                                    a.id === artboard.id ? { ...a, name: e.target.value } : a
                                ))
                            }}
                            className="w-32 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                        />
                        <span>{artboard.width}x{artboard.height}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleArtboardVisibility(artboard.id)}
                        >
                            {artboard.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="flex justify-between mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setActiveArtboardId(artboard.id)}>
                            Select
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            // Open a dialog to edit artboard properties
                            // This is a placeholder for the actual implementation
                            console.log("Edit artboard:", artboard.id);
                        }}>
                            Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            if (artboards.length > 1) {
                                setArtboards(artboards.filter(a => a.id !== artboard.id));
                                if (activeArtboardId === artboard.id) {
                                    setActiveArtboardId(artboards[0].id);
                                }
                            } else {
                                toast({
                                    title: "Cannot delete",
                                    description: "You must have at least one artboard.",
                                    variant: "destructive",
                                })
                            }
                        }}>
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )

    const renderGroupOutline = (group: Group) => {
        const groupElements = layers
            .find(l => l.id === group.layerId)
            ?.elements.filter(el => group.elementIds.includes(el.id)) || [];

        if (groupElements.length === 0) return null;

        const minX = Math.min(...groupElements.map(el => el.position.x));
        const minY = Math.min(...groupElements.map(el => el.position.y));
        const maxX = Math.max(...groupElements.map(el => el.position.x + el.dimensions.width));
        const maxY = Math.max(...groupElements.map(el => el.position.y + el.dimensions.height));

        return (
            <rect
                key={group.id}
                x={minX - 5}
                y={minY - 5}
                width={maxX - minX + 10}
                height={maxY - minY + 10}
                fill="none"
                stroke="#00A8E8"
                strokeWidth={2}
                strokeDasharray="5,5"
            />
        );
    };

    const createNewProject = () => {
        const newProject = createEmptyProject();
        setProjects(prevProjects => [...prevProjects, newProject]);
        setCurrentProjectState(newProject);
        saveProjectsToLocalStorage([...projects, newProject]);

        toast({
            title: 'New Project Created',
            description: 'A new project has been created and the canvas has been cleared.',
        });
    };

    const saveCurrentProject = () => {
        if (!currentProject) return;

        if (currentProject.name === 'Untitled Project' && currentProject.isTempProject) {
            setIsRenameDialogOpen(true);
            return;
        }

        saveProjectImplementation(currentProject.name);
    };

    const saveProjectImplementation = (projectName: string) => {
        if (!currentProject) return;

        const updatedProject = {
            ...currentProject,
            name: projectName,
            artboards,
            layers,
            activeArtboardId,
            activeLayerId,
            preferences,
            isTempProject: false,
        };

        const updatedProjects = projects.map(p =>
            p.id === updatedProject.id ? updatedProject : p
        );

        const nonTempProjects = updatedProjects.filter(p => !p.isTempProject);

        setProjects(nonTempProjects);
        setCurrentProject(updatedProject);
        saveProjectsToLocalStorage(nonTempProjects);

        toast({
            title: 'Project Saved',
            description: `${updatedProject.name} has been saved successfully.`,
        });
    };

    const RenameProjectDialog = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (newName: string) => void }) => {
        const [newName, setNewName] = useState('');

        const handleSave = () => {
            if (newName.trim()) {
                onSave(newName.trim());
                onClose();
            }
        };

        return (
            <AlertDialog open={isOpen} onOpenChange={onClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rename Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please enter a name for your project before saving.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter project name"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    };


    const loadProject = (project: Project) => {
        setCurrentProjectState(project);
        setIsProjectSheetOpen(false);

        toast({
            title: 'Project Loaded',
            description: `${project.name} has been loaded successfully.`,
        });
    };

    const deleteProject = (projectId: string) => {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);

        if (currentProject?.id === projectId) {
            if (updatedProjects.length > 0) {
                setCurrentProjectState(updatedProjects[0]);
            } else {
                const emptyProject = createEmptyProject();
                setProjects([emptyProject]);
                setCurrentProjectState(emptyProject);
                saveProjectsToLocalStorage([emptyProject]);
            }
        }

        toast({
            title: 'Project Deleted',
            description: 'The project has been deleted successfully.',
        });
    };

    const deleteAllProjects = () => {
        const emptyProject = createEmptyProject();
        setProjects([emptyProject]);
        setCurrentProject(emptyProject);
        saveProjectsToLocalStorage([emptyProject]);

        toast({
            title: 'All Projects Deleted',
            description: 'All projects have been deleted successfully.',
        });
    };

    const renameProject = (projectId: string, newName: string) => {
        const updatedProjects = projects.map(p =>
            p.id === projectId ? { ...p, name: newName } : p
        );

        setProjects(updatedProjects);
        saveProjectsToLocalStorage(updatedProjects);

        if (currentProject?.id === projectId) {
            setCurrentProject({ ...currentProject, name: newName });
        }

        toast({
            title: 'Project Renamed',
            description: `The project has been renamed to ${newName}.`,
        });
    };

    const handleProjectNameChange = () => {
        if (currentProject) {
            renameProject(currentProject.id, editedProjectName);
            setIsEditingName(false);
        }
    };


    useEffect(() => {
        const loadedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        setSavedProjects(loadedProjects);
    }, []);




    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Top Bar */}
            <div className="h-12 bg-muted border-b flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src={Logo.src} alt="@IllustratorPro" />
                        <AvatarFallback>IL</AvatarFallback>
                    </Avatar>
                    {isEditingName ? (
                        <Input
                            value={editedProjectName}
                            onChange={(e) => setEditedProjectName(e.target.value)}
                            onBlur={handleProjectNameChange}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleProjectNameChange();
                                }
                            }}
                            className="w-48 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                        />
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span>{currentProject?.name || t('app.no_project_open')}</span>
                            {currentProject && (
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setEditedProjectName(currentProject.name);
                                    setIsEditingName(true);
                                }}>
                                    <Pen className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                    <span>|</span>
                    <span>{t('app.active_artboard')}: {artboards.find(a => a.id === activeArtboardId)?.name}</span>
                    <span>({artboards.find(a => a.id === activeArtboardId)?.width}x{artboards.find(a => a.id === activeArtboardId)?.height})</span>
                    <span>|</span>
                    <span>{t('app.active_layer')}: {activeLayer?.name}</span>
                    {selectedElements.length > 0 && (
                        <>
                            <span>|</span>
                            <span>{t('app.selected')}: {selectedElements.length} {t('app.element_s')}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <AlertDialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('app.create_new_project')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('app.confirm_create_new_project')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={createNewProject}>{t('app.create_new_project')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={saveCurrentProject} disabled={!currentProject}>
                                    <Save className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('app.save_project')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const [newLayers, newGroup] = groupElements(selectedElements, layers);
                            setLayers(newLayers);
                            setSelectedElements(newGroup ? newLayers.find(l => l.id === newGroup.layerId)?.elements.filter(el => newGroup.elementIds.includes(el.id)) || [] : []);
                        }}
                        disabled={selectedElements.length < 2}
                    >
                        <Group className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (selectedElements.length > 0 && selectedElements[0].groupId) {
                                const newLayers = ungroupElements(selectedElements[0].groupId, layers);
                                setLayers(newLayers);
                                setSelectedElements([]);
                            }
                        }}
                        disabled={selectedElements.length === 0 || !selectedElements[0].groupId}
                    >
                        <Ungroup className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleUndo} disabled={undoStack.length === 0}>
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleRedo} disabled={redoStack.length === 0}>
                        <Redo className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span>{zoom}%</span>
                    <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleResetZoom}>
                        <Maximize className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                        variant={preferences.showGrid ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setPreferences(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={preferences.showRulers ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setPreferences(prev => ({ ...prev, showRulers: !prev.showRulers }))}
                    >
                        <Ruler className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={preferences.showGuides ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setPreferences(prev => ({ ...prev, showGuides: !prev.showGuides }))}
                    >
                        <Layout className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>{t('app.preferences')}</SheetTitle>
                                <SheetDescription>
                                    {t('app.adjust_preferences_here')}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-grid">{t('app.show_grid')}</Label>
                                    <Switch
                                        id="show-grid"
                                        checked={preferences.showGrid}
                                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showGrid: checked }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="snap-to-grid">{t('app.snap_to_grid')}</Label>
                                    <Switch
                                        id="snap-to-grid"
                                        checked={preferences.snapToGrid}
                                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, snapToGrid: checked }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="grid-size">{t('app.grid_size')}</Label>
                                    <Slider
                                        id="grid-size"
                                        min={5}
                                        max={100}
                                        step={5}
                                        value={[preferences.gridSize]}
                                        onValueChange={(value) => setPreferences(prev => ({ ...prev, gridSize: value[0] }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-rulers">{t('app.show_rulers')}</Label>
                                    <Switch
                                        id="show-rulers"
                                        checked={preferences.showRulers}
                                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showRulers: checked }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-guides">{t('app.show_guides')}</Label>
                                    <Switch
                                        id="show-guides"
                                        checked={preferences.showGuides}
                                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showGuides: checked }))}
                                    />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport('PNG')}>{t('app.export_as_png')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('JPEG')}>{t('app.export_as_jpeg')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('SVG')}>{t('app.export_as_svg')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('PDF')}>{t('app.export_as_pdf')}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Globe className="h-5 w-5" />
                        </Button>

                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-20 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            {i18n.locales.map((locale) => (
                                <Link
                                    key={locale}
                                    href={redirectedPathName(locale)}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-center"
                                >
                                    {locale.toUpperCase()}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <ThemeToggle />
                    <Separator orientation="vertical" className="h-6" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Avatar>
                                    {/*<Image src={avatarImage} alt="Avatar" />*/}
                                    <AvatarImage src={avatarImage.src} alt="@IllustratorPro" />
                                    <AvatarFallback>O</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href="/account" passHref legacyBehavior>
                                    <Button variant="ghost" className="w-full justify-start">
                                        {t('app.account')}
                                    </Button>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" passHref legacyBehavior>
                                    <Button variant="ghost" className="w-full justify-start">
                                        {t('app.settings')}
                                    </Button>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setOpenTestimonialDialog(true)}>
                                {t('app.submit_testimonial')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setOpenFeatureRequestDialog(true)}>
                                {t('app.submit_feature_request')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                                    <input type="hidden" name="pathName" value={usePathname()} />
                                    <Button type="submit" className="w-full text-left">
                                        {t('app.sign_out')}
                                    </Button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                {showLeftSidebar && (
                    <div className="w-16 bg-muted p-2 flex flex-col items-center space-y-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Select Tool')}>
                                        <MousePointer className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.select_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'move' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Move Tool')}>
                                        <MoveIcon className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.move_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'fill' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Fill Tool')}>
                                        <PaintBucket className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.fill_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator className="my-2" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'pen' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Pen Tool')}>
                                        <PenTool className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.pen_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'pencil' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Pencil Tool')}>
                                        <Pencil className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.pencil_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'brush' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Brush Tool')}>
                                        <Paintbrush className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.brush_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Eraser Tool')}>
                                        <Eraser className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.eraser_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'rectangle' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Rectangle Tool')}>
                                        <Square className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.rectangle_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'ellipse' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Ellipse Tool')}>
                                        <Circle className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.ellipse_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'triangle' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Triangle Tool')}>
                                        <Triangle className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.triangle_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'star' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Star Tool')}>
                                        <Star className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.star_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'line' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Line Tool')}>
                                        <Minus className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.line_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleToolClick('Type Tool')}>
                                        <Type className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.type_tool_not_implemented')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator className="my-2" />
                        {/* Stroke Color Picker */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <div className="w-6 h-6 rounded-full overflow-hidden">
                                            <input
                                                type="color"
                                                value={activeStrokeColor}
                                                onChange={(e) => setActiveStrokeColor(e.target.value)}
                                                className="w-12 h-12 cursor-pointer border-none p-0 -ml-1 -mt-4"
                                                style={{ backgroundColor: activeStrokeColor }}
                                            />
                                        </div>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.stroke_color')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Fill Color Picker */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="p-0 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full overflow-hidden">
                                            <input
                                                type="color"
                                                value={activeFillColor}
                                                onChange={(e) => setActiveFillColor(e.target.value)}
                                                className="w-12 h-12 cursor-pointer border-none p-0 -ml-1 -mt-4"
                                                style={{ backgroundColor: activeFillColor }}
                                            />
                                        </div>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.fill_color')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Separator className="my-2" />
                        {/* Pen Tool Options */}

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={activeTool === 'pan' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleToolClick('Pan Tool')}>
                                        <Move className="h-6 w-6" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('app.pan_tool')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto relative" ref={containerRef}>
                    {preferences.showRulers && renderRulers()}
                    <div
                        className="h-full bg-white border-dashed border-2 border-gray-300 m-4 relative overflow-hidden"
                        style={{
                            marginLeft: preferences.showRulers ? '20px' : '0',
                            marginTop: preferences.showRulers ? '20px' : '0',
                            width: activeArtboard ? `${activeArtboard.width}px` : '100%',
                            height: activeArtboard ? `${activeArtboard.height}px` : '100%',
                        }}
                    >
                        <svg
                            ref={svgRef}
                            className="w-full h-full"
                            onMouseDown={(e) => {
                                if (activeTool === 'pan') {
                                    handlePanStart(e);
                                } else {
                                    handleMouseDown(e);
                                }
                            }}
                            onMouseMove={(e) => {
                                if (isPanning) {
                                    handlePanMove(e);
                                } else {
                                    handleMouseMove(e);
                                }
                            }}
                            onMouseUp={() => {
                                handleMouseUp();
                                handlePanEnd();
                            }}
                            onMouseLeave={() => {
                                handleMouseUp();
                                handlePanEnd();
                            }}
                            style={{
                                cursor: activeTool === 'pan' ? 'move' : 'default'
                            }}
                        >
                            <g
                                transform={`translate(${pan.x}, ${pan.y}) scale(${zoom / 100})`}
                                style={{ transformOrigin: 'center center' }}
                            >
                                {renderGrid()}
                                {renderGuides()}
                                {layers.filter(layer => !layer.isHidden).flatMap(layer =>
                                    layer.elements.filter(element => !element.isHidden).map(element => (
                                        <React.Fragment key={element.id}>
                                            {element.tool === 'pen' ? renderPenPath(element)
                                                : element.type === 'path' ? renderPath(element) : renderShape(element)
                                            }
                                            {selectedElements.some(sel => sel.id === element.id) && (
                                                <rect
                                                    x={element.position.x - 4 / (zoom / 100)}
                                                    y={element.position.y - 4 / (zoom / 100)}
                                                    width={(element.dimensions.width + 8) / (zoom / 100)}
                                                    height={(element.dimensions.height + 8) / (zoom / 100)}
                                                    fill="none"
                                                    stroke="#FF69B4"
                                                    strokeWidth={2 / (zoom / 100)}
                                                    strokeDasharray={`${4 / (zoom / 100)} ${4 / (zoom / 100)}`}
                                                />
                                            )}
                                        </React.Fragment>
                                    )
                                    )
                                )}
                                {currentElement && (currentElement.type === 'path' ? renderPath(currentElement) : renderShape(currentElement))}

                                {layers.flatMap(layer => layer.groups).map(group => renderGroupOutline(group))}

                                {isMoving && (
                                    <g opacity={0.4}>
                                        {selectedElements.map(element => (
                                            <g key={element.id} transform={`translate(${moveDelta.x}, ${moveDelta.y})`}>
                                                {element.type === 'path' ? renderPath(element) : renderShape(element)}
                                            </g>
                                        ))}
                                    </g>
                                )}
                            </g>
                        </svg>
                    </div>
                    {showSelectionToolbar && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md p-2 flex space-x-2">
                            {isMoving ? (
                                <div className="text-sm font-medium animate-pulse">
                                    Moving: {Math.round(Math.sqrt(moveDelta.x ** 2 + moveDelta.y ** 2))}px
                                </div>
                            ) : (
                                <>
                                    <Button size="sm" variant="outline" onClick={selectAll}>
                                        Select All
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={unselectAll}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Unselect All
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={invertSelection}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Invert Selection
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                    {showBottomToolbar && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background text-foreground shadow-md rounded-md p-2">
                            <p className="text-sm">{bottomToolbarContent}</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                {showRightSidebar && (
                    <div className="w-64 bg-muted p-4 space-y-4 overflow-y-auto">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="draw">
                                    <Paintbrush className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="layers">
                                    <Layers className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="artboards">
                                    <Layout className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="transform">
                                    <Move className="h-4 w-4" />
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="draw">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="stroke-color">{t('app.stroke_color')}</Label>
                                        <Input
                                            id="stroke-color"
                                            type="color"
                                            value={activeStrokeColor}
                                            onChange={(e) => setActiveStrokeColor(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="fill-color">{t('app.fill_color')}</Label>
                                        <Input
                                            id="fill-color"
                                            type="color"
                                            value={activeFillColor}
                                            onChange={(e) => setActiveFillColor(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="brush-size">{t('app.brush_size')}</Label>
                                        <Slider
                                            id="brush-size"
                                            min={1}
                                            max={50}
                                            step={1}
                                            value={[brushSize]}
                                            onValueChange={(value) => setBrushSize(value[0])}
                                        />
                                    </div>
                                    <Button variant="destructive" size="sm" className="w-full" onClick={clearCanvas}>
                                        <Trash2 className="h-4 w-4 mr-2" /> {t('app.clear_canvas')}
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="layers" className="h-[calc(100vh-12rem)]">
                                <ResizablePanelGroup
                                    direction="vertical"
                                    className="h-full"
                                >
                                    <ResizablePanel defaultSize={70}>
                                        <div className="p-2 h-full overflow-y-auto">
                                            <h3 className="text-lg font-semibold mb-2">{t('app.layers')}</h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mb-2 bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                                                onClick={() =>
                                                    setLayers([
                                                        ...layers,
                                                        {
                                                            id: Date.now().toString(),
                                                            name: t('app.layer', { id: layers.length + 1 }),
                                                            elements: [],
                                                            groups: [],
                                                            isHidden: false,
                                                            isLocked: false,
                                                        },
                                                    ])
                                                }
                                            >
                                                {t('app.add_layer')}
                                            </Button>

                                            <DragDropContext onDragEnd={onDragEnd} key={"layer-dnd"}>
                                                <Droppable droppableId={droppableId}>
                                                    {(provided: DroppableProvided) => (
                                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                                            {layers.map((layer, index) => (
                                                                <LayerItem key={layer.id} layer={layer} index={index} />
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </div>
                                    </ResizablePanel>

                                    {/* New Group Panel */}
                                    {layers.some(layer => layer.groups.length > 0) && (
                                        <>
                                            <ResizableHandle withHandle key={"layer-handle"} />
                                            <ResizablePanel defaultSize={30} minSize={10} maxSize={50}>
                                                <div className="p-2 h-full overflow-y-auto">
                                                    <h3 className="text-lg font-semibold mb-2">{t('app.groups')}</h3>
                                                    {layers.flatMap(layer =>
                                                        layer.groups.map(group => (
                                                            <GroupItem key={group.id} group={group} layer={layer} />
                                                        ))
                                                    )}
                                                </div>
                                            </ResizablePanel>
                                        </>
                                    )}

                                    <ResizableHandle withHandle key={"group-handle"} />
                                    <ResizablePanel defaultSize={30}>
                                        <div className="p-2 h-full overflow-y-auto">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-semibold">{t('app.elements')}</h3>
                                                <Button variant="ghost" size="sm" onClick={() => setShowElementsPanel(!showElementsPanel)}>
                                                    {showElementsPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            {showElementsPanel && activeLayer && (
                                                <div className="space-y-2">
                                                    {activeLayer.elements.map((element, elementIndex) => (
                                                        <ElementItem key={element.id} element={element} layerIndex={layers.findIndex(l => l.id === activeLayer.id)} elementIndex={elementIndex} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </TabsContent>
                            <TabsContent value="artboards">
                                <ArtboardTab />
                            </TabsContent>
                            <TabsContent value="transform">
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleToolClick('Move')}>
                                        <Move className="h-4 w-4 mr-2" /> {t('app.move')}
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleToolClick('Scale')}>
                                        <Maximize2 className="h-4 w-4 mr-2" /> {t('app.scale')}
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleToolClick('Rotate')}>
                                        <MinusSquare className="h-4 w-4 mr-2" /> {t('app.rotate')}
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleToolClick('Reflect')}>
                                        <Edit3 className="h-4 w-4 mr-2" /> {t('app.reflect')}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* Bottom Toolbar */}
            <div className="h-12 bg-muted border-t flex items-center px-4 space-x-4">
                <Sheet open={isProjectSheetOpen} onOpenChange={setIsProjectSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" /> {t('app.projects')}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                            <SheetTitle>{t('app.projects')}</SheetTitle>
                            <SheetDescription>{t('app.manage_projects')}</SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-200px)] py-4">
                            <div className="space-y-4">
                                {projects
                                    .filter(project => !project.isTempProject)
                                    .map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between relative"
                                            onMouseEnter={() => setHoveredProject(project)}
                                            onMouseLeave={() => setHoveredProject(null)}
                                        >
                                            <span>{project.name}</span>
                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={() => loadProject(project)}>{t('app.load')}</Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onSelect={() => {
                                                            const newName = prompt(t('app.enter_new_project_name'), project.name);
                                                            if (newName) renameProject(project.id, newName);
                                                        }}>
                                                            {t('app.rename')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => deleteProject(project.id)}>
                                                            {t('app.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            {hoveredProject === project && (
                                                <div className="absolute left-full ml-2 z-10">
                                                    <ProjectPreview project={project} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                        <div className="flex justify-between mt-4">
                            <Button onClick={createNewProject}>{t('app.create_new_project')}</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">{t('app.delete_all')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('app.are_you_sure')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('app.delete_all_warning')}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteAllProjects}>
                                            {t('app.yes_delete_all')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </SheetContent>
                </Sheet>

                <Button variant="ghost" size="sm" onClick={() => handleToolClick('Asset Library')} disabled>
                    <ImageIcon className="h-4 w-4 mr-2" /> {t('app.asset_library')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleToolClick('Collaboration')} disabled>
                    <Share2 className="h-4 w-4 mr-2" /> {t('app.collaborate')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleToolClick('Plugins')} disabled>
                    <Package className="h-4 w-4 mr-2" /> {t('app.plugins')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleToolClick('Keyboard Shortcuts')} disabled>
                    <Keyboard className="h-4 w-4 mr-2" /> {t('app.shortcuts')}
                </Button>
                <Sheet open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <History className="h-4 w-4 mr-2" /> {t('app.history')}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>{t('app.history')}</SheetTitle>
                            <SheetDescription>
                                {t('app.navigate_history')}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-2">
                            {historyStack.map((entry, index) => (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${index === historyIndex ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                    onClick={() => jumpToHistoryState(index)}
                                >
                                    <span>{entry.description}</span>
                                    {index === historyIndex && <Check className="h-4 w-4" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4">
                            <Button onClick={handleUndo} disabled={historyIndex <= 0}>
                                <Undo className="h-4 w-4 mr-2" /> {t('app.undo')}
                            </Button>
                            <Button onClick={handleRedo} disabled={historyIndex >= historyStack.length - 1}>
                                <Redo className="h-4 w-4 mr-2" /> {t('app.redo')}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex-grow" />

                <Button variant="ghost" size="sm" onClick={() => setShowLeftSidebar(!showLeftSidebar)}>
                    <PanelLeftClose className="h-4 w-4 mr-2" /> {showLeftSidebar ? t('app.hide_left_sidebar') : t('app.show_left_sidebar')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowRightSidebar(!showRightSidebar)}>
                    <PanelRightClose className="h-4 w-4 mr-2" /> {showRightSidebar ? t('app.hide_right_sidebar') : t('app.show_right_sidebar')}
                </Button>
            </div>
            {showNavigation && (
                <div
                    className={`absolute bottom-16 right-24 bg-white shadow-md rounded-md p-2 flex space-x-2 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Button
                        size="sm"
                        className="bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                        variant="outline"
                        onClick={() => {
                            const currentIndex = artboards.findIndex(a => a.id === activeArtboardId);
                            const prevIndex = (currentIndex - 1 + artboards.length) % artboards.length;
                            setActiveArtboardId(artboards[prevIndex].id);
                        }}
                    >
                        {t('app.previous_artboard')}
                    </Button>
                    <Button
                        size="sm"
                        className="bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-700"
                        variant="outline"
                        onClick={() => {
                            const currentIndex = artboards.findIndex(a => a.id === activeArtboardId);
                            const nextIndex = (currentIndex + 1) % artboards.length;
                            setActiveArtboardId(artboards[nextIndex].id);
                        }}
                    >
                        {t('app.next_artboard')}
                    </Button>
                </div>
            )}
            <ProjectDialog />

            <RenameProjectDialog
                isOpen={isRenameDialogOpen}
                onClose={() => setIsRenameDialogOpen(false)}
                onSave={(newName) => saveProjectImplementation(newName)}
            />

            <TestimonialDialog
                open={openTestimonialDialog}
                onOpenChange={setOpenTestimonialDialog}
            />
            <FeatureRequestDialog
                open={openFeatureRequestDialog}
                onOpenChange={setOpenFeatureRequestDialog}
            />
        </div>
    );
};

export default Illustrator;