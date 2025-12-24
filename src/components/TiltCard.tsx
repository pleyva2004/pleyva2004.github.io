import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for mouse position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth out the rotation
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;

        // Rotate X axis corresponds to Y mouse movement, and vice versa
        const rX = (mouseYFromCenter / height) * -20; // Max rotation deg
        const rY = (mouseXFromCenter / width) * 20;

        x.set(rX);
        y.set(rY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const transformStyle = useMotionTemplate`rotateX(${mouseX}deg) rotateY(${mouseY}deg)`;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d",
                transform: transformStyle,
            }}
            className={`relative transition-all duration-200 ease-out ${className}`}
        >
            {/* Reflection effect */}
            <div
                style={{
                    transform: "translateZ(50px)",
                }}
                className="relative z-10"
            >
                {children}
            </div>

            {/* Glossy overlay */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl bg-gradient-to-tr from-white/0 via-white/5 to-white/0 mix-blend-overlay"
            />
        </motion.div>
    );
};

export default TiltCard;
