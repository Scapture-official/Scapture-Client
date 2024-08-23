import React from 'react';
import { AllianceStadiumDto } from '../../../apis/dto/main.dto';

import styles from '../scss/main.module.scss';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';

interface AllianceStadiumProps {
  stadiumList: AllianceStadiumDto[];
}
//css도 - props 필요
const AllianceStadium: React.FC<AllianceStadiumProps> = ({ stadiumList }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const navigate = useNavigate();

  const toStadium = (stadiumId: number) => {
    navigate('/stadium', { state: { stadiumId } });
  };

  return (
    <Slider {...settings} className={styles.stadiumList}>
      {stadiumList.map((allianceStadium: AllianceStadiumDto) => (
        <div
          className={styles.item}
          key={allianceStadium.stadiumId}
          onClick={() => toStadium(allianceStadium.stadiumId)}
        >
          <img src={allianceStadium.image} alt="" />
          <div>{allianceStadium.name}</div>
        </div>
      ))}
    </Slider>
  );
};

export default AllianceStadium;
