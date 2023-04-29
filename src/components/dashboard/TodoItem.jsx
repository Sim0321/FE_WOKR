import { GetCompletionTodo } from '../../apis/apiGET';
import { PatchCheck } from '../../apis/apiPATCH';
import blue from '../../assets/todoBlue.png';
import red from '../../assets/todoRed.png';
import yellow from '../../assets/todoYellow.png';
import { patchTodoInfo } from '../../store/store';
import Toast from '../global/Toast';
import Potal from '../global/globalModal/Potal';
import TodoPathModal from '../global/globalModal/TodoPathModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import ReactGA from 'react-ga4';
import { toast } from 'react-toastify';
import { useSetRecoilState } from 'recoil';

const TodoItem = ({ getTodo }) => {
  const queryClient = useQueryClient();

  // filter 함수 사용
  const now = new Date();
  const filterArray = getTodo?.filter(el => {
    if (el.completion === false) {
      // return el;
      if (new Date(now.setDate(now.getDate())) < new Date(el.startDate)) {
        return null;
      } else if (
        new Date(el.startDate).getMonth() === now.getMonth() &&
        new Date(el.startDate).getDate() === now.getDate()
      ) {
        return el;
      } else {
        return el;
      }
    } else {
      return null;
    }
  });
  // console.log(filterArray);

  // 체크 수정
  const { mutate: patchCheckmutate } = useMutation(PatchCheck, {
    onSuccess: response => {
      if (process.env.NODE_ENV !== 'development') {
        ReactGA.event({
          category: '버튼',
          action: 'TODO 완료',
        });
      }
      queryClient.invalidateQueries(['TODO']);
      queryClient.invalidateQueries(['completionTodo']);
    },
    onError: response => {},
  });

  const Check = ({ el }) => {
    const onClickCheck = () => {
      const id = el.toDoId;
      patchCheckmutate({ id });
      toast('할 일을 완료했습니다.');
    };

    return <div className='check' onClick={onClickCheck} />;
  };

  const Priority = ({ el }) => {
    if (el.priority === 1) {
      return <img className='priority' src={red} alt='' />;
    } else if (el.priority === 2) {
      return <img className='priority' src={yellow} alt='' />;
    } else if (el.priority === 3) {
      return <img className='priority' src={blue} alt='' />;
    } else {
      return;
    }
  };

  const [todoModalOn, setTodoModalOn] = useState(false);

  const onTodoCloseModal = () => {
    setTodoModalOn(!todoModalOn);
  };

  const setPatchTodoInfo = useSetRecoilState(patchTodoInfo);

  const patchTodo = (
    id,
    toDo,
    memo,
    startDate,
    startDateTime,
    endDate,
    endDateTime,
    priority
  ) => {
    // console.log(todo);
    setPatchTodoInfo({
      id,
      toDo,
      memo,
      startDate,
      startDateTime,
      endDate,
      endDateTime,
      priority,
    });
    setTodoModalOn(!todoModalOn);
  };

  const { data: getCompletionTodo } = useQuery(
    ['completionTodo'],
    GetCompletionTodo,
    {
      onSuccess: response => {
        // console.log('completionTodo', response);
      },
      onError: response => {},
    }
  );
  return (
    <>
      {filterArray?.map(el => (
        <div className='todo' key={el.toDoId}>
          <Check el={el} />
          <div className='title' style={{ color: el.color }}>
            {el.keyResultId === null ? 'None' : `KR${el.krNumber}`}
          </div>
          <div className='detail'>
            <div
              className='nameDate'
              onClick={() => {
                patchTodo(
                  el.toDoId,
                  el.toDo,
                  el.memo,
                  el.startDate,
                  el.startDateTime,
                  el.endDate,
                  el.endDateTime,
                  el.priority
                );
              }}>
              <div className='todoName'>{el.toDo}</div>
              <div className='memo'>
                {el.memo === '' ? '메모가 없습니다.' : `${el.memo}`}
              </div>
              <p>
                {el.fstartDate} - {el.fendDate}
              </p>
            </div>
            {/* <div className='priorityBox'>
            </div> */}
          </div>
          <Priority el={el} />
        </div>
      ))}
      {/* {getCompletionTodo?.map(el => (
        <div className='todo' key={el.toDoId}>
          <div className='title' style={{ color: el.color }}>
            {el.keyResultId === null ? 'none' : `KR${el.krNumber}`}
          </div>
          <div className='detail'>
            <div className='nameDateComplitc'>
              <div
                title={el.memo}
                style={{ textDecoration: 'line-through', color: '#a9a9a9' }}>
                {el.toDo}
              </div>
              <p style={{ textDecoration: 'line-through', color: '#a9a9a9' }}>
                {el.fstartDate}~{el.fendDate}
              </p>
            </div>
            <div className='priorityBox'>
              <Priority el={el} />
              <div className='completion'></div>
            </div>
          </div>
        </div>
      ))} */}
      <Potal>
        {todoModalOn ? <TodoPathModal onCloseModal={onTodoCloseModal} /> : null}
      </Potal>
      <Toast />
    </>
  );
};

export default TodoItem;
