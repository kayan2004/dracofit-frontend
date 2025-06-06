import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const DragonDisplay = ({
  level = 1,
  stage = "adult",
  animation = "idle",
  name = "dragon",
  onClick, // Add onClick prop
}) => {
  // Track which of our two images is currently active
  console.log(stage, animation);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Images array stores exactly two image sources
  const [images, setImages] = useState(["", ""]);

  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation state
  const [currentFrame, setCurrentFrame] = useState(1);
  const animationTimerRef = useRef(null);
  const frameCountRef = useRef(0);

  // Stage-specific animation configurations
  const animationConfigs = {
    baby: {
      //done
      idle: {
        totalFrames: 4,
        frameDurations: [3000, 300, 2000, 300],
        sequence: [1, 2, 3, 4, 3, 4, 3, 4, 3, 4, 3, 2],
      },
      // done
      happy: {
        totalFrames: 4,
        frameDurations: [3000, 300, 1000, 1000],
        sequence: [1, 2, 3, 4, 3, 4, 3, 4, 2],
      },
      // done
      sad: {
        totalFrames: 4,
        frameDurations: [3000, 500, 500, 1000],
        sequence: [1, 2, 3, 4, 2, 3, 4, 2, 3, 4],
      },
      // done
      dead: {
        totalFrames: 1,
        frameDurations: [1000],
        sequence: [1],
      },
    },
    teen: {
      //done
      idle: {
        totalFrames: 4,
        frameDurations: [3000, 300, 2000, 300],
        sequence: [1, 2, 3, 4, 3, 4, 3, 4, 3, 4, 3, 2],
      },
      // done
      happy: {
        totalFrames: 4,
        frameDurations: [3000, 300, 1000, 1000],
        sequence: [1, 2, 3, 4, 3, 4, 3, 4, 2],
      },
      //done
      sad: {
        totalFrames: 4,
        frameDurations: [3000, 500, 500, 2000],
        sequence: [1, 2, 3, 4, 2, 3, 4, 2, 3, 4],
      },
      //done
      dead: {
        totalFrames: 1,
        frameDurations: [1000],
        sequence: [1],
      },
    },
    adult: {
      //done
      idle: {
        totalFrames: 3,
        frameDurations: [3000, 6000, 500],
        sequence: [1, 2, 3, 2, 3, 2, 3, 2, 3],
      },
      //done
      happy: {
        totalFrames: 3, // Assuming different frame count
        frameDurations: [3000, 300, 3000, 300, 3000],
        sequence: [1, 2, 3, 2, 1],
      },
      //done
      sad: {
        totalFrames: 7, // Assuming different frame count
        frameDurations: [
          3000, 300, 300, 300, 300, 1500, 1500, 1500, 1500, 1500, 1500, 300,
          300, 300,
        ],
        sequence: [1, 2, 3, 4, 5, 6, 7, 6, 7, 6, 7, 6, 5, 4],
      },
      //done
      dead: {
        totalFrames: 1,
        frameDurations: [1000],
        sequence: [1],
      },
    },
    // Add other stages as needed (child, teen, etc.)
  };

  // Memoize the current animation config to prevent unnecessary recalculations
  const currentAnimation = useMemo(() => {
    // Get stage config or default to baby
    const stageConfig = animationConfigs[stage] || animationConfigs.baby;

    // Get animation config or default to idle
    return stageConfig[animation] || stageConfig.idle;
  }, [stage, animation, animationConfigs]);

  // Load all images when animation type changes
  useEffect(() => {
    let isMounted = true;

    const preloadImages = async () => {
      setIsLoading(true);
      setImageError(false);

      const frameUrls = [];
      const loadPromises = [];

      console.log(
        `Loading ${currentAnimation.totalFrames} frames for ${stage}/${animation}`
      );

      // Create promises to preload all frames
      for (let i = 1; i <= currentAnimation.totalFrames; i++) {
        const frameNum = i.toString().padStart(2, "0");
        const url = `/dragons/${stage.toLowerCase()}/${animation.toLowerCase()}/${frameNum}.png`;
        frameUrls.push(url);

        const promise = new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.error(`Failed to load: ${url}`);
            resolve(false);
          };
        });

        loadPromises.push(promise);
      }

      try {
        // Wait for all images to load
        const results = await Promise.all(loadPromises);

        if (!isMounted) return;

        if (results.some((result) => result === false)) {
          console.error("Some frames failed to load");
          setImageError(true);
        } else {
          // Reset animation
          frameCountRef.current = frameUrls.length;
          setCurrentFrame(1);

          // Set initial frame in both image slots
          setImages([frameUrls[0], frameUrls[0]]);
          setActiveImageIndex(0);

          // Start animation timer after a small delay
          setTimeout(() => {
            if (isMounted) {
              startAnimation(frameUrls);
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error loading images:", error);
        if (isMounted) setImageError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Clear any existing animation timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    preloadImages();

    return () => {
      isMounted = false;
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [animation, stage]); // Removed currentAnimation from dependency array

  // Rest of your component remains the same...
  const startAnimation = (frameUrls) => {
    if (currentAnimation.totalFrames <= 1) return;

    // Use sequence if defined, otherwise create default sequence
    const sequence =
      currentAnimation.sequence ||
      Array.from({ length: currentAnimation.totalFrames }, (_, i) => i + 1);

    let sequenceIndex = 0;

    const animateNextFrame = () => {
      // Get current frame from sequence (1-based)
      const currentSequenceFrame = sequence[sequenceIndex];

      // Convert to 0-based for array access
      const frameIndex = currentSequenceFrame - 1;

      if (frameIndex >= frameUrls.length) {
        console.error(
          `Frame index ${frameIndex} out of bounds (max: ${
            frameUrls.length - 1
          })`
        );
        sequenceIndex = (sequenceIndex + 1) % sequence.length;
        animationTimerRef.current = setTimeout(animateNextFrame, 500);
        return;
      }

      console.log(
        `[${stage}/${animation}] Showing frame ${currentSequenceFrame}/${currentAnimation.totalFrames} for ${currentAnimation.frameDurations[frameIndex]}ms`
      );

      // Update the inactive image with current frame's source
      const inactiveIndex = activeImageIndex === 0 ? 1 : 0;
      const updatedImages = [...images];
      updatedImages[inactiveIndex] = frameUrls[frameIndex];
      setImages(updatedImages);

      // Switch active image (causes crossfade)
      setActiveImageIndex(inactiveIndex);

      // Update current frame for display purposes
      setCurrentFrame(currentSequenceFrame);

      // Calculate the next sequence index
      const nextSequenceIndex = (sequenceIndex + 1) % sequence.length;

      // Get duration for the CURRENT frame (not the next one)
      const frameDuration = currentAnimation.frameDurations[frameIndex] || 500;

      // Move to next position in sequence
      sequenceIndex = nextSequenceIndex;

      // Schedule next animation using CURRENT frame's duration
      animationTimerRef.current = setTimeout(animateNextFrame, frameDuration);
    };

    // Start with the first animation frame
    animateNextFrame();
  };

  // You might want to show some static image or text if lottieAnimation is null
  return (
    <div
      onClick={onClick} // Apply the onClick handler to the main wrapper
      className="dragon-container cursor-pointer" // Add cursor-pointer if appropriate
      role="button" // Add role for accessibility if it's interactive
      tabIndex={onClick ? 0 : -1} // Make it focusable if clickable
      onKeyDown={
        onClick
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick()
          : undefined
      } // Keyboard accessibility
      aria-label={onClick ? "Dragon, click to interact" : "Dragon display"}
    >
      <div className="w-44 h-44 flex justify-center items-center md:h-64 md:w-64">
        <div className="text-center w-full">
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-goldenrod"></div>
            </div>
          )}

          {/* Dragon animation with cross-fade using TWO images only */}
          {!isLoading && !imageError && (
            <div className="h-48 relative flex justify-center items-center">
              {/* Image A - First slot */}
              <img
                src={images[0]}
                alt={`Dragon frame ${
                  activeImageIndex === 0 ? "active" : "inactive"
                }`}
                className="absolute max-w-full max-h-48"
                style={{
                  opacity: activeImageIndex === 0 ? 1 : 0,
                  transition: "opacity 0.1s ease-in-out",
                }}
              />

              {/* Image B - Second slot */}
              <img
                src={images[1]}
                alt={`Dragon frame ${
                  activeImageIndex === 1 ? "active" : "inactive"
                }`}
                className="absolute max-w-full max-h-48"
                style={{
                  opacity: activeImageIndex === 1 ? 1 : 0,
                  transition: "opacity 0.1s ease-in-out",
                }}
              />

              {/* Invisible placeholder to maintain height */}
              <div className="invisible max-w-full max-h-48"></div>
            </div>
          )}

          {/* Error fallback */}
          {!isLoading && imageError && (
            <div className="h-48 flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl"
              >
                🐉
              </motion.div>
            </div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-goldenrod mt-4 font-bold"
          >
            Level {level}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

DragonDisplay.propTypes = {
  level: PropTypes.number.isRequired,
  stage: PropTypes.string,
  animation: PropTypes.string,
  name: PropTypes.string,
};

export default DragonDisplay;
