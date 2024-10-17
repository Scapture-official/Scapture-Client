import { useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';

// api
import {
  getStadiumDetail,
  getVideoDetail,
  likesVideo,
  unLikeVideo,
} from '../../../apis/api/stadium.api';
import {
  checkAuthDownloadVideo,
  // downloadVideo,
  storeVideo,
  unStoreVideo,
} from '../../../apis/api/video.api';

// components
import Header from '../../Header/components/Header';
import Footer from '../../Footer/components/Footer';
import Heart from './Heart';
import BookMark from './BookMark';
import { VideoModal } from './VideoModal';
import { LoginModal } from '../../Header/components/LoginModal';
import SelectInfoBox from '../../Stadium/components/SelectInfoBox';

// scss
import styles from '../scss/video.module.scss';
import modal from '../scss/video-modal.module.scss';
import loginModal from '../../Header/scss/login-modal.module.scss';

// svg
// import download from '../../../assets/Icon/downLoadIcon.svg';
// import share from '../../../assets/Icon/shareIcon.svg';

// dto
import { StadiumDetail, VideoDetail } from '../../../apis/dto/scapture.dto';

// func
import { modalNotice } from '../functions/ModalFunction';

// config
import {
  GOOGLE_AUTH_URL,
  KAKAO_AUTH_URL,
  NAVER_AUTH_URL,
} from '../../../apis/config/login.config';

// atom
import { loginData, loginDataAtom } from '../../Header/Atom/atom';

export interface PrevSelectDataProps {
  month: string;
  day: string;
  prevFieldId: string;
  prevScheduleId: number;
}

const Video = () => {
  //Object
  const AUTH_URLS = {
    kakao: KAKAO_AUTH_URL,
    google: GOOGLE_AUTH_URL,
    naver: NAVER_AUTH_URL,
  };

  const modalRef = useRef<HTMLDialogElement>(null);
  const loginModalRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stadiumId = searchParams.get('stadiumId') || location.state.stadiumId;

  const videoId = searchParams.get('videoId') || location.state.videoId;

  const month = searchParams.get('month') || location.state.month;
  const day = searchParams.get('day') || location.state.day;
  const prevFieldId =
    searchParams.get('prevFieldId') || location.state.prevFieldId;
  const prevScheduleId =
    Number(searchParams.get('prevScheduleId')) || location.state.prevScheduleId;

  const prevSelectDataProps = {
    month,
    day,
    prevFieldId,
    prevScheduleId,
  };

  const { data: stadiumDetail } = useQuery({
    queryKey: ['stadiumDetail', stadiumId],
    queryFn: () => getStadiumDetail(stadiumId),
    initialData: {} as StadiumDetail,
  });

  const { data: videoDetail, isSuccess: isVideoDetailSuccess } = useQuery({
    queryKey: ['videoDetail', videoId],
    queryFn: () => getVideoDetail(videoId),
    initialData: {} as VideoDetail,
  });

  // const handelOpenDownloadModal = () => {
  //   modalNotice(modalRef);
  // };

  const isLoginState = useRecoilValue<loginData>(loginDataAtom);

  // 다운로드 기능
  const handleDownloadClick = async () => {
    try {
      const authResponse = await checkAuthDownloadVideo(videoId);

      if (authResponse.status === 200) {
        fetch(`${videoDetail.video}`, {
          method: 'GET',
        })
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.setAttribute('href', url);
            link.setAttribute('download', `${videoDetail.name}.mp4`);

            document.body.appendChild(link);

            link.click();

            link.parentNode?.removeChild(link);

            window.URL.revokeObjectURL(url);
          });
      } else if (authResponse.status === 402) {
        alert('버내너가 부족합니다!');
      } else if (authResponse.status === 404 || authResponse.status === 400) {
        modalNotice(loginModalRef);
      }
    } catch (error) {
      console.error('비디오 다운로드 중 오류가 발생했습니다.', error);
    } finally {
      modalRef.current?.close(); // 다운로드 완료 후 모달 닫기
    }
  };

  // useMutation 훅을 사용하여 좋아요/좋아요 취소 처리
  const { mutate: toggleLike } = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await likesVideo(videoId);
      if (res.status == 400 || res.status == 403) {
        modalNotice(loginModalRef);
      }
    },
    onSuccess: () => {
      // 비디오 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ['videoDetail', videoId],
      });
    },
    onError: error => {
      console.error('좋아요 처리 중 오류가 발생했습니다.', error);
    },
  });

  const { mutate: toggleUnLike } = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await unLikeVideo(videoId);
      if (res.status == 400 || res.status == 403) {
        modalNotice(loginModalRef);
      }
    },
    onSuccess: () => {
      // 비디오 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ['videoDetail', videoId],
      });
    },
    onError: error => {
      console.error('좋아요 처리 중 오류가 발생했습니다.', error);
    },
  });

  // 좋아요를 눌렀을 때 처리
  const handleToggleLike = (isLiked: boolean) => {
    if (isLoginState) {
      if (videoDetail && !isLiked) {
        toggleLike(videoId);
      } else if (videoDetail && isLiked) {
        toggleUnLike(videoId);
      }
    } else {
      modalNotice(loginModalRef);
    }
  };

  // useMutation 훅을 사용하여 영상 저장/해제 처리
  const { mutate: toggleStore } = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await storeVideo(videoId);
      if (res.status == 400 || res.status == 403) {
        modalNotice(loginModalRef);
      }
    },
    onSuccess: () => {
      // 비디오 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ['videoDetail', videoId],
      });
    },
    onError: error => {
      console.error('영상 저장 중 오류가 발생했습니다.', error);
    },
  });

  const { mutate: toggleUnStore } = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await unStoreVideo(videoId);
      if (res.status == 400 || res.status == 403) {
        modalNotice(loginModalRef);
      }
    },
    onSuccess: () => {
      // 비디오 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: ['videoDetail', videoId],
      });
    },
    onError: error => {
      console.error('영상 저장 해제 중 오류가 발생했습니다.', error);
    },
  });

  // 북마크를 눌렀을 때 처리
  const handleToggleStore = (isStore: boolean) => {
    if (isLoginState) {
      if (videoDetail && !isStore) {
        toggleStore(videoId);
      } else if (videoDetail && isStore) {
        toggleUnStore(videoId);
      }
    } else {
      modalNotice(loginModalRef);
    }
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/video?stadiumId=${stadiumId}&videoId=${videoId}&day=${day}&month=${month}&prevFieldId=${prevFieldId}&prevScheduleId=${prevScheduleId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert('링크가 클립보드에 복사되었습니다!');
      })
      .catch(err => {
        console.error('링크 복사 중 오류 발생:', err);
      });
  };

  // const [isBlobUrl, setBlobUrl] = useState('');

  // const loadVideo = async () => {
  //   try {
  //     if (isBlobUrl) {
  //       // 기존 Blob URL을 해제하여 메모리 누수 방지
  //       URL.revokeObjectURL(isBlobUrl);
  //       setBlobUrl('');
  //     }

  //     // 비디오 데이터를 모두 다운로드
  //     const response = await fetch(videoDetail.video);
  //     const blob = await response.blob();
  //     const url = URL.createObjectURL(blob);

  //     const videoElement = document.getElementById(
  //       'videoPlayer',
  //     ) as HTMLVideoElement;

  //     if (videoElement) {
  //       videoElement.src = url;

  //       // 비디오가 끝까지 재생된 후 Blob URL 해제
  //       videoElement.onended = () => {
  //         URL.revokeObjectURL(url);
  //         setBlobUrl(''); // 해제 후 상태 초기화
  //       };
  //     }

  //     // 새로운 Blob URL 상태 설정
  //     setBlobUrl(url);
  //   } catch (error) {
  //     console.error('비디오 로딩 중 오류가 발생했습니다.', error);
  //   }
  // };

  // useEffect(() => {
  //   if (videoDetail && videoDetail.video) {
  //     loadVideo();
  //   }
  // }, [videoDetail]);

  // const loadVideo = async () => {
  //   try {
  //     if (isBlobUrl) {
  //       // 기존 Blob URL을 해제하여 메모리 누수 방지
  //       URL.revokeObjectURL(isBlobUrl);
  //       setBlobUrl('');
  //     }

  //     // 비디오 데이터를 다운로드
  //     const response = await fetch(videoDetail.video);
  //     const blob = await response.blob();
  //     const url = URL.createObjectURL(blob);

  //     const videoElement = document.getElementById(
  //       'videoPlayer',
  //     ) as HTMLVideoElement;

  //     if (videoElement) {
  //       videoElement.src = url;
  //     }

  //     // 새로운 Blob URL 상태 설정
  //     setBlobUrl(url);
  //   } catch (error) {
  //     console.error('비디오 로딩 중 오류가 발생했습니다.', error);
  //   }
  // };

  // useEffect(() => {
  //   if (videoDetail && videoDetail.video) {
  //     loadVideo();
  //   }

  //   return () => {
  //     if (isBlobUrl) {
  //       // 컴포넌트 언마운트 시 Blob URL 해제
  //       URL.revokeObjectURL(isBlobUrl);
  //     }
  //   };
  // }, [videoDetail]);

  return (
    <div className={styles.test}>
      <Header index={2} />
      <div className={styles.community}>
        {isVideoDetailSuccess && videoDetail && videoDetail.video ? (
          <div className={styles.videoContainer}>
            <div className={styles.video}>
              <video
                id="videoPlayer"
                controls
                controlsList="nodownload"
                src={videoDetail.video}
                onContextMenu={e => e.preventDefault()}
              ></video>
            </div>
            <div className={styles.group}>
              <div className={styles.title}>{videoDetail.name}</div>
              <div className={styles.videoOpt}>
                <ul className={styles.icons}>
                  <Heart
                    id={videoId}
                    isLiked={videoDetail.isLiked}
                    likeCount={videoDetail.likeCount}
                    onToggleLike={handleToggleLike}
                  />

                  <BookMark
                    stored={videoDetail.isStored}
                    onToggleStore={handleToggleStore}
                  ></BookMark>

                  {/* <li onClick={handelOpenDownloadModal}>
                  <img src={download} alt="" width="20px" height="20px"></img>
                  <p>다운로드</p>
                </li> */}
                  {/* <li>
                  <img src={share} alt="" width="20px" height="20px"></img>
                  <p>공유</p>
                </li> */}
                </ul>
                <div id={styles.shareVideo} onClick={handleShareClick}>
                  영상 공유하기
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}

        <SelectInfoBox
          stadiumDetail={stadiumDetail}
          stadiumId={stadiumId}
          prevSelectDataProps={prevSelectDataProps}
        ></SelectInfoBox>

        {/* <div className={styles.paging}>
          <img src={leftArrow} alt=""></img>
          <div className={styles.pageNum}>1</div>
          <img src={rightArrow} alt=""></img>
        </div> */}

        <VideoModal
          styles={modal}
          ref={modalRef}
          handleDownloadClick={handleDownloadClick}
        />
        <LoginModal
          styles={loginModal}
          AUTH_URLS={AUTH_URLS}
          modalRef={loginModalRef}
        ></LoginModal>
      </div>
      <Footer />
    </div>
  );
};

export default Video;
