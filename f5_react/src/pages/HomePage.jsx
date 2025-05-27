import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {

    const [memberName, setMemberName] = useState('');
    const [test, setTest] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        
    axios.get('/HamsimProject/name')
        .then(response => {
        console.log(response);
        setMemberName(response.data);
        setLoading(false);
        })
        .catch(error => {
        setError(error);
        setLoading(false);
        });
    }, []);
    axios.post('/HamsimProject/check', {
        name: '새로운 아이템',
        price: 10000,
        description: '이것은 새로운 아이템에 대한 설명입니다.'
      })
      .then(response => {
        // 요청 성공 시 처리할 내용
        console.log('데이터 생성 성공:', response.data);
        setTest(response.data)
      })
      .catch(error => {
        // 요청 실패 시 처리할 내용
        console.error('데이터 생성 실패:', error);
      });
  return (
    <div>HomePage
        <h1>Member Name: {memberName}</h1>
        <h2>test: {test}</h2>

    </div>
  )
}

export default HomePage