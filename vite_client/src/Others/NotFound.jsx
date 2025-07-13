import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Planet = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, ${props => props.color1}, ${props => props.color2});
  box-shadow: 0 0 20px ${props => props.glow};
  width: ${props => props.size};
  height: ${props => props.size};
  animation: ${float} ${props => props.speed} ease-in-out infinite;
  top: ${props => props.top};
  left: ${props => props.left};
  z-index: -1;
`;

const Stars = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
      radial-gradient(3px 3px at 90px 40px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
      radial-gradient(3px 3px at 160px 120px, #fff, rgba(0,0,0,0));
    background-size: 200px 200px;
    animation: ${rotate} 200s linear infinite;
  }
`;

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxStyle = {
    transform: `translate(
      ${-mousePosition.x * 0.02}px, 
      ${-mousePosition.y * 0.02}px
    )`
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center">
      <Stars />
      
      {/* Floating Planets */}
      <Planet 
        color1="#ff9e9e" color2="#ff3a3a" glow="rgba(255, 58, 58, 0.6)"
        size="80px" speed="8s" top="20%" left="15%"
      />
      <Planet 
        color1="#9efff9" color2="#00c8ff" glow="rgba(0, 200, 255, 0.6)"
        size="120px" speed="12s" top="60%" left="75%"
      />
      <Planet 
        color1="#ffe69e" color2="#ffb700" glow="rgba(255, 183, 0, 0.6)"
        size="60px" speed="10s" top="30%" left="80%"
      />
      
      {/* Astronaut */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-white rounded-full"></div>
        </div>
      </motion.div>
      
      {/* Content with parallax effect */}
      <motion.div 
        style={parallaxStyle}
        className="text-center px-4 z-10"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-8xl md:text-9xl font-bold text-white mb-4"
        >
          4<span className="text-blue-400">0</span>4
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 mb-8"
        >
          Houston, we have a problem! Page not found.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Beam Me Home
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Floating space debris */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 360
          }}
          animate={{
            x: [null, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight],
            rotate: [null, Math.random() * 360]
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute w-2 h-2 bg-gray-500 rounded-full"
          style={{
            opacity: 0.7,
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}
        />
      ))}
    </div>
  );
};

export default NotFound;