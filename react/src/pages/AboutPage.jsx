import React from 'react'

const AboutPage = () => {
  return (
    <div>
      <div style={{ background: '#ffffff', padding: '60px', fontFamily: 'Abel-Regular, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#101750', fontSize: '36px', marginBottom: '20px' }}>
        ‘______________’ 검색결과 입니다.
      </h2>

      <h3 style={{ color: '#000000', fontSize: '36px', marginTop: '40px' }}>BEST 추천</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', marginTop: '40px' }}>
        {/* 상품 1 */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <img
            src="image-40.png"
            alt="AMD 라이젠5-6세대"
            style={{ width: '208px', height: '208px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', color: '#111c85' }}>
              AMD 라이젠5-6세대 9600X (그래니트 릿지) (멀티팩(정품))
            </div>
          </div>
          <img src="group-3190.svg" alt="리뷰" style={{ width: '94px', height: '24px' }} />
          <div style={{ fontSize: '15px', fontStyle: 'italic', color: '#111c85' }}>385,970원</div>
        </div>

        {/* 상품 2 */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <img
            src="image0.png"
            alt="ASUS PRIME B650M-A II"
            style={{ width: '208px', height: '208px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', color: '#111c85' }}>
              ASUS PRIME B650M-A II 대원씨티에스
            </div>
          </div>
          <img src="group-3191.svg" alt="리뷰" style={{ width: '94px', height: '24px' }} />
          <div style={{ fontSize: '15px', fontStyle: 'italic', color: '#111c85' }}>154,000원</div>
        </div>

        {/* 여기에 더 많은 상품들 추가 가능 */}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#fafbff',
          padding: '20px',
          marginTop: '80px',
        }}
      >
        <div style={{ fontSize: '40px', fontStyle: 'italic', color: '#000' }}>
          총 가격 1,850,200원
        </div>
      </div>
    </div>
  </div>
  )
}

export default AboutPage