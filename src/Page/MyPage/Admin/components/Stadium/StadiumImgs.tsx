import React from 'react';
import styles from '../../scss/stadium.module.scss';
import TestImg from '../../../image/test.png';

interface StadiumImgsProps {
  stadiumImages: any;
}

const StadiumImgs: React.FC<StadiumImgsProps> = ({ stadiumImages }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <div className={styles.mainTitle}>구장 이미지</div>
        <div className={styles.change}>수정</div>
      </div>

      <div className={styles.imgSection}>
        <div className={styles.subTitle}>대표 이미지</div>
        {stadiumImages?.representImage ? (
          <img
            src={stadiumImages?.representImage?.url}
            alt=""
            width="100%"
            height="210px"
          />
        ) : (
          <img src={TestImg} alt="" width="100%" height="210px" />
        )}
      </div>
      <div className={styles.imgSection}>
        <div className={styles.subTitle}>세부 이미지</div>
        <div className={styles.images}>
          {stadiumImages?.images?.map((imgData: any) => {
            <div>
              <img
                src={imgData?.url}
                alt=""
                width="31%"
                height="118px"
                id={styles.representaion}
              />
            </div>;
          })}

          {/* <div>
            <img
              src={TestImg}
              alt=""
              width="31%"
              height="118px"
              id={styles.representaion}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StadiumImgs;
