import { type ReactNode, useEffect, useState, useMemo } from 'react';
import {
    LogoSVG,
    Blob1SVG,
    Blob2SVG,
    Blob3SVG,
    Blob4SVG,
    MapbaseSVG,
} from '@/assets';

// constants for styling
const GRADIENTS = {
    background:
        'linear-gradient(to top right, #903B00 0%, #903B00 15%, #1D252E 60%)',
    fadeOut:
        'linear-gradient(to bottom, rgba(29, 37, 46, 0) 0%, rgba(29, 37, 46, 0.05) 30%, rgba(29, 37, 46, 0.3) 50%, rgba(29, 37, 46, 0.5) 65%, rgba(29, 37, 46, 0.6) 100%)',
};

// auth page wrapper with split layout
interface AuthPageProps {
    children?: ReactNode;
}

// custom hook for window resizing
function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowWidth;
}

// custom hook for grid size calculation
function useGridSize(isMobile: boolean, windowWidth: number) {
    return useMemo(() => {
        if (isMobile) {
            // mobile grid sizes
            if (windowWidth < 400) return 4; // very small screens
            if (windowWidth < 640) return 6; // small screens
            return 8; // medium screens
        }

        // desktop grid sizes
        if (windowWidth < 1024) return 6; // small desktop
        if (windowWidth < 1280) return 8; // medium desktop
        if (windowWidth < 1536) return 10; // large desktop
        return 12; // extra large desktop
    }, [windowWidth, isMobile]);
}

export function AuthPage({ children }: AuthPageProps) {
    const windowWidth = useWindowWidth();
    const mobileGridSize = useGridSize(true, windowWidth);
    const desktopGridSize = useGridSize(false, windowWidth);

    // function to create a responsive grid
    const renderGrid = (key: string, gridSize: number) => {
        return Array.from({ length: gridSize }).map((_, rowIndex) =>
            Array.from({ length: gridSize }).map((_, colIndex) => {
                const cellId = `${key}-cell-r${rowIndex}-c${colIndex}`;

                return (
                    <div
                        key={cellId}
                        className="border-t border-l border-white"
                        style={{
                            gridColumn: `${colIndex + 1} / span 1`,
                            gridRow: `${rowIndex + 1} / span 1`,
                        }}
                    />
                );
            })
        );
    };

    // reusable function for grid overlay with gradient
    const renderGridWithGradient = (isMobile: boolean) => {
        const gridSize = isMobile ? mobileGridSize : desktopGridSize;
        const key = isMobile ? 'mobile' : 'desktop';

        return (
            <>
                <div
                    className="absolute inset-0 grid opacity-10"
                    style={{
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                    }}
                >
                    {renderGrid(key, gridSize)}
                </div>
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: GRADIENTS.fadeOut }}
                />
            </>
        );
    };

    return (
        <div className="flex min-h-screen w-full relative">
            {/* mobile background */}
            <div className="absolute inset-0 md:hidden">
                <div
                    className="w-full h-full relative overflow-hidden"
                    style={{ background: GRADIENTS.background }}
                >
                    {renderGridWithGradient(true)}

                    {/* blobs - mobile */}
                    <img
                        src={Blob1SVG}
                        alt=""
                        className="absolute top-0 left-0 w-[160px]"
                    />
                    <img
                        src={Blob2SVG}
                        alt=""
                        className="absolute top-0 right-0 w-[180px]"
                    />
                    <img
                        src={Blob3SVG}
                        alt=""
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[110px]"
                    />
                    <img
                        src={Blob4SVG}
                        alt=""
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[120px]"
                    />

                    {/* logo */}
                    <div className="absolute top-[8%] left-0 right-0 flex justify-center">
                        <img
                            src={LogoSVG}
                            alt="Logo"
                            className="h-16 w-16 filter brightness-0 invert"
                        />
                    </div>

                    {/* world map */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                        <img
                            src={MapbaseSVG}
                            alt=""
                            className="w-full h-[20%] object-cover opacity-60"
                        />
                    </div>
                </div>
            </div>

            {/* left side */}
            <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center p-2">
                <div
                    className="w-[98%] h-[98%] rounded-2xl relative overflow-hidden"
                    style={{ background: GRADIENTS.background }}
                >
                    {renderGridWithGradient(false)}

                    {/* blobs - desktop */}
                    <img
                        src={Blob1SVG}
                        alt=""
                        className="absolute top-0 left-0 w-[130px] lg:w-[180px]"
                    />
                    <img
                        src={Blob2SVG}
                        alt=""
                        className="absolute top-0 right-0 w-[160px] lg:w-[220px]"
                    />
                    <img
                        src={Blob3SVG}
                        alt=""
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[90px] lg:w-[120px]"
                    />
                    <img
                        src={Blob4SVG}
                        alt=""
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[100px] lg:w-[130px]"
                    />

                    {/* content overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-start pt-[25%] text-white">
                        {/* logo */}
                        <img
                            src={LogoSVG}
                            alt="Logo"
                            className="h-16 w-16 mb-8 filter brightness-0 invert"
                        />

                        {/* ONBOARD text with gradient */}
                        <h1 className="text-8xl md:text-6xl lg:text-8xl font-bold mb-5 bg-gradient-to-r from-orange-500 to-gray-300 bg-clip-text text-transparent">
                            ONBOARD
                        </h1>
                        <div className="flex flex-col items-center whitespace-nowrap">
                            <h2 className="text-6xl md:text-3xl lg:text-5xl xl:text-6xl text-white">
                                BUILD IT AND
                            </h2>
                            <h2 className="text-6xl md:text-3xl lg:text-5xl xl:text-6xl text-white">
                                SHOW THE WORLD
                            </h2>
                        </div>
                    </div>

                    {/* world map */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                        <img
                            src={MapbaseSVG}
                            alt=""
                            className="w-full h-[20%] object-cover opacity-60"
                        />
                    </div>
                </div>
            </div>

            {/* right side */}
            <div className="relative w-full md:w-1/2 flex items-center justify-center p-4 md:bg-gray-50">
                <div className="max-w-xl w-full">{children}</div>
            </div>
        </div>
    );
}

export default AuthPage;
