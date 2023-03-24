import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { PatchTodo } from '../../../apis/apiPATCH';
import trash from '../../../assets/trash.png';
import {
  patchTodoInfo,
  ToggleEndState,
  ToggleStartState,
} from '../../../store/store';
import {
  ModalBackground,
  ModalBox,
  OKRBox,
  ToggleContainer,
} from './modal.styled';
import close from '../../../assets/close.png';
import todoOkr from '../../../assets/todoOKR.png';
import todo from '../../../assets/todoTODO.png';
import memo from '../../../assets/memo.png';
import calender from '../../../assets/calender.png';
import OkrDropDown from './../globaldropdown/OkrDropDown';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import transition from 'react-element-popper/animations/transition';
import opacity from 'react-element-popper/animations/opacity';
import { OnChange } from '../onChange';
import PriorityDropDown from '../globaldropdown/PriorityDropDown';
import Toast from '../Toast';
import { toast } from 'react-toastify';
import PatchPriority from './../globaldropdown/PatchPriority';
import { DeleteTodo } from '../../../apis/apiDELETE';

const TodoPathModal = ({ onCloseModal }) => {
  useEffect(() => {
    // 현재 위치에 고정시킴
    document.body.style.cssText = `
      position: fixed;
      top: -${window.scrollY}px;
      overflow-y: scroll;
      width: 100%;`;
    return () => {
      // 모달이 false면 style을  지우고 원래 있던 위치로 돌려주기
      const scrollY = document.body.style.top;
      document.body.style.cssText = '';
      //-숫자px 형식으로나와서 파싱 후 음수를 정수로 바꾸기 위해 *-1
      window.scrollTo(0, parseInt(scrollY, 10) * -1);
    };
  }, []);
  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const [timeFormat, setTimeFormat] = useState({ format: 'YYYY-MM-DD HH:mm' });
  const [defaultFormat, setDefaultFormat] = useState({ format: 'YYYY-MM-DD' });

  const todoInfo = useRecoilValue(patchTodoInfo);
  console.log(todoInfo);

  const [title, setTitle] = useState({
    memo: todoInfo.memo,
    priority: todoInfo.priority,
    endDate: todoInfo.endDate,
    endDateTime: todoInfo.endDateTime,
    startDate: todoInfo.startDate,
    startDateTime: todoInfo.startDateTime,
    toDo: todoInfo.toDo,
  });
  // console.log(title);

  const [startWithTime, setStartWithTime] = useState(false);
  const [endWithTime, setEndWithTime] = useState(false);

  const convertStart = (date, format = defaultFormat.format) => {
    let object = { date, format };
    setDefaultFormat(new DateObject(object).format());

    setTitle({
      ...title,
      startDate: new DateObject(object).format(),
      startDateTime: '00:00',
    });
  };

  //endDate 변환 함수 년-월
  const convertEnd = (date, format = defaultFormat.format) => {
    let object = { date, format };
    setDefaultFormat(new DateObject(object).format());

    setTitle({
      ...title,
      endDate: new DateObject(object).format(),
      endDateTime: '00:00',
    });
  };

  // startDateWithTime 변환 함수 년, 월 시:분
  const convertStartWithTime = (date, format = timeFormat.format) => {
    let object = { date, format };
    // console.log(new DateObject(object).format());
    setTimeFormat(new DateObject(object).format());
    // console.log('start :', new DateObject(object).format());

    setTitle({
      ...title,
      startDate: new DateObject(object).format().split(' ')[0],
      startDateTime: new DateObject(object).format().split(' ')[1],
    });
  };

  // endDateWithTime 변환 함수 년, 월 시:분
  const convertEndWithTime = (date, format = timeFormat.format) => {
    let object = { date, format };
    // console.log(object);
    setTimeFormat(new DateObject(object).format());
    // console.log(new DateObject(object).format());
    setTitle({
      ...title,
      endDate: new DateObject(object).format().split(' ')[0],
      endDateTime: new DateObject(object).format().split(' ')[1],
    });
  };

  const [isStartOn, setIsStartOn] = useRecoilState(ToggleStartState);
  const [isEndOn, setIsEndOn] = useRecoilState(ToggleEndState);

  const startHandler = () => {
    setIsStartOn(!isStartOn);
    setStartWithTime(!startWithTime);
  };

  const endHandler = () => {
    setIsEndOn(!isEndOn);
    setEndWithTime(!endWithTime);
  };

  const queryClient = useQueryClient();

  const { mutate: patchTodo } = useMutation(PatchTodo, {
    onSuccess: response => {
      queryClient.invalidateQueries(['TODO']);
      console.log('response :', response);
    },
    onError: response => {},
  });

  // const [oid, setOid] = useState(0);
  // const [kid, setKid] = useState(0);

  const patchT = () => {
    const startd = new Date(title.startDate);
    const endd = new Date(title.endDate);

    if (title.startDate.length === 10) {
      setTitle({ ...title, startDateTime: '00:00' });
    }

    if (title.toDo === '') {
      return toast('To Do는 필수 입니다.');
    } else if (title.toDo.length > 30) {
      return toast('To Do는 30글자 미만이어야합니다.');
    } else if (title.memo.length > 30) {
      return toast('메모는 30글자 미만이어야합니다.');
    } else if (title.startDate === '') {
      return toast('시작일을 설정해주세요.');
    } else if (title.endDate === '') {
      return toast('종료일을 설정해주세요.');
    } else if (endd < startd) {
      return toast('종료일은 시작일보다 빠르게 설정할 수 없습니다.');
    } else {
      let id = todoInfo.id;
      let value = title;
      console.log(id, value);
      patchTodo({ id, value });
      // createTodo({ Oid, Kid, Info });
      toast('해당 To Do가 수정되었습니다.');
      onCloseModal();
    }
  };
  console.log('title :', title);
  console.log('todoInfo :', todoInfo);

  const { mutate: deleteTodo } = useMutation(DeleteTodo, {
    onSuccess: response => {
      queryClient.invalidateQueries(['TODO']);
      onCloseModal();
      toast('해당 To Do가 삭제가 완료되었습니다.');
    },
    onError: response => {
      alert('팀장 및 본인이 작성한 OKR만 수정가능합니다.');
    },
  });

  return (
    <>
      <ModalBackground />
      <ModalBox>
        <div className='header'>
          <h2>To Do 수정</h2>
          <img src={close} alt='' onClick={onCloseModal} />
        </div>
        <OKRBox>
          <div className='object itemBox'>
            <img src={todoOkr} alt='' />
            <OkrDropDown title={title} />
          </div>

          <div className='object itemBox'>
            <img src={todo} alt='' />
            <input
              type='text'
              placeholder='To Do 내용을 작성하세요'
              className='input'
              name='toDo'
              defaultValue={title.toDo}
              onChange={e => {
                setTitle({ ...title, toDo: e.target.value });
              }}
            />
          </div>

          <div className='object itemBox'>
            <img src={memo} alt='' />
            <input
              type='text'
              placeholder='Momo 내용을 작성하세요'
              className='input'
              name='memo'
              defaultValue={title.memo}
              onChange={e => {
                setTitle({ ...title, memo: e.target.value });
              }}
            />
          </div>

          <div className='date'>
            <img src={calender} alt='' />
            <div className='dateBox'>
              {!startWithTime ? (
                //시작시간이 false일 때
                <DatePicker
                  inputClass='start-input'
                  containerClassName='start-container'
                  months={months}
                  weekDays={weekDays}
                  format='YYYY-MM-DD'
                  placeholder='시작일'
                  defaultValue={title.startDate}
                  // value={defaultFormat.date}
                  onChange={convertStart}
                  animations={[
                    opacity(),
                    transition({
                      from: 40,
                      transition:
                        'all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)',
                    }),
                  ]}>
                  <div className='border' />
                  <div className='timeBox'>
                    <span>시간 포함</span>
                    <ToggleContainer onClick={startHandler}>
                      <div
                        className={`toggle-container ${
                          startWithTime ? 'toggle--checked' : null
                        }`}
                      />
                      <div
                        className={`toggle-circle ${
                          startWithTime ? 'toggle--checked' : null
                        }`}
                      />
                    </ToggleContainer>
                  </div>
                </DatePicker>
              ) : (
                //시작 시간이 true 일때 (시,분 나옴)
                <DatePicker
                  inputClass='start-input'
                  containerClassName='start-container'
                  months={months}
                  weekDays={weekDays}
                  format='YYYY-MM-DD HH:mm'
                  plugins={[<TimePicker position='bottom' hideSeconds />]}
                  placeholder='시작일'
                  value={timeFormat.date}
                  onChange={convertStartWithTime}
                  animations={[
                    opacity(),
                    transition({
                      from: 40,
                      transition:
                        'all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)',
                    }),
                  ]}>
                  <div className='border' />
                  <div className='timeBox'>
                    <span>시간 포함</span>
                    <ToggleContainer onClick={startHandler}>
                      <div
                        className={`toggle-container ${
                          startWithTime ? 'toggle--checked' : null
                        }`}
                      />
                      <div
                        className={`toggle-circle ${
                          startWithTime ? 'toggle--checked' : null
                        }`}
                      />
                    </ToggleContainer>
                  </div>
                </DatePicker>
              )}

              {!endWithTime ? (
                <DatePicker
                  inputClass='end-input'
                  containerClassName='end-container'
                  months={months}
                  weekDays={weekDays}
                  format='YYYY-MM-DD'
                  placeholder='종료일'
                  value={defaultFormat.date}
                  onChange={convertEnd}
                  animations={[
                    opacity(),
                    transition({
                      from: 40,
                      transition:
                        'all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)',
                    }),
                  ]}>
                  <div className='border' />
                  <div className='timeBox'>
                    <span>시간 포함</span>
                    <ToggleContainer onClick={endHandler}>
                      <div
                        className={`toggle-container ${
                          endWithTime ? 'toggle--checked' : null
                        }`}
                      />
                      <div
                        className={`toggle-circle ${
                          endWithTime ? 'toggle--checked' : null
                        }`}
                      />
                    </ToggleContainer>
                  </div>
                </DatePicker>
              ) : (
                <DatePicker
                  inputClass='end-input'
                  containerClassName={
                    !endWithTime ? 'end-container' : 'end-container-time'
                  }
                  months={months}
                  weekDays={weekDays}
                  format='YYYY-MM-DD HH:mm'
                  plugins={[<TimePicker position='bottom' hideSeconds />]}
                  placeholder='종료일'
                  value={timeFormat.date}
                  onChange={convertEndWithTime}
                  animations={[
                    opacity(),
                    transition({
                      from: 40,
                      transition:
                        'all 400ms cubic-bezier(0.335, 0.010, 0.030, 1.360)',
                    }),
                  ]}>
                  <div className='border' />
                  <div className='timeBox'>
                    <span>시간 포함</span>
                    <ToggleContainer onClick={endHandler}>
                      <div
                        className={`toggle-container ${
                          endWithTime ? 'toggle--checked' : null
                        }`}
                      />
                      <div
                        className={`toggle-circle ${
                          endWithTime ? 'toggle--checked' : null
                        }`}
                      />
                    </ToggleContainer>
                  </div>
                </DatePicker>
              )}
            </div>
            <div className='priorityBox'>
              <PatchPriority setTitle={setTitle} title={title} />
              {/* <PriorityDropDown todoInfo={todoInfo} setTodoInfo={setTodoInfo} /> */}
            </div>
          </div>
        </OKRBox>

        <div className='btnBox'>
          <button onClick={onCloseModal} className='cancel'>
            취소
          </button>
          {/* <button className='next' onClick={createT}> */}
          <button className='next' onClick={patchT}>
            저장
          </button>
          <div
            className='deleteTodo'
            onClick={() => {
              deleteTodo(todoInfo.id);
            }}>
            <img className='deleteImg' src={trash} alt='' />
            <p className='deleteName'>삭제</p>
          </div>
        </div>

        {/* <Toast /> */}
      </ModalBox>
    </>
  );
};

export default TodoPathModal;
