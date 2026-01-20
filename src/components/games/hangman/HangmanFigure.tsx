"use client";

interface HangmanFigureProps {
  wrongGuesses: number;
}

/**
 * SVG hangman figure that progressively reveals based on wrong guesses (0-6).
 * 0: empty gallows only
 * 1: head (circle)
 * 2: body (line)
 * 3: left arm
 * 4: right arm
 * 5: left leg
 * 6: right leg (game over)
 */
export function HangmanFigure({ wrongGuesses }: HangmanFigureProps) {
  // Colors for the hangman
  const figureColor = "#374151"; // gray-700
  const gallowsColor = "#78716c"; // stone-500
  const ropeColor = "#a8a29e"; // stone-400

  return (
    <svg
      viewBox="0 0 200 250"
      className="w-full max-w-[250px] h-auto"
      aria-label={`איש תלוי - ${wrongGuesses} טעויות`}
    >
      {/* Gallows - always visible */}
      {/* Base */}
      <line
        x1="20"
        y1="230"
        x2="100"
        y2="230"
        stroke={gallowsColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Vertical post */}
      <line
        x1="60"
        y1="230"
        x2="60"
        y2="20"
        stroke={gallowsColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Top beam */}
      <line
        x1="60"
        y1="20"
        x2="140"
        y2="20"
        stroke={gallowsColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Diagonal support */}
      <line
        x1="60"
        y1="50"
        x2="90"
        y2="20"
        stroke={gallowsColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Rope */}
      <line
        x1="140"
        y1="20"
        x2="140"
        y2="50"
        stroke={ropeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Head - wrong guess 1 */}
      <circle
        cx="140"
        cy="70"
        r="20"
        stroke={figureColor}
        strokeWidth="4"
        fill="none"
        className={`transition-all duration-500 ease-out ${
          wrongGuesses >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
        style={{
          transformOrigin: "140px 70px",
        }}
      />
      {/* Face - sad expression for 6 wrong guesses */}
      {wrongGuesses >= 1 && (
        <>
          {/* Eyes */}
          <circle
            cx="133"
            cy="65"
            r="2"
            fill={figureColor}
            className={`transition-opacity duration-300 ${
              wrongGuesses >= 1 ? "opacity-100" : "opacity-0"
            }`}
          />
          <circle
            cx="147"
            cy="65"
            r="2"
            fill={figureColor}
            className={`transition-opacity duration-300 ${
              wrongGuesses >= 1 ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Mouth - changes based on game state */}
          {wrongGuesses < 6 ? (
            // Neutral/worried mouth
            <line
              x1="135"
              y1="78"
              x2="145"
              y2="78"
              stroke={figureColor}
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-opacity duration-300"
            />
          ) : (
            // Sad mouth for game over
            <path
              d="M 133 80 Q 140 74 147 80"
              stroke={figureColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className="transition-opacity duration-300"
            />
          )}
        </>
      )}

      {/* Body - wrong guess 2 */}
      <line
        x1="140"
        y1="90"
        x2="140"
        y2="150"
        stroke={figureColor}
        strokeWidth="4"
        strokeLinecap="round"
        className={`transition-all duration-500 ease-out ${
          wrongGuesses >= 2 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          strokeDasharray: wrongGuesses >= 2 ? "0" : "60",
          strokeDashoffset: wrongGuesses >= 2 ? "0" : "60",
        }}
      />

      {/* Left arm - wrong guess 3 */}
      <line
        x1="140"
        y1="105"
        x2="110"
        y2="130"
        stroke={figureColor}
        strokeWidth="4"
        strokeLinecap="round"
        className={`transition-all duration-500 ease-out ${
          wrongGuesses >= 3 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transformOrigin: "140px 105px",
          transform: wrongGuesses >= 3 ? "rotate(0deg)" : "rotate(-45deg)",
        }}
      />

      {/* Right arm - wrong guess 4 */}
      <line
        x1="140"
        y1="105"
        x2="170"
        y2="130"
        stroke={figureColor}
        strokeWidth="4"
        strokeLinecap="round"
        className={`transition-all duration-500 ease-out ${
          wrongGuesses >= 4 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transformOrigin: "140px 105px",
          transform: wrongGuesses >= 4 ? "rotate(0deg)" : "rotate(45deg)",
        }}
      />

      {/* Left leg - wrong guess 5 */}
      <line
        x1="140"
        y1="150"
        x2="110"
        y2="195"
        stroke={figureColor}
        strokeWidth="4"
        strokeLinecap="round"
        className={`transition-all duration-500 ease-out ${
          wrongGuesses >= 5 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transformOrigin: "140px 150px",
          transform: wrongGuesses >= 5 ? "rotate(0deg)" : "rotate(-30deg)",
        }}
      />

      {/* Right leg - wrong guess 6 (game over) */}
      <line
        x1="140"
        y1="150"
        x2="170"
        y2="195"
        stroke={figureColor}
        strokeWidth="4"
        strokeLinecap="round"
        className={`transition-all duration-500 ease-out ${
          wrongGuesses >= 6 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transformOrigin: "140px 150px",
          transform: wrongGuesses >= 6 ? "rotate(0deg)" : "rotate(30deg)",
        }}
      />
    </svg>
  );
}
