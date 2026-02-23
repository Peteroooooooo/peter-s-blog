
import React from 'react';

export const Home: React.FC = () => {
    // The Cube has been moved to GlobalCube.tsx
    // Home.tsx now only handles Home-specific UI that is NOT the Cube (if any remains)
    // or acts as a placeholder for the routing structure.

    // Logic for "drag to rotate" is now handled globally when on Home route.

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-none">
            {/* The GlobalCube sits behind this. 
                Any overlay text or UI specific to Home that ISN'T the cube itself would go here.
            */}
        </div>
    );
};
