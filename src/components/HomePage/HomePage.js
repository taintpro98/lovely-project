import React, { useState, useEffect, useRef } from 'react';
import CanvasHeart from '../CanvasHeart/CanvasHeart';

import './HomePage.css';

function HomePage() {
  const [isVisible, setIsVisible] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const showNoDivTimeout = setTimeout(() => {
      setIsVisible(2);
    }, 10000);
    const showYesDivTimeout = setTimeout(() => {
      setIsVisible(1);
    }, 15000);

    window.onload = () => {
      const audioElement = audioRef.current;
      if (audioElement && audioElement.autoplay) {
        audioElement.play().catch(error => {
          console.error('Autoplay failed:', error);
        });
      }
    };

    return () => {
      window.onload = null;
      clearTimeout(showYesDivTimeout);
      clearTimeout(showNoDivTimeout);
    };
  }, []); // Dependency rỗng đảm bảo useEffect chỉ chạy một lần khi component được render

  const dochettinnhant = 'Em đốm đọc hết tin nhắn của anh rồi hẵng bấm nha';
  const chucmung = 'Chúc mừng em đốm đã có lựa chọn chính xác';

  return (
    <div className="HomePage">
      <p class="love_you">{isVisible === 3 ? chucmung : dochettinnhant}</p>
      <audio ref={audioRef} controls autoPlay loop>
        <source src="lovexf.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
      {/* <OptionsScreen /> */}

      <CanvasHeart
        isVisible={isVisible}
        setIsVisible={setIsVisible}
      />
    </div>
  );
}

export default HomePage;
