import { GetKR, GetOKR, GetUser, GetUserInfo } from '../apis/apiGET';
import DashOKR from '../components/dashboard/DashOKR';
import DashTodo from '../components/dashboard/DashToDo';
import Menu from '../components/dashboard/Menu';
import Tutorial from '../components/dashboard/Tutorial';
import DashBoardCalendar from '../components/dashboard/calendar/Calendar';
import Portal from '../components/global/globalModal/Potal';
import {
  getOKRData,
  krDataAtom,
  teamMemberAtom,
  userId,
  userInfo,
} from '../store/store';
import { OkrContainer, StWrap } from '../styles/mainpage.styled';
import { useQuery } from '@tanstack/react-query';
import jwt_decode from 'jsonwebtoken/decode';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

export default function Mainpage() {
  const navigate = useNavigate();

  // localStorage에 accesstoken 여부 확인(리다이렉트)
  useEffect(() => {
    if (localStorage.accesstoken === undefined) {
      navigate('/signin');
    }
  }, []);

  //  accesstoken 디코딩
  const setUserInfo = useSetRecoilState(userInfo);
  const setUserId = useSetRecoilState(userId);

  const [uid, setUid] = useRecoilState(userId);
  // console.log(uid);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accesstoken')
  );

  useEffect(() => {
    const decodeToken = jwt_decode(accessToken);
    const extractedUid = decodeToken.userId;
    setUid(() => extractedUid);
  }, []);

  //userInfo
  const { userinfo } = useQuery(['userInfo'], () => GetUserInfo(uid), {
    enabled: !!uid,
    onSuccess: data => {
      // console.log(data);
      setUserInfo(data);
      sessionStorage.setItem('userId', data.userId);
      setUserId(data.userId);
    },
  });

  //okrData
  const setOkrList = useSetRecoilState(getOKRData);
  const { getokrdata } = useQuery(['OKR'], GetOKR, {
    onSuccess: data => {
      setOkrList(data);
    },
  });

  const setTeamMemberAtom = useSetRecoilState(teamMemberAtom);

  const { data: getMember } = useQuery(['MEMBER'], GetUser, {
    onSuccess: response => {
      // console.log(response);
      setTeamMemberAtom(response);
    },
    onError: response => {},
  });

  const [krdata, setKrData] = useRecoilState(krDataAtom);
  console.log(krdata);
  const { data: getKr } = useQuery(['KR'], GetKR, {
    onSuccess: response => {
      // setKrState(response);
      // console.log('response :', response);
      const filterArray = response.map(el => el.keyResultId);
      sessionStorage.setItem('kr', JSON.stringify(filterArray));
      setKrData(response);
    },
  });

  return (
    <StWrap>
      {userinfo?.firstLogin ? (
        <Portal>
          <Tutorial />
        </Portal>
      ) : (
        <>
          <aside>
            <Menu />
          </aside>

          <main>
            <OkrContainer>
              <DashOKR />
              <DashTodo />
            </OkrContainer>
            <DashBoardCalendar />
          </main>
        </>
      )}
    </StWrap>
  );
}
