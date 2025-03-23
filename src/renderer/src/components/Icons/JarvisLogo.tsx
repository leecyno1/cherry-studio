import React from 'react'

interface JarvisLogoProps {
  width?: number
  height?: number
  color?: string
}

const JarvisLogo: React.FC<JarvisLogoProps> = ({
  width = 500,
  height = 500,
  color = '#0084FF'
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="250" cy="250" r="230" fill="#0A101C" />
      <circle cx="250" cy="250" r="200" stroke={color} strokeWidth="10" />
      <circle cx="250" cy="250" r="180" stroke={color} strokeWidth="2" strokeDasharray="10 5" />
      <circle cx="250" cy="250" r="120" fill={color} fillOpacity="0.1" />
      
      {/* Central eye/circular interface */}
      <circle cx="250" cy="250" r="80" fill={color} />
      <circle cx="250" cy="250" r="60" fill="#0A101C" />
      <circle cx="250" cy="250" r="40" fill={color} fillOpacity="0.7" />
      
      {/* Digital pulse rings */}
      <circle cx="250" cy="250" r="25" stroke="white" strokeWidth="3" strokeOpacity="0.8" />
      
      {/* Tech elements around the edge */}
      <rect x="210" y="120" width="80" height="15" rx="5" fill={color} />
      <rect x="210" y="365" width="80" height="15" rx="5" fill={color} />
      <rect x="365" y="210" width="15" height="80" rx="5" fill={color} />
      <rect x="120" y="210" width="15" height="80" rx="5" fill={color} />
      
      {/* Diagonal connectors */}
      <rect 
        x="143" 
        y="143" 
        width="15" 
        height="80" 
        rx="5" 
        fill={color}
        transform="rotate(45 143 143)" 
      />
      <rect 
        x="357" 
        y="143" 
        width="15" 
        height="80" 
        rx="5" 
        fill={color}
        transform="rotate(135 357 143)" 
      />
      <rect 
        x="143" 
        y="357" 
        width="15" 
        height="80" 
        rx="5" 
        fill={color}
        transform="rotate(-45 143 357)" 
      />
      <rect 
        x="357" 
        y="357" 
        width="15" 
        height="80" 
        rx="5" 
        fill={color}
        transform="rotate(-135 357 357)" 
      />
      
      {/* Pulse animation effect */}
      <circle cx="250" cy="250" r="100" stroke="white" strokeWidth="2" strokeOpacity="0.3">
        <animate 
          attributeName="r" 
          from="100" 
          to="160"
          dur="3s" 
          repeatCount="indefinite" 
        />
        <animate 
          attributeName="stroke-opacity" 
          from="0.3" 
          to="0"
          dur="3s" 
          repeatCount="indefinite" 
        />
      </circle>
    </svg>
  )
}

export default JarvisLogo 