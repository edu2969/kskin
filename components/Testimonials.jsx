'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const testimonials = [
  {
    name: 'Juan Pérez',
    rating: 4.5,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.'
  },
  {
    name: 'Ana García',
    rating: 5,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum et ligula in dui tempus ullamcorper. Morbi auctor laoreet lorem, non interdum mauris.'
  },
  {
    name: 'María Rodríguez',
    rating: 4,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.'
  },
  {
    name: 'Luis Hernández',
    rating: 4.5,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at bibendum orci. Morbi orci mauris, scelerisque sed, suscipit et, commodo quis, arcu. Proin ullamcorper urna et felis.'
  },
  {
    name: 'Carmen Torres',
    rating: 5,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras venenatis euismod malesuada. Etiam ac neque urna. Duis vitae augue eget mi fringilla euismod.'
  },
  {
    name: 'Pedro González',
    rating: 4,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel mauris lectus. Etiam nec lectus urna. Sed sodales ultrices erat, at malesuada orci tristique ac.'
  }
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex == 0 ? 3 : (prevIndex - 1)) % (testimonials.length - 2));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (testimonials.length - 2));
  };

  const getVisibleTestimonials = () => {
    const visibleCount = 3;
    const start = currentIndex;
    const end = start + visibleCount;
    if (end <= testimonials.length) {
      return testimonials.slice(start, end);
    } else {
      return testimonials.slice(start).concat(testimonials.slice(0, end - testimonials.length));
    }
  };

  return (
    <>
    <p className="ml-12 mt-12 text-2xl text-[#EE64C5] uppercase tracking-widest">Testimonios</p>
    <div className="relative w-full flex flex-col items-center py-12 px-16 bg-white">      
      <div className="relative w-full max-w-5xl flex items-center">
        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 cursor-pointer z-10" onClick={handlePrev}>
          <IoIosArrowBack className="w-12 h-12 text-[#EE64C5]" />
        </div>
        <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 cursor-pointer z-10" onClick={handleNext}>
          <IoIosArrowForward className="w-12 h-12 text-[#EE64C5]" />
        </div>
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex space-x-8 -ml-2"
            initial={{ x: 0 }}
            animate={{ x: `-${currentIndex * (100 / 6)}%` }}
            transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
            style={{ width: `${(testimonials.length / 3) * 100}%` }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 w-1/3 mx-4 bg-[#F2F2F2] rounded-xl shadow-md"
              >
                <p className="text-[#EE64C5] text-xl font-bold uppercase mb-2">{testimonial.name}</p>
                <div className="flex mb-4 space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>
                      {i < Math.floor(testimonial.rating) ? (
                        <FaHeart className="text-[#EE64C5]" />
                      ) : (
                        i < testimonial.rating ? (
                          <FaHeart className="text-[#EE64C5] opacity-50" />
                        ) : (
                          <FaRegHeart className="text-[#EE64C5]" />
                        )
                      )}
                    </span>
                  ))}
                </div>
                <div className="relative text-gray-600 text-justify text-xs max-h-24 overflow-hidden">
                  <p className="relative" style={{ maxHeight: '90px', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <div className="w-full max-w-5xl mt-4 flex justify-center">
        <div className="relative w-full h-1 bg-gray-300 rounded-full">
          <motion.div
            className="absolute h-full bg-[#EE64C5] rounded-full"
            initial={{ left: 0 }}
            animate={{ left: `${(currentIndex % 4) * (100 / 4)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ width: `calc(100% / 4)` }}
          />
        </div>
      </div>
    </div>
    </>    
  );
};