'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

interface Slide {
  title: string;
  description: string;
  icon: string;
}

const slides: Slide[] = [
  {
    title: 'Welcome to Todo PWA',
    description: 'A simple todo list you can install on your phone or use in the browser. Add tasks, view by today or week, and check them off.',
    icon: '👋',
  },
  {
    title: 'Secure & Fast',
    description: 'Your data is synced securely. Works offline and loads quickly so you can focus on getting things done.',
    icon: '🔒',
  },
  {
    title: 'Get Started',
    description: 'Sign in or create an account to start adding and managing your todos.',
    icon: '🚀',
  },
];

export function WelcomeSlides() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentSlide(currentSlide + 1);
          setIsTransitioning(false);
        }, 300);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      trackEvent({ name: ANALYTICS_EVENTS.WELCOME_STEPS_COMPLETED });
      router.push('/sign-up');
    }
  };

  const handleSkip = () => {
    trackEvent({ name: ANALYTICS_EVENTS.WELCOME_STEPS_SKIPPED });
    router.push('/sign-in');
  };

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="flex w-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Skip button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div
          className={`text-center transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-6xl mb-6">{slide.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:text-3xl">
            {slide.title}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">{slide.description}</p>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <button
          onClick={handleNext}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] touch-manipulation transition-colors"
        >
          {isLastSlide ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
