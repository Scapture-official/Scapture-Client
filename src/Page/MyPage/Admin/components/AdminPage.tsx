import styles from '../scss/adminPage.module.scss';

import { useState } from 'react';

import { getProfile } from '../../../../apis/api/mypage.api';
import { useQuery } from '@tanstack/react-query';
import Stadiums from './Stadiums';
import EditProfile from './EditProfile/EditProfile';
import ManagerInfo from './EditProfile/ManagerInfo';
import { getManageStadium } from '../../../../apis/api/admin.api';

const AdminPage = () => {
  // 0 구장 관리 / 1 은 예약 관리
  const [isPageOpt, setPageOpt] = useState(0);

  // true는 구장 관리 / flase 는 예약 관리
  const [isProfileAndCamera, setProfileAndCamera] = useState(0);

  // 프로필 데이터
  const { data: myProfileData, refetch } = useQuery({
    queryKey: ['myprofile'],
    queryFn: () => getProfile(),
  });

  const { data: stadiumData } = useQuery({
    queryKey: ['manageStadiums'],
    queryFn: () => getManageStadium(),
  });

  const [isEdit, setEdit] = useState<boolean>(false);

  // 프로필 변경 함수
  const changeUserInfo = async () => {
    setEdit(!isEdit);
    await refetch();
  };

  return (
    <div className={styles.test}>
      <div className={styles.myPageContainer}>
        <div id={styles.nav}>
          <div id={styles.option}>
            <div
              className={isPageOpt === 0 ? `${styles.selected}` : ''}
              onClick={() => setPageOpt(0)}
            >
              구장 관리
            </div>
            <div
              className={isPageOpt === 1 ? `${styles.selected}` : ''}
              onClick={() => setPageOpt(1)}
            >
              예약 관리
            </div>
          </div>
        </div>

        {isPageOpt === 0 ? (
          <>
            <div id={styles.profileAndCamera}>
              <div
                className={isProfileAndCamera === 0 ? `${styles.selected}` : ''}
                onClick={() => setProfileAndCamera(0)}
              >
                구장 프로필
              </div>
              <div
                className={isProfileAndCamera === 1 ? `${styles.selected}` : ''}
                onClick={() => setProfileAndCamera(1)}
              >
                카메라 제어
              </div>
            </div>
            <div className={styles.container}>
              {isEdit ? (
                <EditProfile
                  myProfileData={myProfileData}
                  changeUserInfo={changeUserInfo}
                ></EditProfile>
              ) : (
                <ManagerInfo
                  myProfileData={myProfileData}
                  changeUserInfo={changeUserInfo}
                ></ManagerInfo>
              )}
            </div>

            <div className={styles.container}>
              <div className={styles.frameTitle}>
                보유 구장
                <div>
                  {stadiumData?.data?.length ? stadiumData?.data?.length : 0}
                </div>
              </div>
              <div className={styles.section}>
                <Stadiums stadiumData={stadiumData?.data}></Stadiums>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPage;
